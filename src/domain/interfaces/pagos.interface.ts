export interface IGenerarLinkPagoRequest {
  cuentaCobroId: number;
  valorTotal: number;
  referencia: string;
  descripcion: string;
  correoCliente: string;
  nombreCliente: string;
  fechaLimitePago: Date;
}

