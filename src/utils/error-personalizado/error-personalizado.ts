export class ErrorPersonalizado extends Error {
  constructor(codigo: number, mensaje: string) {
    super();
    this.code = codigo;
    this.message = mensaje;
  }
  private code: number;
}
