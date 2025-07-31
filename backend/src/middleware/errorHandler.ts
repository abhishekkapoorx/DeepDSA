import { Request, Response, NextFunction } from 'express';

// Type definitions for different error types
interface ValidationError extends Error {
  errors: Record<string, any>;
}

interface MongoError extends Error {
  code?: number;
}

interface CastError extends Error {
  path?: string;
  value?: any;
}

// Custom error classes
class APIError extends Error {
    public statusCode: number;
    
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.name = "APIError"; // Set the error type to APIError
    }
  }
  
  class NotFoundError extends APIError {
    constructor(message = "Resource not found") {
      super(message, 404);
      this.name = "NotFoundError";
    }
  }
  
  class BadRequestError extends APIError {
    constructor(message = "Bad Request") {
      super(message, 400);
      this.name = "BadRequestError";
    }
  }
  
  class UnauthorizedError extends APIError {
    constructor(message = "Unauthorized") {
      super(message, 401);
      this.name = "UnauthorizedError";
    }
  }
  
  class ForbiddenError extends APIError {
    constructor(message = "Forbidden") {
      super(message, 403);
      this.name = "ForbiddenError";
    }
  }
  
  class ConflictError extends APIError {
    constructor(message = "Conflict") {
      super(message, 409);
      this.name = "ConflictError";
    }
  }
  
  class InternalServerError extends APIError {
    constructor(message = "An unexpected error occurred") {
      super(message, 500);
      this.name = "InternalServerError";
    }
  }
  
  class ValidationError extends APIError {
    constructor(message = "Validation Error") {
      super(message, 422);
      this.name = "ValidationError";
    }
  }
  
  // Async error handler
  const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) => 
    (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  // Global error handler
  const globalErrorhandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error stack
  
    // Handling specific APIError types
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({
        status: "Error",
        message: err.message,
      });
    }
  
    // Handling Mongoose ValidationError
    else if (err.name === "ValidationError") {
      const validationErr = err as ValidationError;
      return res.status(400).json({
        status: "error",
        message: "Validation Error",
        details: validationErr.errors, // Optionally send detailed validation errors
      });
    }
  
    // Handling MongoDB errors like duplicate keys
    else if ((err as MongoError).code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "Duplicate field value entered",
      });
    }
  
    // Handling CastError (invalid ObjectId in MongoDB)
    else if (err.name === "CastError") {
      const castErr = err as CastError;
      return res.status(400).json({
        status: "error",
        message: `Invalid ${castErr.path}: ${castErr.value}`,
      });
    }
  
    // Catch all for unexpected errors
    else {
      return res.status(500).json({
        status: "error",
        message: "An unexpected error occurred",
      });
    }
  };
  
export { 
    APIError, 
    NotFoundError, 
    BadRequestError, 
    UnauthorizedError, 
    ForbiddenError, 
    ConflictError, 
    InternalServerError, 
    ValidationError, 
    asyncHandler, 
    globalErrorhandler
}
  