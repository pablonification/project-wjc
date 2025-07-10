import { z } from 'zod';

// Base schemas
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Kegiatan schemas
export const kegiatanSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  content: z.string().optional(),
  slug: z.string().optional(),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['Mendatang', 'Sedang Berlangsung', 'Selesai']).default('Mendatang'),
  registrationDeadline: z.string().datetime().optional(),
  maxParticipants: z.number().min(1).optional(),
  image: z.string().url().optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const kegiatanUpdateSchema = kegiatanSchema.partial();

export const kegiatanQuerySchema = z.object({
  status: z.enum(['Mendatang', 'Sedang Berlangsung', 'Selesai']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.coerce.boolean().optional(),
}).merge(paginationSchema);

// Registration schemas
export const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number too short').max(20, 'Phone number too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  accessCode: z.string().optional(),
  terms: z.boolean().refine(val => val === true, 'Must accept terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const registrationQuerySchema = z.object({
  kegiatanId: objectIdSchema,
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
}).merge(paginationSchema);

// Berita schemas
export const beritaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt too long'),
  slug: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  publishDate: z.string().datetime('Invalid publish date'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url().optional(),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const beritaUpdateSchema = beritaSchema.partial();

export const beritaQuerySchema = z.object({
  category: z.string().optional(),
  author: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
  tags: z.string().optional(), // comma-separated
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
}).merge(paginationSchema);

// Dokumentasi schemas
export const dokumentasiSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  year: z.number().min(1900, 'Year too early').max(new Date().getFullYear() + 10, 'Year too far in future'),
  type: z.enum(['document', 'video', 'image', 'link']),
  url: z.string().url('Invalid URL'),
  fileSize: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export const dokumentasiUpdateSchema = dokumentasiSchema.partial();

export const dokumentasiQuerySchema = z.object({
  year: z.coerce.number().optional(),
  type: z.enum(['document', 'video', 'image', 'link']).optional(),
  category: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
}).merge(paginationSchema);

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'editor', 'user']).default('user'),
});

// Webhook schemas
export const datoWebhookSchema = z.object({
  entity_type: z.string(),
  event_type: z.string(),
  entity: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.any()),
  }),
});

// Generic API response schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = apiResponseSchema.extend({
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
});

// Error handling
export type ValidationError = {
  field: string;
  message: string;
};

export const formatZodErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};