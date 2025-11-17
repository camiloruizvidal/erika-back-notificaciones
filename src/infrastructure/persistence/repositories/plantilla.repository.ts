import { PlantillaModel } from '../models/plantilla.model';
import { Transformador } from '../../../utils/transformador.util';

export class PlantillaRepository {
  private constructor() {}

  static async buscarPorTenantYTipo(
    tenantId: number,
    tipo: string,
  ): Promise<PlantillaModel | null> {
    const resultado = await PlantillaModel.findOne({
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

    return Transformador.extraerDataValues(resultado);
  }
}
