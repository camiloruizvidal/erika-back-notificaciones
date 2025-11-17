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
  tenantId!: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'cliente_id' })
  clienteId!: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'cliente_paquete_id' })
  clientePaqueteId!: number;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'fecha_cobro' })
  fechaCobro!: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_total',
  })
  valorTotal!: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_paquete',
  })
  valorPaquete!: number;

  @Default(0)
  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_conceptos_adicionales',
  })
  valorConceptosAdicionales!: number;

  @Default(EEstadoCuentaCobro.PENDIENTE)
  @AllowNull(false)
  @Column({ type: DataType.STRING(20) })
  estado!: EEstadoCuentaCobro;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500), field: 'url_pdf' })
  urlPdf!: string | null;

  @Default(false)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, field: 'si_envio_correo' })
  siEnvioCorreo!: boolean;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'fecha_envio_correo' })
  fechaEnvioCorreo!: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  observaciones!: string | null;

  @HasMany(() => CuentaCobroServicioModel, 'cuenta_cobro_id')
  servicios?: CuentaCobroServicioModel[];

  @HasMany(() => ConceptoAdicionalModel, 'cuenta_cobro_id')
  conceptosAdicionales?: ConceptoAdicionalModel[];
}

