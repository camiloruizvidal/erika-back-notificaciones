import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'clientes',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class ClienteModel extends Model {
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
  @Column({ type: DataType.BIGINT, field: 'tipo_documento_id' })
  declare tipoDocumentoId: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(80), field: 'primer_nombre' })
  declare primerNombre: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(80), field: 'segundo_nombre' })
  declare segundoNombre: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(80), field: 'primer_apellido' })
  declare primerApellido: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(80), field: 'segundo_apellido' })
  declare segundoApellido: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'nombre_completo' })
  declare nombreCompleto: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(150) })
  declare correo: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(30) })
  declare telefono: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(50) })
  declare identificacion: string | null;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'fecha_nacimiento' })
  declare fechaNacimiento: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(255) })
  declare direccion: string | null;

  @Default(true)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN })
  declare activo: boolean;
}

