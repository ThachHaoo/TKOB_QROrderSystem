import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to transform array query params from status[]=VALUE format to status=[VALUE]
 * This allows NestJS ValidationPipe to properly handle array query parameters
 */
@Injectable()
export class ArrayQueryMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.query) {
      const transformedQuery: any = {};
      
      for (const [key, value] of Object.entries(req.query)) {
        // Check if key ends with [] (array notation)
        if (key.endsWith('[]')) {
          const cleanKey = key.slice(0, -2); // Remove []
          transformedQuery[cleanKey] = Array.isArray(value) ? value : [value];
        } else {
          transformedQuery[key] = value;
        }
      }
      
      req.query = transformedQuery;
    }
    
    next();
  }
}
