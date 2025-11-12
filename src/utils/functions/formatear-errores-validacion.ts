import { ValidationError } from 'class-validator';
import { Constantes } from '../constantes';

export function formatearErroresValidacion(
  errores: ValidationError[]
): string[] {
  const mensajesValidaciones: string[] = [];

  errores.forEach(error => {
    if (error.constraints?.whitelistValidation) {
      error.constraints.whitelistValidation = Constantes.PROPIEDAD_NO_PERMITIDA(
        error.property
      );
    }
    if (error.children && error.children.length > 0) {
      mensajesValidaciones.push(...formatearErroresValidacion(error.children));
    } else if (error.constraints) {
      const constraints = Object.values(error.constraints);
      mensajesValidaciones.push(...constraints);
    }
  });
  return mensajesValidaciones;
}
