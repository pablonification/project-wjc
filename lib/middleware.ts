import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { formatZodErrors } from './validations';

// Rate limiting store (in production, use Redis or external service)
const rateLimit = new Map();

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const { windowMs, maxRequests, keyGenerator } = options;
  
  return (request: NextRequest): { success: boolean; error?: string } => {
    const key = keyGenerator ? keyGenerator(request) : getClientIP(request);
    const now = Date.now();
    
    // Clean up old entries
    const keysToDelete: string[] = [];
    rateLimit.forEach((data, k) => {
      if (now - data.firstRequest > windowMs) {
        keysToDelete.push(k);
      }
    });
    keysToDelete.forEach(key => rateLimit.delete(key));
    
    const clientData = rateLimit.get(key);
    
    if (!clientData) {
      rateLimit.set(key, { firstRequest: now, requests: 1 });
      return { success: true };
    }
    
    if (now - clientData.firstRequest > windowMs) {
      rateLimit.set(key, { firstRequest: now, requests: 1 });
      return { success: true };
    }
    
    if (clientData.requests >= maxRequests) {
      return { success: false, error: 'Rate limit exceeded' };
    }
    
    clientData.requests++;
    return { success: true };
  };
};

// Default rate limiter
export const defaultRateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
});

// Strict rate limiter for auth endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

// Get client IP
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
};

// API Response helpers
export const apiResponse = {
  success: <T>(data: T, status = 200) => {
    return NextResponse.json(
      { success: true, data },
      { status }
    );
  },
  
  successWithPagination: <T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    status = 200
  ) => {
    return NextResponse.json(
      { success: true, data, pagination },
      { status }
    );
  },
  
  error: (error: string, status = 400) => {
    return NextResponse.json(
      { success: false, error },
      { status }
    );
  },
  
  validationError: (errors: ZodError) => {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: formatZodErrors(errors),
      },
      { status: 400 }
    );
  },
  
  unauthorized: () => {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  },
  
  forbidden: () => {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  },
  
  notFound: (resource = 'Resource') => {
    return NextResponse.json(
      { success: false, error: `${resource} not found` },
      { status: 404 }
    );
  },
  
  serverError: (error?: string) => {
    return NextResponse.json(
      { 
        success: false, 
        error: error || 'Internal server error' 
      },
      { status: 500 }
    );
  },
};

// Error handler middleware
export const withErrorHandler = (
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) => {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ZodError) {
        return apiResponse.validationError(error);
      }
      
      if (error instanceof Error) {
        return apiResponse.serverError(error.message);
      }
      
      return apiResponse.serverError();
    }
  };
};

// Rate limiting middleware
export const withRateLimit = (
  rateLimiter = defaultRateLimiter
) => {
  return (
    handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, ...otherArgs: any[]): Promise<NextResponse> => {
      const result = rateLimiter(request);
      
      if (!result.success) {
        return apiResponse.error(result.error!, 429);
      }
      
      return handler(request, ...otherArgs);
    };
  };
};

// CORS middleware
export const withCORS = (
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) => {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const response = await handler(request, ...args);
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  };
};

// Database connection middleware
export const withDatabase = (
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) => {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Import here to avoid circular dependencies
      const connectToDatabase = (await import('./mongodb')).default;
      await connectToDatabase();
      
      return handler(request, ...args);
    } catch (error) {
      console.error('Database connection error:', error);
      return apiResponse.serverError('Database connection failed');
    }
  };
};

// Combined middleware composer
export const withMiddleware = (
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options?: {
    rateLimit?: boolean;
    rateLimiter?: (request: NextRequest) => { success: boolean; error?: string };
    cors?: boolean;
    database?: boolean;
  }
) => {
  let wrappedHandler = withErrorHandler(handler);
  
  if (options?.database !== false) {
    wrappedHandler = withDatabase(wrappedHandler);
  }
  
  if (options?.cors !== false) {
    wrappedHandler = withCORS(wrappedHandler);
  }
  
  if (options?.rateLimit !== false) {
    const limiter = options?.rateLimiter || defaultRateLimiter;
    wrappedHandler = withRateLimit(limiter)(wrappedHandler);
  }
  
  return wrappedHandler;
};