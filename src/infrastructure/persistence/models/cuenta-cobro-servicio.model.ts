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
  declare cuentaCobroId: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'cliente_paquete_servicio_id' })
  declare clientePaqueteServicioId: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(150), field: 'nombre_servicio' })
  declare nombreServicio: string;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_original',
  })
  declare valorOriginal: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    field: 'valor_acordado',
  })
  declare valorAcordado: number;

  @BelongsTo(() => CuentaCobroModel)
  cuentaCobro?: CuentaCobroModel;
}

