import { NextRequest } from 'next/server';
import { KegiatanModel } from '@/lib/models/Kegiatan';
import { kegiatanUpdateSchema } from '@/lib/validations';
import { withMiddleware, apiResponse } from '@/lib/middleware';
import { requireAuth } from '@/lib/auth';

async function handleGET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  const kegiatan = await KegiatanModel.findOne({ 
    slug, 
    isActive: true 
  }).lean();
  
  if (!kegiatan) {
    return apiResponse.notFound('Kegiatan');
  }
  
  return apiResponse.success(kegiatan);
}

async function handlePUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Require admin or editor role for updating kegiatan
  const authResult = requireAuth(request, 'editor');
  if (!authResult.success) {
    return apiResponse.unauthorized();
  }
  
  const { slug } = params;
  const body = await request.json();
  const validatedData = kegiatanUpdateSchema.parse(body);
  
  // Convert date strings to Date objects if provided
  const updateData: any = { ...validatedData };
  if (validatedData.startDate) {
    updateData.startDate = new Date(validatedData.startDate);
  }
  if (validatedData.endDate) {
    updateData.endDate = new Date(validatedData.endDate);
  }
  if (validatedData.registrationDeadline) {
    updateData.registrationDeadline = new Date(validatedData.registrationDeadline);
  }
  
  const kegiatan = await KegiatanModel.findOneAndUpdate(
    { slug },
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!kegiatan) {
    return apiResponse.notFound('Kegiatan');
  }
  
  return apiResponse.success(kegiatan);
}

async function handleDELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Require admin role for deleting kegiatan
  const authResult = requireAuth(request, 'admin');
  if (!authResult.success) {
    return apiResponse.forbidden();
  }
  
  const { slug } = params;
  
  // Soft delete by setting isActive to false
  const kegiatan = await KegiatanModel.findOneAndUpdate(
    { slug },
    { isActive: false },
    { new: true }
  );
  
  if (!kegiatan) {
    return apiResponse.notFound('Kegiatan');
  }
  
  return apiResponse.success({ message: 'Kegiatan deleted successfully' });
}

export const GET = withMiddleware(handleGET);
export const PUT = withMiddleware(handlePUT);
export const DELETE = withMiddleware(handleDELETE);