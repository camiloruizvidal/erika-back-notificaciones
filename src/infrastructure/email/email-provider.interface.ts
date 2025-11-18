import { IEnviarCorreoRequest } from '../../domain/interfaces/notificaciones.interface';

export interface IEmailProvider {
  enviarCorreo(datos: IEnviarCorreoRequest): Promise<void>;
}

export const EMAIL_PROVIDER_TOKEN = Symbol('IEmailProvider');

