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
  equipoGanador?: 'A' | 'B';  tipoEmparejamiento: string;
  cantidadJugadores: number;
  jugadoresConfirmados: number;
  createdAt?: Date;
  updatedAt?: Date;
  nivelMinimo?: number;
  nivelMaximo?: number;
  // Relaciones opcionales (incluidas cuando se solicitan)
  organizador?: {
    id: string;
    nombre: string;
    email: string;
    firebaseToken?: string;
  };
    deporte?: {
    id: string;
    nombre: string;
  };
  
  zona?: {
    id: string;
    nombre: string;
  };
    participantes?: Array<{
    id: string;
    usuarioId: string;
    partidoId: string;
    equipo: 'A' | 'B';
    fechaUnion: Date;    usuario: {
      id: string;
      nombre: string;
      email: string;
      firebaseToken?: string;
    };
  }>;
}
