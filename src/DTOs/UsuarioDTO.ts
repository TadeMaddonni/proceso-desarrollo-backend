// DTO para Usuario
export interface UsuarioDTO {
  id: string;
  nombre: string;
  correo: string;
  nivel: number;
  zonaId: string;
  deporteId?: string;
  score?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
