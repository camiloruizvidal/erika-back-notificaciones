export enum EEstadoCuentaCobro {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  MORA = 'mora',
  CANCELADA = 'cancelada',
}

export type EstadoCuentaCobro = `${EEstadoCuentaCobro}`;

