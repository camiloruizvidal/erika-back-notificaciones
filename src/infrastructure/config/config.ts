import * as dotenv from 'dotenv';

dotenv.config();

export class Config {
  static readonly jwtKey = process.env.JWT_KEY;
}
