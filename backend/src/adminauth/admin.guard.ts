import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

// Putting @UseGuards(AdminGuard) on any route only admins may call.

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers["authorization"];
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) throw new UnauthorizedException("Missing token.");

    let payload: { id: number; email: string; role: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token.");
    }

    if (payload.role !== "ADMIN") throw new ForbiddenException("Admins only.");

    request.admin = payload; // available in controllers as @Req() req.admin

        // Token ids can arrive as strings ("1"), but the database ids are integers
    const id = Number(payload.id);
    if (!Number.isInteger(id)) throw new UnauthorizedException("Invalid token.");
 
    request.admin = { ...payload, id }; // id is now always a number
    return true;
  }
}
  
  
