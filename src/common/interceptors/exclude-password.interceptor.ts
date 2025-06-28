import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (Array.isArray(data)) {
          return data.map((item) => this.excludePassword(item));
        }
        return this.excludePassword(data);
      }),
    );
  }

  private excludePassword(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.excludePassword(item));
    }

    const { password: _password, ...result } = data as Record<string, unknown>;

    // Recursivamente excluir password de propiedades anidadas
    for (const key in result) {
      if (result[key] && typeof result[key] === 'object') {
        result[key] = this.excludePassword(result[key]);
      }
    }

    return result;
  }
}
