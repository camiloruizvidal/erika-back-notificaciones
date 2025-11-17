import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PlantillaModel } from '../models/plantilla.model';
import { Transformador } from '../../../utils/transformador.util';

@Injectable()
export class PlantillaRepository {
  constructor(
    @InjectModel(PlantillaModel)
    private readonly plantillaModel: typeof PlantillaModel,
  ) {}

  async buscarPorTenantYTipo(
    tenantId: number,
    tipo: string,
  ): Promise<PlantillaModel | null> {
    const resultado = await this.plantillaModel.findOne({
      where: {
        tenantId,
        tipo,
        activo: true,
      },
      paranoid: true,
    });

    if (!resultado) {
      return null;
    }

    return Transformador.extraerDataValues(resultado) as PlantillaModel;
  }
}

