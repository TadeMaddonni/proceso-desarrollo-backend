// DTO para Invitacion
export interface InvitacionDTO {
  id: string;
  partidoId: string;
  usuarioId: string;
  estado: string;
  criterioOrigen: string;
  fechaEnvio: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
