import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CuentaCobroModel } from './cuenta-cobro.model';

@Table({
  tableName: 'conceptos_adicionales',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class ConceptoAdicionalModel extends Model {
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

  @AllowNull(true)
  @Column({ type: DataType.BIGINT, field: 'cliente_paquete_id' })
  clientePaqueteId!: number | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255) })
  concepto!: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  descripcion!: string | null;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
  })
  valor!: number;

  @Default(false)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN })
  aplicado!: boolean;

  @Default(false)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, field: 'siguiente_cuenta_cobro' })
  siguienteCuentaCobro!: boolean;

  @ForeignKey(() => CuentaCobroModel)
  @AllowNull(true)
  @Column({ type: DataType.BIGINT, field: 'cuenta_cobro_id' })
  cuentaCobroId!: number | null;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'fecha_aplicacion' })
  fechaAplicacion!: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.INTEGER, field: 'mes_aplicacion' })
  mesAplicacion!: number | null;

  @AllowNull(true)
  @Column({ type: DataType.INTEGER, field: 'anio_aplicacion' })
  anioAplicacion!: number | null;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  observaciones!: string | null;

  @BelongsTo(() => CuentaCobroModel)
  cuentaCobro?: CuentaCobroModel;
}

