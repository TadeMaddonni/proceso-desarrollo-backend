export interface UsuarioPartidoDTO {
  id: string;
  usuarioId: string;
  partidoId: string;
  equipo?: 'A' | 'B';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UsuarioPartidoCreationDTO {
  usuarioId: string;
  partidoId: string;
  equipo?: 'A' | 'B';
}
