export interface IEnviarCorreoRequest {
  destinatario: string;
  asunto: string;
  cuerpoHtml: string;
  urlPdf?: string;
}

