import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CuentaCobroModel } from './cuenta-cobro.model';

@Table({
  tableName: 'cuentas_cobro_servicios',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class CuentaCobroServicioModel extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => CuentaCobroModel)
  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'cuenta_cobro_id' })
  cuentaCobroId!: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'cliente_paquete_servicio_id' })
  clientePaqueteServicioId!: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(150), field: 'nombre_servicio' })
  nombreServicio!: string;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_original',
  })
  valorOriginal!: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_acordado',
  })
  valorAcordado!: number;

  @BelongsTo(() => CuentaCobroModel)
  cuentaCobro?: CuentaCobroModel;
}

