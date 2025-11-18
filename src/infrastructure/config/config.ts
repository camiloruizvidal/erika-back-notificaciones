import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

export class Config {
  static readonly puerto: number = Number(process.env.PORT);
  static readonly dbHost: string = `${process.env.DB_HOST}`;
  static readonly dbPuerto: number = Number(process.env.DB_PORT);
  static readonly dbUsuario: string = `${process.env.DB_USER}`;
  static readonly dbContrasena: string = `${process.env.DB_PASSWORD}`;
  static readonly dbBaseDatos: string = `${process.env.DB_NAME}`;
  static readonly dbDialect: Dialect = process.env.DB_DIALECT as Dialect;
  static readonly dbLogging: boolean = process.env.DB_LOGGING === 'true';
  static readonly jwtKey: string = `${process.env.JWT_KEY}`;
  static readonly kafkaBroker: string = `${process.env.KAFKA_BROKER}`;
  static readonly kafkaClientId: string = `${process.env.KAFKA_CLIENT_ID}`;
  static readonly kafkaGroupId: string = `${process.env.KAFKA_GROUP_ID}`;
  static readonly pagosBaseUrl: string = `${process.env.PAGOS_BASE_URL}`;
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
