import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/profile - the logged-in user's own details.
  // JwtAuthGuard verifies the token and JwtStrategy sets req.user.
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: { user: AuthUser }) {
    return this.usersService.findProfile(req.user.id);
  }
}
