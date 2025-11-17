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
  tenantId!: number;

  @AllowNull(false)
  @Column({ type: DataType.BIGINT, field: 'tipo_documento_id' })
  tipoDocumentoId!: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(80), field: 'primer_nombre' })
  primerNombre!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(80), field: 'segundo_nombre' })
  segundoNombre!: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(80), field: 'primer_apellido' })
  primerApellido!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(80), field: 'segundo_apellido' })
  segundoApellido!: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'nombre_completo' })
  nombreCompleto!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(150) })
  correo!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(30) })
  telefono!: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(50) })
  identificacion!: string | null;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'fecha_nacimiento' })
  fechaNacimiento!: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(255) })
  direccion!: string | null;

  @Default(true)
  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN })
  activo!: boolean;
}

