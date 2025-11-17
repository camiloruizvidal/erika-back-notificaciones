import { Op } from 'sequelize';
import { CuentaCobroModel } from '../models/cuenta-cobro.model';
import { CuentaCobroServicioModel } from '../models/cuenta-cobro-servicio.model';
import { ClienteModel } from '../models/cliente.model';
import { ConceptoAdicionalModel } from '../models/concepto-adicional.model';
import { ClientePaqueteModel } from '../models/cliente-paquete.model';
import { TenantModel } from '../models/tenant.model';
import { Transformador } from '../../../utils/transformador.util';

export class CuentaCobroRepository {
  private constructor() {}

  static async buscarPorFechaCobroConRelaciones(
    inicioDia: Date,
    finDia: Date,
    limit: number,
    offset: number,
  ): Promise<{ rows: CuentaCobroModel[]; count: number }> {
    const resultado = await CuentaCobroModel.findAndCountAll({
      where: {
        fechaCobro: {
          [Op.between]: [inicioDia, finDia],
        },
      },
      include: [
        {
          model: CuentaCobroServicioModel,
          as: 'servicios',
          required: false,
        },
        {
          model: ConceptoAdicionalModel,
          as: 'conceptosAdicionales',
          required: false,
        },
      ],
      limit,
      offset,
      order: [['id', 'ASC']],
      paranoid: true,
    });

    return Transformador.extraerDataValues(resultado);
  }

  static async buscarPorIdConRelaciones(
    id: number,
  ): Promise<CuentaCobroModel | null> {
    const resultado = await CuentaCobroModel.findByPk(id, {
      include: [
        {
          model: CuentaCobroServicioModel,
          as: 'servicios',
          required: false,
        },
        {
          model: ConceptoAdicionalModel,
          as: 'conceptosAdicionales',
          required: false,
        },
      ],
      paranoid: true,
    });

    return Transformador.extraerDataValues(resultado);
  }

  static async buscarClientePorId(id: number): Promise<ClienteModel | null> {
    const resultado = await ClienteModel.findByPk(id, {
      paranoid: true,
    });

    return Transformador.extraerDataValues(resultado);
  }

  static async contarPorFechaCobro(
    inicioDia: Date,
    finDia: Date,
  ): Promise<number> {
    return await CuentaCobroModel.count({
      where: {
        fechaCobro: {
          [Op.between]: [inicioDia, finDia],
        },
      },
      paranoid: true,
    });
  }

  static async actualizarUrlPdf(
    id: number,
    urlPdf: string,
  ): Promise<CuentaCobroModel | null> {
    const cuentaCobro = await CuentaCobroModel.findByPk(id);

    if (!cuentaCobro) {
      return null;
    }

    cuentaCobro.urlPdf = urlPdf;
    await cuentaCobro.save();

    return Transformador.extraerDataValues(cuentaCobro);
  }

  static async actualizarLinkPago(
    id: number,
    linkPago: string,
  ): Promise<CuentaCobroModel | null> {
    const cuentaCobro = await CuentaCobroModel.findByPk(id);

    if (!cuentaCobro) {
      return null;
    }

    cuentaCobro.linkPago = linkPago;
    await cuentaCobro.save();

    return Transformador.extraerDataValues(cuentaCobro);
  }

  static async actualizarEnvioCorreo(
    id: number,
    fechaEnvio: Date,
  ): Promise<CuentaCobroModel | null> {
    const cuentaCobro = await CuentaCobroModel.findByPk(id);

    if (!cuentaCobro) {
      return null;
    }

    cuentaCobro.siEnvioCorreo = true;
    cuentaCobro.fechaEnvioCorreo = fechaEnvio;
    await cuentaCobro.save();

    return Transformador.extraerDataValues(cuentaCobro);
  }

  static async buscarDiasGraciaPorClientePaqueteId(
    clientePaqueteId: number,
  ): Promise<number | null> {
    const clientePaquete = await ClientePaqueteModel.findByPk(
      clientePaqueteId,
      {
        attributes: ['dias_gracia'],
      },
    );

    if (!clientePaquete) {
      return null;
    }

    return clientePaquete.diasGracia;
  }

  static async buscarTenantPorId(id: number): Promise<TenantModel | null> {
    const tenant = await TenantModel.findByPk(id, {
      attributes: ['id', 'nombre'],
      paranoid: true,
    });

    return Transformador.extraerDataValues(tenant);
  }
}
