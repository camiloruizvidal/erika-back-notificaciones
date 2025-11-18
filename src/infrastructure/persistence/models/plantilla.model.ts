import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'plantillas',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class PlantillaModel extends Model {
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
  @Column({ type: DataType.STRING(50) })
  tipo!: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT, field: 'plantilla_correo' })
  plantillaCorreo!: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT, field: 'plantilla_pdf' })
  plantillaPdf!: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500), field: 'ruta_pdf' })
  rutaPdf!: string | null;

  @Default(true)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN })
  activo!: boolean;
}

