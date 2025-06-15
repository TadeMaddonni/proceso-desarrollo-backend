// DTO para actualizar token de Firebase
export interface FirebaseTokenDTO {
  firebaseToken: string;
}

// DTO para enviar notificaciones push
export interface NotificacionPushDTO {
  title: string;
  body: string;
  data?: { [key: string]: string };
  usuarioIds?: string[];
  firebaseTokens?: string[];
}

// DTO para respuesta de notificaciones
export interface NotificacionResponseDTO {
  success: boolean;
  message: string;
  enviadasExitosas?: number;
  enviadasFallidas?: number;
  detalles?: string[];
}
