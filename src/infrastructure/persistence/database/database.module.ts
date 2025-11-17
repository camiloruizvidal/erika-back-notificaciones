import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Config } from '../../config/config';
import { CuentaCobroModel } from '../models/cuenta-cobro.model';
import { CuentaCobroServicioModel } from '../models/cuenta-cobro-servicio.model';
import { ConceptoAdicionalModel } from '../models/concepto-adicional.model';
import { ClienteModel } from '../models/cliente.model';
import { ClientePaqueteModel } from '../models/cliente-paquete.model';
import { TenantModel } from '../models/tenant.model';
import { PlantillaModel } from '../models/plantilla.model';
import { CuentaCobroRepository } from '../repositories/cuenta-cobro.repository';
import { PlantillaRepository } from '../repositories/plantilla.repository';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: Config.dbDialect,
      host: Config.dbHost,
      port: Config.dbPuerto,
      username: Config.dbUsuario,
      password: Config.dbContrasena,
      database: Config.dbBaseDatos,
      models: [
        CuentaCobroModel,
        CuentaCobroServicioModel,
        ConceptoAdicionalModel,
        ClienteModel,
        ClientePaqueteModel,
        TenantModel,
        PlantillaModel,
      ],
      logging: Config.dbLogging,
      define: {
        underscored: true,
      },
    }),
    SequelizeModule.forFeature([
      CuentaCobroModel,
      CuentaCobroServicioModel,
      ConceptoAdicionalModel,
      ClienteModel,
      ClientePaqueteModel,
      TenantModel,
      PlantillaModel,
    ]),
  ],
  providers: [CuentaCobroRepository, PlantillaRepository],
  exports: [CuentaCobroRepository, PlantillaRepository],
})
export class DatabaseModule {}

