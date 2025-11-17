import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CuentaCobroModel } from '../models/cuenta-cobro.model';
import { CuentaCobroServicioModel } from '../models/cuenta-cobro-servicio.model';
import { ClienteModel } from '../models/cliente.model';
import { ConceptoAdicionalModel } from '../models/concepto-adicional.model';
import { Transformador } from '../../../utils/transformador.util';

@Injectable()
export class CuentaCobroRepository {
  constructor(
    @InjectModel(CuentaCobroModel)
    private readonly cuentaCobroModel: typeof CuentaCobroModel,
    @InjectModel(ClienteModel)
    private readonly clienteModel: typeof ClienteModel,
  ) {}

  async buscarPorFechaCobroConRelaciones(
    fechaCobro: Date,
    limit: number,
    offset: number,
  ): Promise<{ rows: CuentaCobroModel[]; count: number }> {
    const inicioDia = new Date(fechaCobro);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fechaCobro);
    finDia.setHours(23, 59, 59, 999);

    const resultado = await this.cuentaCobroModel.findAndCountAll({
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

    return {
      rows: resultado.rows.map((row) =>
        Transformador.extraerDataValues(row),
      ) as CuentaCobroModel[],
      count: resultado.count,
    };
  }

  async buscarPorIdConRelaciones(id: number): Promise<CuentaCobroModel | null> {
    const resultado = await this.cuentaCobroModel.findByPk(id, {
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

    if (!resultado) {
      return null;
    }

    return Transformador.extraerDataValues(resultado) as CuentaCobroModel;
  }

  async buscarClientePorId(id: number): Promise<ClienteModel | null> {
    const resultado = await this.clienteModel.findByPk(id, {
      paranoid: true,
    });

    if (!resultado) {
      return null;
    }

    return Transformador.extraerDataValues(resultado) as ClienteModel;
  }

  async contarPorFechaCobro(fechaCobro: Date): Promise<number> {
    const inicioDia = new Date(fechaCobro);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fechaCobro);
    finDia.setHours(23, 59, 59, 999);

    return await this.cuentaCobroModel.count({
      where: {
        fechaCobro: {
          [Op.between]: [inicioDia, finDia],
        },
      },
      paranoid: true,
    });
  }

  async actualizarUrlPdf(
    id: number,
    urlPdf: string,
  ): Promise<CuentaCobroModel | null> {
    const cuentaCobro = await this.cuentaCobroModel.findByPk(id);

    if (!cuentaCobro) {
      return null;
    }

    cuentaCobro.urlPdf = urlPdf;
    await cuentaCobro.save();

    return Transformador.extraerDataValues(cuentaCobro) as CuentaCobroModel;
  }

  async actualizarEnvioCorreo(
    id: number,
    fechaEnvio: Date,
  ): Promise<CuentaCobroModel | null> {
    const cuentaCobro = await this.cuentaCobroModel.findByPk(id);

    if (!cuentaCobro) {
      return null;
    }

    cuentaCobro.siEnvioCorreo = true;
    cuentaCobro.fechaEnvioCorreo = fechaEnvio;
    await cuentaCobro.save();

    return Transformador.extraerDataValues(cuentaCobro) as CuentaCobroModel;
  }
}

