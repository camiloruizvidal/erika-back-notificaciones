export interface IEnviarCorreoRequest {
  destinatario: string;
  asunto: string;
  cuerpo: string;
  tipo: 'html' | 'texto';
  urlPdf?: string;
  pdfAdjunto?: {
    nombreArchivo: string;
    contenidoBase64: string;
  };
}

