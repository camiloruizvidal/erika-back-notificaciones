import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CuentaCobroServicioModel } from './cuenta-cobro-servicio.model';
import { ConceptoAdicionalModel } from './concepto-adicional.model';
import { EEstadoCuentaCobro } from '../../../domain/enums/estado-cuenta-cobro.enum';

@Table({
  tableName: 'cuentas_cobro',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class CuentaCobroModel extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'tenant_id' })
  declare tenantId: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'cliente_id' })
  declare clienteId: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'cliente_paquete_id' })
  declare clientePaqueteId: number;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'fecha_cobro' })
  declare fechaCobro: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_total',
  })
  declare valorTotal: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_paquete',
  })
  declare valorPaquete: number;

  @Default(0)
  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_conceptos_adicionales',
  })
  declare valorConceptosAdicionales: number;

  @Default(EEstadoCuentaCobro.PENDIENTE)
  @AllowNull(false)
  @Column({ type: DataType.STRING(20) })
  declare estado: EEstadoCuentaCobro;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500), field: 'url_pdf' })
  declare urlPdf: string | null;

  @Default(false)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, field: 'si_envio_correo' })
  declare siEnvioCorreo: boolean;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'fecha_envio_correo' })
  declare fechaEnvioCorreo: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  declare observaciones: string | null;

  @AllowNull(true)
  @Column({ type: DataType.TEXT, field: 'link_pago' })
  declare linkPago: string | null;

  @HasMany(() => CuentaCobroServicioModel, 'cuenta_cobro_id')
  servicios?: CuentaCobroServicioModel[];

  @HasMany(() => ConceptoAdicionalModel, 'cuenta_cobro_id')
  conceptosAdicionales?: ConceptoAdicionalModel[];
}

