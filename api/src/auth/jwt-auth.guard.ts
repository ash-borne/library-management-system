import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Runs JwtStrategy. Requests without a valid token get 401 Unauthorized.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
