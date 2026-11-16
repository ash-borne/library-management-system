import { SetMetadata } from '@nestjs/common';
import { Role } from '../generated/prisma/client';

export const ROLES_KEY = 'roles';

// Usage: @Roles(Role.LIBRARIAN) on a controller or a route
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
