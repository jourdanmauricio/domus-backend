import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Si la excepción ya tiene una estructura personalizada, usarla
    if (
      typeof exceptionResponse === 'object' &&
      'errors' in exceptionResponse
    ) {
      return response.status(status).json(exceptionResponse);
    }

    // Para otras excepciones HTTP, usar estructura estándar
    return response.status(status).json({
      error: status,
      message: exception.message,
    });
  }
}
