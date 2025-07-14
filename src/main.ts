import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { ExcludePasswordInterceptor } from './common/interceptors/exclude-password.interceptor';
import { ValidationErrorInterceptor } from './common/interceptors/validation-error.interceptor';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Middleware de logging para todas las peticiones
  app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    console.log(
      `[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress}`,
    );

    if (
      req.body &&
      typeof req.body === 'object' &&
      Object.keys(req.body as Record<string, unknown>).length > 0
    ) {
      console.log(`Body:`, JSON.stringify(req.body, null, 2));
    }

    // Interceptar el final de la respuesta
    res.on('finish', () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const statusCode = res.statusCode;

      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url} - Status: ${statusCode} - Duration: ${duration}ms`,
      );
    });

    // Manejar errores
    res.on('error', (error) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error(
        `[${new Date().toISOString()}] ERROR ${req.method} ${req.url} - Duration: ${duration}ms`,
        error,
      );
    });

    next();
  });

  // Configurar ValidationPipe global para validar DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo permite propiedades definidas en el DTO
      forbidNonWhitelisted: true, // Rechaza propiedades no definidas
      transform: true, // Transforma automáticamente los tipos
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const errorMessages = errors.map((error) => {
          const constraints = error.constraints;
          const property = error.property;

          if (constraints) {
            const messages = Object.values(constraints);
            return `${property}: ${messages.join(', ')}`;
          }

          // Para errores anidados (como address.street)
          if (error.children && error.children.length > 0) {
            const childErrors = error.children.map((child) => {
              const childConstraints = child.constraints;
              if (childConstraints) {
                const childMessages = Object.values(childConstraints);
                return `${property}.${child.property}: ${childMessages.join(', ')}`;
              }
              return `${property}.${child.property}: Error de validación`;
            });
            return childErrors.join('; ');
          }

          return `${property}: Error de validación`;
        });

        return new BadRequestException({
          message: 'Error de validación',
          errors: errorMessages,
          statusCode: 400,
        });
      },
    }),
  );

  // Aplicar interceptores globales
  app.useGlobalInterceptors(
    new ExcludePasswordInterceptor(),
    new ValidationErrorInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('Domus API')
    .setDescription('API de gestión inmobiliaria')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
