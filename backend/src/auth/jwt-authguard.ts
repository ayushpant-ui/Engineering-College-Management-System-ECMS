import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

interface StudentJwtPayload {
  sub: number;
  registrationNumber: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: StudentJwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required.');
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      throw new UnauthorizedException('Authentication required.');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<StudentJwtPayload>(token);

      if (
        typeof payload.sub !== 'number' ||
        payload.role !== 'student'
      ) {
        throw new UnauthorizedException('Invalid access token.');
      }

      (request as AuthenticatedRequest).user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired access token.',
      );
    }
  }
}