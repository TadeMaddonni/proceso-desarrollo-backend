// DTO para Partido
export interface PartidoDTO {
  id: string;
  deporteId: string;
  zonaId: string;
  organizadorId: string;
  fecha: Date;
  hora: string;
  duracion: number;
  direccion: string;
  estado: string;
  equipoGanadorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  nivelMinimo?: number;
  nivelMaximo?: number;
}
