export class ErrorPersonalizado extends Error {
  private readonly _codigo: number;

  constructor(codigo: number, mensaje: string) {
    super(mensaje);
    this._codigo = codigo;
    this.name = 'ErrorPersonalizado';
  }

  get codigo(): number {
    return this._codigo;
  }

  get code(): number {
    return this._codigo;
  }
}
