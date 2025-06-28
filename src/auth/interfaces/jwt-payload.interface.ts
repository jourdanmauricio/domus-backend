export type UserRole = 'admin' | 'agent' | 'client';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}
