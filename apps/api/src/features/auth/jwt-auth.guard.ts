import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface JwtUserPayload {
  sub: number;
  email: string;
  role: string;
}

export type AuthenticatedRequest = Request & { user?: JwtUserPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token autentikasi wajib dikirim.');
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtUserPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token autentikasi tidak valid.');
    }
  }

  private extractToken(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
