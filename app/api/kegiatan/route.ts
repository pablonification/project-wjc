import { NextRequest } from 'next/server';
import { KegiatanModel } from '@/lib/models/Kegiatan';
import { kegiatanQuerySchema, kegiatanSchema } from '@/lib/validations';
import { withMiddleware, apiResponse } from '@/lib/middleware';
import { requireAuth } from '@/lib/auth';

async function handleGET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams);
  
  const validatedQuery = kegiatanQuerySchema.parse(queryParams);
  
  const {
    page,
    limit,
    status,
    category,
    startDate,
    endDate,
    isActive,
  } = validatedQuery;
  
  // Build filter object
  const filter: any = {};
  
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive;
  
  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) filter.startDate.$gte = new Date(startDate);
    if (endDate) filter.startDate.$lte = new Date(endDate);
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Execute queries
  const [kegiatan, total] = await Promise.all([
    KegiatanModel.find(filter)
      .sort({ startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    KegiatanModel.countDocuments(filter),
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return apiResponse.successWithPagination(kegiatan, {
    page,
    limit,
    total,
    totalPages,
  });
}

async function handlePOST(request: NextRequest) {
  // Require admin or editor role for creating kegiatan
  const authResult = requireAuth(request, 'editor');
  if (!authResult.success) {
    return apiResponse.unauthorized();
  }
  
  const body = await request.json();
  const validatedData = kegiatanSchema.parse(body);
  
  // Convert date strings to Date objects
  const kegiatanData = {
    ...validatedData,
    startDate: new Date(validatedData.startDate),
    endDate: new Date(validatedData.endDate),
    registrationDeadline: validatedData.registrationDeadline 
      ? new Date(validatedData.registrationDeadline)
      : undefined,
  };
  
  const kegiatan = new KegiatanModel(kegiatanData);
  await kegiatan.save();
  
  return apiResponse.success(kegiatan, 201);
}

export const GET = withMiddleware(handleGET);
export const POST = withMiddleware(handlePOST);