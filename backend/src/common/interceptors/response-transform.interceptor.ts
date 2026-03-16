import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    success: boolean;
    data: T;
    message?: string;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(map(data => {
            const message = (data && data.message) ? data.message : 'Success';
            const responseData = (data && data.data) ? data.data : data;

            // Preserve meta if present (for paginated responses)
            if (data && typeof data === 'object' && 'data' in data && 'message' in data) {
                const response: any = {
                    success: true,
                    data: data.data,
                    message: data.message
                };
                if ('meta' in data) {
                    response.meta = data.meta;
                }
                return response;
            }

            // If meta exists at top level, preserve it
            if (data && typeof data === 'object' && 'meta' in data) {
                return {
                    success: true,
                    data: responseData,
                    meta: data.meta,
                    message
                };
            }

            return {
                success: true,
                data: responseData,
                message
            };
        }));
    }
}

// This file defines a NestJS interceptor that automatically transforms 
// all controller responses into a standard format before sending them to the client.