// DTO para crear un nuevo partido
export interface PartidoCreationDTO {
  deporteId: string;
  zonaId: string;
  organizadorId: string;
  fecha: Date;
  hora: string;
  duracion: number;
  direccion: string;
  cantidadJugadores: number;
  tipoEmparejamiento?: 'ZONA' | 'NIVEL' | 'HISTORIAL';
  nivelMinimo?: number;
  nivelMaximo?: number;
}

// DTO para actualizar un partido
export interface PartidoUpdateDTO {
  deporteId?: string;
  zonaId?: string;
  fecha?: Date;
  hora?: string;
  duracion?: number;
  direccion?: string;
  cantidadJugadores?: number;
  estado?: 'NECESITAMOS_JUGADORES' | 'ARMADO' | 'CONFIRMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'CANCELADO';
  tipoEmparejamiento?: 'ZONA' | 'NIVEL' | 'HISTORIAL';
  nivelMinimo?: number;
  nivelMaximo?: number;
}

// DTO para finalizar un partido
export interface PartidoFinalizarDTO {
  equipoGanador?: 'A' | 'B';
}

// DTO para unirse a un partido
export interface UnirsePartidoDTO {
  usuarioId: string;
  equipo?: 'A' | 'B';
}
