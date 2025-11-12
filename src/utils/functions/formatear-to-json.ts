export class FormatearToJson {
  public static toJson<T>(valor: any) {
    if (valor?.count) {
      valor.rows = this.toJson(valor.rows);
      return valor;
    }
    if (Array.isArray(valor)) {
      return valor.map(registro => registro.toJSON());
    } else if (typeof valor === 'object' && valor !== null) {
      return valor.toJSON();
    }
    return valor as T;
  }
}
