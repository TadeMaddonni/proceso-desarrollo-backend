// DTO para Usuario
export interface UsuarioDTO {
  id: string;
  nombre: string;
  email: string;
  nivel: number;
  zonaId: string;
  deporteId?: string;
  score?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
