import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'cliente_paquetes',
  timestamps: false,
  paranoid: false,
})
export class ClientePaqueteModel extends Model {
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
  @Column({ type: DataType.INTEGER, field: 'dias_gracia' })
  diasGracia!: number | null;
}
