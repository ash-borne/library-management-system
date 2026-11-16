import { Role } from '../generated/prisma/client';

// What JwtStrategy puts on req.user after a token is verified
export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

// What is stored inside the JWT
export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}
