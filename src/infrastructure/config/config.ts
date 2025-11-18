import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

export class Config {
  static readonly puerto = Number(process.env.PORT);
  static readonly dbHost = process.env.DB_HOST;
  static readonly dbPuerto = Number(process.env.DB_PORT);
  static readonly dbUsuario = process.env.DB_USER;
  static readonly dbContrasena = process.env.DB_PASSWORD;
  static readonly dbBaseDatos = process.env.DB_NAME;
  static readonly dbDialect = process.env.DB_DIALECT as Dialect;
  static readonly dbLogging = process.env.DB_LOGGING === 'true';
  static readonly jwtKey = process.env.JWT_KEY;
  static readonly kafkaBroker = process.env.KAFKA_BROKER as string;
  static readonly kafkaClientId = process.env.KAFKA_CLIENT_ID;
  static readonly kafkaGroupId = process.env.KAFKA_GROUP_ID;
  static readonly pagosBaseUrl = process.env.PAGOS_BASE_URL;
  static readonly mailersendApiToken = process.env
    .MAILERSEND_API_TOKEN as string;
  static readonly mailersendFromEmail = process.env
    .MAILERSEND_FROM_EMAIL as string;
  static readonly mailersendFromName = process.env
    .MAILERSEND_FROM_NAME as string;
}

const errors: string[] = [];
Object.keys(Config).forEach((key) => {
  if (
    Config[key] === null ||
    Config[key] === undefined ||
    `${Config[key]}`.trim() === ''
  ) {
    errors.push(`La variable de entorno ${key} es requerida`);
  }
});
if (errors.length > 0) {
  throw new Error(errors.join('\n'));
}
