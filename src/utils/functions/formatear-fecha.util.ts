import moment from 'moment-timezone';

export class FormatearFecha {
  static fechaUTC(fecha: Date | string | moment.Moment): string {
    return moment.utc(fecha).format('YYYY-MM-DD');
  }

  static fechaColombia(fecha: Date | string | moment.Moment): string {
    return moment.tz(fecha, 'America/Bogota').format('YYYY-MM-DD');
  }

  static fechaUTCCompleta(fecha: Date | string | moment.Moment): string {
    return moment.utc(fecha).format('YYYY-MM-DD HH:mm:ss');
  }

  static fechaColombiaCompleta(fecha: Date | string | moment.Moment): string {
    return moment.tz(fecha, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
  }
}

