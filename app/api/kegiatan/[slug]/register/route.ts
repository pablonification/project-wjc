import { NextRequest } from 'next/server';
import { KegiatanModel } from '@/lib/models/Kegiatan';
import { RegistrationModel } from '@/lib/models/Registration';
import { registrationSchema } from '@/lib/validations';
import { withMiddleware, apiResponse, authRateLimiter } from '@/lib/middleware';
import { sendRegistrationConfirmation, sendAdminNotification } from '@/lib/email';
import { hashPassword } from '@/lib/auth';

async function handlePOST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Find the kegiatan
  const kegiatan = await KegiatanModel.findOne({ 
    slug, 
    isActive: true 
  });
  
  if (!kegiatan) {
    return apiResponse.notFound('Kegiatan');
  }
  
  // Check if registration is still open
  const now = new Date();
  if (kegiatan.registrationDeadline && kegiatan.registrationDeadline < now) {
    return apiResponse.error('Registration deadline has passed', 400);
  }
  
  if (kegiatan.status === 'Selesai') {
    return apiResponse.error('Cannot register for completed kegiatan', 400);
  }
  
  // Check if maximum participants reached
  if (kegiatan.maxParticipants) {
    const currentRegistrations = await RegistrationModel.countDocuments({
      kegiatanId: kegiatan._id.toString(),
      status: 'confirmed'
    });
    
    if (currentRegistrations >= kegiatan.maxParticipants) {
      return apiResponse.error('Maximum participants reached', 400);
    }
  }
  
  const body = await request.json();
  const validatedData = registrationSchema.parse(body);
  
  // Check for duplicate registration
  const existingRegistration = await RegistrationModel.findOne({
    kegiatanId: kegiatan._id.toString(),
    email: validatedData.email
  });
  
  if (existingRegistration) {
    return apiResponse.error('Email already registered for this kegiatan', 409);
  }
  
  // Hash password for security (in case access code is sensitive)
  const hashedPassword = await hashPassword(validatedData.password);
  
  // Create registration
  const registration = new RegistrationModel({
    kegiatanId: kegiatan._id.toString(),
    name: validatedData.name,
    email: validatedData.email,
    phone: validatedData.phone,
    accessCode: validatedData.accessCode,
    status: 'confirmed', // Auto-confirm for now
    registrationDate: new Date(),
  });
  
  await registration.save();
  
  // Update participant count
  await KegiatanModel.findByIdAndUpdate(
    kegiatan._id,
    { $inc: { currentParticipants: 1 } }
  );
  
  // Send confirmation emails
  try {
    await Promise.all([
      sendRegistrationConfirmation(registration.toObject(), kegiatan.toObject()),
      sendAdminNotification(registration.toObject(), kegiatan.toObject()),
    ]);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Don't fail the registration if email fails
  }
  
  // Return success without sensitive data
  const response = {
    id: registration._id,
    name: registration.name,
    email: registration.email,
    phone: registration.phone,
    registrationDate: registration.registrationDate,
    status: registration.status,
    kegiatan: {
      title: kegiatan.title,
      startDate: kegiatan.startDate,
      endDate: kegiatan.endDate,
      location: kegiatan.location,
    },
  };
  
  return apiResponse.success(response, 201);
}

// Use auth rate limiter to prevent spam registrations
export const POST = withMiddleware(handlePOST, {
  rateLimiter: authRateLimiter,
});