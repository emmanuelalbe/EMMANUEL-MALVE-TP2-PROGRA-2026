import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AutenticacionService } from '../autenticacion.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.obtenerToken(request);

    if (!token) {
      throw new UnauthorizedException('Token requerido');
    }

    await this.autenticacionService.validarAdministrador(token);

    return true;
  }

  private obtenerToken(request: Request): string {
    const authorization = request.headers.authorization ?? '';

    return authorization.replace(/^Bearer\s+/i, '').trim();
  }
}
