import dbPromise from '../../models/index.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';
import type { PartidoCreationDTO, PartidoUpdateDTO, PartidoFinalizarDTO, UnirsePartidoDTO } from '../../DTOs/PartidoCreationDTO.js';
import { EmparejamientoService } from './emparejamiento/EmparejamientoService.js';
import { EstadoFactory, type EstadoPartidoType } from './estados/EstadoFactory.js';

export class PartidoService {

  /**
   * Crear un nuevo partido
   */
  static async crearPartido(datosPartido: PartidoCreationDTO): Promise<PartidoDTO> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    // Crear el partido con estado inicial
    const nuevoPartido = await Partido.create({
      ...datosPartido,
      fecha: new Date(datosPartido.fecha),
      estado: 'NECESITAMOS_JUGADORES',
      tipoEmparejamiento: datosPartido.tipoEmparejamiento || 'ZONA'
    });

    // Ejecutar emparejamiento en segundo plano (diferido)
    setImmediate(() => {
      PartidoService.ejecutarEmparejamientoAutomatico(nuevoPartido.id).catch(e => {
        // Loguear pero no interrumpir el flujo principal
        console.error('Error en emparejamiento automático:', e);
      });
    });

    return this.mapearPartidoADTO(nuevoPartido);
  }

  /**
   * Ejecuta el emparejamiento automáticamente para un partido dado su ID
   * (delegado a EmparejamientoService)
   */
  private static async ejecutarEmparejamientoAutomatico(partidoId: string): Promise<void> {
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido) return;
    await EmparejamientoService.ejecutarYCrearInvitaciones(partido);
  }

  /**
   * Obtener todos los partidos con sus relaciones
   */
  static async obtenerTodosLosPartidos(): Promise<PartidoDTO[]> {
    console.log('Obteniendo todos los partidos (service)');
    const db = await dbPromise;
    const Partido = db.Partido as any;
    const Usuario = db.Usuario as any;
    const Deporte = db.Deporte as any;
    const Zona = db.Zona as any;    
    console.log('Partido:', Partido.findAll());
    const partidos = await Partido.findAll({
      include: [
        {
          model: Usuario,
          as: 'organizador',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Deporte,
          attributes: ['id', 'nombre']
        },
        {
          model: Zona,
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    return partidos.map((partido: any) => this.mapearPartidoConRelacionesADTO(partido));
  }

  /**
   * Obtener un partido por ID con todas sus relaciones
   */
  static async obtenerPartidoPorId(id: string): Promise<PartidoDTO | null> {
    const db = await dbPromise;
    const Partido = db.Partido as any;
    const Usuario = db.Usuario as any;
    const Deporte = db.Deporte as any;
    const Zona = db.Zona as any;    const partido = await Partido.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'organizador',
          attributes: ['id', 'nombre', 'email']
        },        {
          model: Deporte,
          attributes: ['id', 'nombre']
        },
        // {
        //   model: Zona,
        //   attributes: ['id', 'nombre']
        // },
        {
          model: Usuario,
          as: 'participantes',
          attributes: ['id', 'nombre', 'email', 'nivel'],
          through: {
            attributes: ['equipo'],
            as: 'usuarioPartido'
          }
        }
      ]
    });

    if (!partido) {
      return null;
    }

    return this.mapearPartidoConRelacionesADTO(partido);
  }
  /**
   * Unir un usuario a un partido
   */
  static async unirUsuarioAPartido(partidoId: string, datosUnirse: UnirsePartidoDTO): Promise<any> {
    const db = await dbPromise;
    const UsuarioPartido = db.UsuarioPartido as any;

    // Si no se especifica equipo, auto-asignar balanceando
    let equipoAsignado = datosUnirse.equipo;
    if (!equipoAsignado) {
      equipoAsignado = await this.autoAsignarEquipo(partidoId);
    }

    const usuarioPartido = await UsuarioPartido.create({
      usuarioId: datosUnirse.usuarioId,
      partidoId: partidoId,
      equipo: equipoAsignado
    });

    return {
      id: usuarioPartido.id,
      usuarioId: usuarioPartido.usuarioId,
      partidoId: usuarioPartido.partidoId,
      equipo: usuarioPartido.equipo,
      fechaUnion: usuarioPartido.createdAt
    };
  }

  /**
   * Actualizar el estado de un partido
   */
  static async actualizarEstadoPartido(id: string, nuevoEstado: string): Promise<boolean> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    const [rowsUpdated] = await Partido.update(
      { 
        estado: nuevoEstado,
        updatedAt: new Date()
      },
      { where: { id } }
    );

    return rowsUpdated > 0;
  }

  /**
   * Finalizar un partido
   */
  static async finalizarPartido(id: string, datos: PartidoFinalizarDTO): Promise<boolean> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    const updateData: any = { 
      estado: 'FINALIZADO',
      updatedAt: new Date()
    };

    if (datos.equipoGanador) {
      updateData.equipoGanador = datos.equipoGanador;
    }

    const [rowsUpdated] = await Partido.update(updateData, { where: { id } });

    return rowsUpdated > 0;
  }

  /**
   * Actualizar datos de un partido
   */  static async actualizarPartido(id: string, datosActualizacion: PartidoUpdateDTO): Promise<boolean> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    // Convertir fecha si está presente
    const updateData: any = { ...datosActualizacion };
    if (updateData.fecha) {
      updateData.fecha = new Date(updateData.fecha);
    }
    updateData.updatedAt = new Date();

    const [rowsUpdated] = await Partido.update(updateData, { where: { id } });

    return rowsUpdated > 0;
  }

  /**
   * Verificar si un partido puede ser modificado
   */
  static async puedeSerModificado(partidoId: string): Promise<boolean> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    const partido = await Partido.findByPk(partidoId);
    if (!partido) {
      return false;
    }

    const partidoData = partido.get();
    const estadosNoModificables = ['FINALIZADO', 'CANCELADO'];
    
    return !estadosNoModificables.includes(partidoData.estado);
  }
  /**
   * Obtener participantes de un partido
   */
  static async obtenerParticipantes(partidoId: string): Promise<any[]> {
    const db = await dbPromise;
    const UsuarioPartido = db.UsuarioPartido as any;
    const Usuario = db.Usuario as any;

    const participantes = await UsuarioPartido.findAll({
      where: { partidoId },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'email', 'nivel']
      }],
      order: [['equipo', 'ASC'], ['createdAt', 'ASC']]
    });    return participantes.map((participante: any) => ({
      id: participante.id,
      usuarioId: participante.usuarioId,
      partidoId: participante.partidoId,
      equipo: participante.equipo,
      fechaUnion: participante.createdAt,
      usuario: participante.Usuario
    }));
  }

  /**
   * Contar participantes por equipo
   */
  static async contarParticipantesPorEquipo(partidoId: string): Promise<{ equipoA: number; equipoB: number }> {
    const db = await dbPromise;
    const UsuarioPartido = db.UsuarioPartido as any;

    const participantes = await UsuarioPartido.findAll({
      where: { partidoId },
      attributes: ['equipo']
    });

    const equipoA = participantes.filter((p: any) => p.equipo === 'A').length;
    const equipoB = participantes.filter((p: any) => p.equipo === 'B').length;

    return { equipoA, equipoB };
  }

  /**
   * Auto-asignar equipo balanceando la cantidad de jugadores
   */
  private static async autoAsignarEquipo(partidoId: string): Promise<'A' | 'B'> {
    const conteos = await this.contarParticipantesPorEquipo(partidoId);
    
    // Asignar al equipo con menos jugadores
    return conteos.equipoA <= conteos.equipoB ? 'A' : 'B';
  }

  /**
   * Mapear entidad Partido a DTO
   */
  private static mapearPartidoADTO(partido: any): PartidoDTO {
    const partidoData = partido.get();
    
    return {
      id: partidoData.id,
      deporteId: partidoData.deporteId,
      zonaId: partidoData.zonaId,
      organizadorId: partidoData.organizadorId,
      fecha: partidoData.fecha,
      hora: partidoData.hora,
      duracion: partidoData.duracion,
      direccion: partidoData.direccion,
      estado: partidoData.estado,
      equipoGanador: partidoData.equipoGanador,
      cantidadJugadores: partidoData.cantidadJugadores,
      tipoEmparejamiento: partidoData.tipoEmparejamiento,
      nivelMinimo: partidoData.nivelMinimo,
      nivelMaximo: partidoData.nivelMaximo,
      createdAt: partidoData.createdAt,
      updatedAt: partidoData.updatedAt
    };
  }

  /**
   * Mapear entidad Partido con relaciones a DTO
   */
  private static mapearPartidoConRelacionesADTO(partido: any): PartidoDTO {
    const partidoData = partido.get();
    
    const dto: PartidoDTO = {
      id: partidoData.id,
      deporteId: partidoData.deporteId,
      zonaId: partidoData.zonaId,
      organizadorId: partidoData.organizadorId,
      fecha: partidoData.fecha,
      hora: partidoData.hora,
      duracion: partidoData.duracion,
      direccion: partidoData.direccion,
      estado: partidoData.estado,
      equipoGanador: partidoData.equipoGanador,
      cantidadJugadores: partidoData.cantidadJugadores,
      tipoEmparejamiento: partidoData.tipoEmparejamiento,
      nivelMinimo: partidoData.nivelMinimo,
      nivelMaximo: partidoData.nivelMaximo,
      createdAt: partidoData.createdAt,
      updatedAt: partidoData.updatedAt
    };    // Agregar relaciones si están presentes
    if (partidoData.organizador) {
      dto.organizador = {
        id: partidoData.organizador.id,
        nombre: partidoData.organizador.nombre,
        email: partidoData.organizador.email
      };
    }

    if (partidoData.Deporte) {
      dto.deporte = {
        id: partidoData.Deporte.id,
        nombre: partidoData.Deporte.nombre,
      };
    }

    if (partidoData.Zona) {
      dto.zona = {
        id: partidoData.Zona.id,
        nombre: partidoData.Zona.nombre
      };
    }    if (partidoData.participantes) {
      dto.participantes = partidoData.participantes.map((participante: any) => ({
        id: participante.usuarioPartido?.id || participante.id,
        usuarioId: participante.id,
        partidoId: dto.id,
        equipo: participante.usuarioPartido?.equipo,
        fechaUnion: participante.usuarioPartido?.createdAt,
        usuario: {
          id: participante.id,
          nombre: participante.nombre,
          email: participante.email
        }
      }));
    }

    return dto;
  }

  /**
   * Validar transición de estado
   */
  static validarTransicionEstado(estadoActual: string, nuevoEstado: string): boolean {
    const transicionesValidas: { [key: string]: string[] } = {
      'NECESITAMOS_JUGADORES': ['ARMADO', 'CANCELADO'],
      'ARMADO': ['CONFIRMADO', 'CANCELADO', 'NECESITAMOS_JUGADORES'],
      'CONFIRMADO': ['EN_JUEGO', 'CANCELADO'],
      'EN_JUEGO': ['FINALIZADO'],
      'FINALIZADO': [],
      'CANCELADO': []
    };

    return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
  }
  /**
   * Verificar si un partido está completo (tiene suficientes jugadores)
   */
  static async verificarPartidoCompleto(partidoId: string): Promise<boolean> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    const partido = await Partido.findByPk(partidoId);

    if (!partido) {
      return false;
    }

    const participantes = await this.obtenerParticipantes(partidoId);
    const cantidadNecesaria = partido.cantidadJugadores || 0;

    return participantes.length >= cantidadNecesaria;
  }

  // ===== MÉTODOS USANDO PATRÓN STATE =====

  /**
   * Cambiar estado de un partido usando el patrón State
   */
  static async cambiarEstadoConValidacion(partidoId: string, nuevoEstado: EstadoPartidoType): Promise<boolean> {
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido) {
      throw new Error('Partido no encontrado');
    }

    const estadoActual = partido.estado as EstadoPartidoType;
    
    // Validar que la transición sea válida
    if (!EstadoFactory.esTransicionValida(estadoActual, nuevoEstado)) {
      throw new Error(`Transición no válida de ${estadoActual} a ${nuevoEstado}`);
    }

    // Crear instancia del estado actual y ejecutar la transición
    const estadoObj = EstadoFactory.crearEstado(estadoActual);
    
    try {
      switch (nuevoEstado) {
        case 'CONFIRMADO':
          estadoObj.confirmar(partido);
          break;
        case 'CANCELADO':
          estadoObj.cancelar(partido);
          break;
        case 'EN_JUEGO':
          estadoObj.iniciar(partido);
          break;
        case 'FINALIZADO':
          estadoObj.finalizar(partido);
          break;
        default:
          throw new Error(`Transición a ${nuevoEstado} no implementada`);
      }

      // Actualizar en base de datos
      return await this.actualizarEstadoPartido(partidoId, nuevoEstado);
    } catch (error) {
      throw new Error(`Error al cambiar estado: ${(error as Error).message}`);
    }
  }

  /**
   * Verificar si un partido permite invitaciones según su estado
   */
  static permiteInvitaciones(estadoPartido: EstadoPartidoType): boolean {
    const estado = EstadoFactory.crearEstado(estadoPartido);
    return estado.permiteInvitaciones();
  }

  /**
   * Transición automática a "ARMADO" cuando se completa el equipo
   */
  static async verificarYTransicionarArmado(partidoId: string): Promise<void> {
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido || partido.estado !== 'NECESITAMOS_JUGADORES') {
      return;
    }

    const estaCompleto = await this.verificarPartidoCompleto(partidoId);
    if (estaCompleto) {
      const estado = EstadoFactory.crearEstado('NECESITAMOS_JUGADORES') as any;
      if (estado.equipoCompleto) {
        estado.equipoCompleto(partido);
        await this.actualizarEstadoPartido(partidoId, 'ARMADO');
      }
    }
  }

  /**
   * Verificar transiciones automáticas por tiempo (ej: CONFIRMADO -> EN_JUEGO)
   */
  static async verificarTransicionesPorTiempo(partidoId: string): Promise<void> {
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido || partido.estado !== 'CONFIRMADO') {
      return;
    }

    const estado = EstadoFactory.crearEstado('CONFIRMADO') as any;
    if (estado.esHoraDeIniciar && estado.esHoraDeIniciar(partido)) {
      await this.cambiarEstadoConValidacion(partidoId, 'EN_JUEGO');
    }
  }
}
