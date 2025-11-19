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
  declare tenantId: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare tipo: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT, field: 'plantilla_correo' })
  declare plantillaCorreo: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT, field: 'plantilla_pdf' })
  declare plantillaPdf: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500), field: 'ruta_pdf' })
  declare rutaPdf: string | null;

  @Default(true)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN })
  declare activo: boolean;
}

