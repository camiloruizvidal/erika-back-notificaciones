import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Constantes } from '../../utils/constantes';
import { Config } from '../../infrastructure/config/config';
import { IPayloadJwt } from '../../shared/interfaces/auth.interfaces';

interface RequestConContexto extends Request {
  tenantId?: number;
  usuarioId?: number;
}

@Injectable()
export class JwtTenantGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConContexto>();
    const token = this.obtenerToken(request);

    try {
      const payload = await this.jwtService.verifyAsync<IPayloadJwt>(token, {
        secret: Config.jwtKey,
      });

      if (!payload?.tenant_id || !payload?.usuario_id) {
        throw new UnauthorizedException(Constantes.TOKEN_SIN_CLAIMS);
      }

      request.tenantId = payload.tenant_id;
      request.usuarioId = payload.usuario_id;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(Constantes.TOKEN_INVALIDO);
    }
  }

  private obtenerToken(request: Request): string {
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader || typeof authorizationHeader !== 'string') {
      throw new UnauthorizedException(Constantes.AUTH_HEADER_REQUERIDO);
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(Constantes.TOKEN_INVALIDO);
    }

    return token;
  }
}
