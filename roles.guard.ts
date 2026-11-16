import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../generated/prisma/client';
import { AuthUser } from './auth-user.interface';
import { ROLES_KEY } from './roles.decorator';

// Use after JwtAuthGuard, which sets req.user.
// Returning false makes Nest reply with 403 Forbidden.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Roles set with @Roles() on the route, or on its controller
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no @Roles() means any logged-in user may continue
    }

    const req = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!req.user) {
      return false;
    }
    return requiredRoles.includes(req.user.role);
  }
}
