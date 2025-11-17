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
  static readonly kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
  static readonly kafkaClientId = process.env.KAFKA_CLIENT_ID || 'erika-back-notificaciones';
  static readonly kafkaGroupId = process.env.KAFKA_GROUP_ID || 'erika-notificaciones-group';
}
