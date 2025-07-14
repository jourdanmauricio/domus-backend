import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class ValidationErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof BadRequestException) {
          const request = context.switchToHttp().getRequest<Request>();
          const method: string = request.method;
          const url: string = request.url;
          const body: unknown = request.body;

          console.error('=== ERROR DE VALIDACIÓN ===');
          console.error(`Método: ${method}`);
          console.error(`URL: ${url}`);
          console.error(`Body recibido:`, JSON.stringify(body, null, 2));
          console.error(`Error:`, error.getResponse());
          console.error('===========================');
        }

        return throwError(() => error);
      }),
    );
  }
}
