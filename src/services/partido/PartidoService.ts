import dbPromise from '../../models/index.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';
import type { PartidoCreationDTO, PartidoUpdateDTO, PartidoFinalizarDTO, UnirsePartidoDTO } from '../../DTOs/PartidoCreationDTO.js';
import { EmparejamientoService } from './emparejamiento/EmparejamientoService.js';
import { EstadoFactory, type EstadoPartidoType } from './estados/EstadoFactory.js';
import { ScoreService } from '../usuario/ScoreService.js';
import { PartidoSubject } from '../../observers/PartidoSubject.js';

export class PartidoService {
  // Instancia única del subject para el patrón Observer
  private static subject: PartidoSubject = new PartidoSubject();

  // Inicializar observadores (se ejecuta al cargar la clase)
  static {
    this.inicializarObservadores();
  }

  /**
   * Inicializar los observadores del partido
   */
  private static async inicializarObservadores(): Promise<void> {
    const { NotificacionObserver } = await import('../../observers/NotificacionObserver.js');
    const { InvitacionObserver } = await import('../../observers/InvitacionObserver.js');
    
    this.subject.agregarObservador(new NotificacionObserver());
    this.subject.agregarObservador(new InvitacionObserver());
    console.log('[PartidoService] Observadores inicializados');
  }

  /**
   * Crear un nuevo partido
   */
  static async crearPartido(datosPartido: PartidoCreationDTO): Promise<PartidoDTO> {
    const db = await dbPromise;
    const Partido = db.Partido as any;
    const UsuarioPartido = db.UsuarioPartido as any;

    // Crear el partido con estado inicial
    const nuevoPartido = await Partido.create({
      ...datosPartido,
      fecha: new Date(datosPartido.fecha),
      estado: 'NECESITAMOS_JUGADORES',
      tipoEmparejamiento: datosPartido.tipoEmparejamiento || 'ZONA',
      jugadoresConfirmados: 1 // Inicializar con 1 porque el organizador ya está incluido
    });

    // Agregar al organizador como participante
    await UsuarioPartido.create({
      usuarioId: datosPartido.organizadorId,
      partidoId: nuevoPartido.id,
      equipo: 'A' // Por defecto en equipo A
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
          attributes: ['id', 'nombre', 'email', 'firebaseToken']
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
          attributes: ['id', 'nombre', 'email', 'nivel', 'firebaseToken'],
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
  }  /**
   * Actualizar datos de un partido
   */
  static async actualizarPartido(id: string, datosActualizacion: PartidoUpdateDTO): Promise<boolean> {
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
    });

    return participantes.map((participante: any) => ({
      id: participante.id,
      usuarioId: participante.usuarioId,
      partidoId: participante.partidoId,
      equipo: participante.equipo,
      fechaUnion: participante.createdAt,
      usuario: participante.Usuario
    }));
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
      jugadoresConfirmados: partidoData.jugadoresConfirmados,
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
      jugadoresConfirmados: partidoData.jugadoresConfirmados,
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
        email: partidoData.organizador.email,
        firebaseToken: partidoData.organizador.firebaseToken
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
          email: participante.email,
          firebaseToken: participante.firebaseToken
        }
      }));
    }

    return dto;
  }  // =====================================
  // SECCIÓN: MÉTODOS PATRÓN STATE
  // =====================================
  // Todos los métodos relacionados con transiciones de estado están agrupados aquí
  // para facilitar el mantenimiento y comprensión del patrón State implementado
  /**
   * Unir un usuario a un partido - delegado al patrón State
   */
  static async unirUsuarioAPartido(partidoId: string, datosUnirse: UnirsePartidoDTO): Promise<any> {
    // Obtener el partido y verificar su estado
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido) {
      throw new Error('Partido no encontrado');
    }

    // Obtener el estado actual y verificar si permite unir usuarios
    const estadoActual = partido.estado as EstadoPartidoType;
    const estado = EstadoFactory.crearEstado(estadoActual) as any;
    
    // Verificar si el estado actual tiene el método unirUsuario
    if (!estado.unirUsuario) {
      throw new Error(`No se puede unir a un partido en estado ${estadoActual}`);
    }

    // Delegar la lógica al estado correspondiente
    return await estado.unirUsuario(partidoId, datosUnirse);
  }
  /**
   * Verificar si un partido puede ser modificado usando el patrón State
   */
  static async puedeSerModificado(partidoId: string): Promise<boolean> {
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido) {
      return false;
    }

    // Delegar completamente a EstadoFactory - verificar si hay transiciones válidas disponibles
    const estadoActual = partido.estado as EstadoPartidoType;
    const estadosValidos = EstadoFactory.obtenerEstadosValidos();
    
    // Un partido puede ser modificado si existe al menos una transición válida desde su estado actual
    return estadosValidos.some(nuevoEstado => 
      nuevoEstado !== estadoActual && EstadoFactory.esTransicionValida(estadoActual, nuevoEstado)
    );
  }

  /**
   * Cambiar estado de un partido usando el patrón State
   */
  static async cambiarEstadoConValidacion(partidoId: string, nuevoEstado: EstadoPartidoType, equipoGanador?: 'A' | 'B'): Promise<boolean> {
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
          await estadoObj.finalizar(partido, equipoGanador);
          // Si hay equipo ganador, también actualizar en la base de datos
          if (equipoGanador) {
            const db = await dbPromise;
            const Partido = db.Partido as any;
            await Partido.update(
              { equipoGanador }, 
              { where: { id: partidoId } }
            );
          }
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
   * Transición automática a "ARMADO" cuando se completa el equipo
   * Delegado al estado correspondiente siguiendo el patrón State
   */  
  static async verificarYTransicionarArmado(partidoId: string): Promise<void> {
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido || partido.estado !== 'NECESITAMOS_JUGADORES') {
      return;
    }

    // Delegar la lógica al estado correspondiente
    const estado = EstadoFactory.crearEstado('NECESITAMOS_JUGADORES');
    if (estado.verificarYTransicionar) {
      await estado.verificarYTransicionar(partido);
    }
  }

  /**
   * Transición automática a "NECESITAMOS_JUGADORES" cuando ya no hay suficientes jugadores
   * Delegado al estado correspondiente siguiendo el patrón State
   */  
  static async verificarYTransicionarANecesitamosJugadores(partidoId: string): Promise<void> {
    const partido = await this.obtenerPartidoPorId(partidoId);
    if (!partido || partido.estado !== 'ARMADO') {
      return;
    }

    // Verificar si ya no tiene suficientes jugadores
    const estaCompleto = await this.verificarPartidoCompleto(partidoId);
    if (!estaCompleto) {
      // Cambiar estado usando el método con validación
      await this.cambiarEstadoConValidacion(partidoId, 'NECESITAMOS_JUGADORES');
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

  /**
   * Verificar si un partido permite invitaciones según su estado
   */
  static permiteInvitaciones(estadoPartido: EstadoPartidoType): boolean {
    const estado = EstadoFactory.crearEstado(estadoPartido);
    return estado.permiteInvitaciones();
  }
  /**
   * Método público para notificar cambios de estado desde los estados del patrón State
   */
  static async notificarCambioEstado(partido: PartidoDTO, estadoAnterior: string, nuevoEstado: string): Promise<void> {
    try {
      await this.subject.notificarObservadores(partido, estadoAnterior, nuevoEstado);
    } catch (error) {
      console.error('[PartidoService] Error al notificar cambio de estado:', error);
      throw error;
    }
  }

  /**
   * Método para que las clases de estado puedan actualizar el estado en base de datos
   * Solo debe ser usado por las clases de estado del patrón State
   */
  static async actualizarEstadoEnBD(id: string, nuevoEstado: string): Promise<boolean> {
    return await this.actualizarEstadoPartido(id, nuevoEstado);
  }

  /**
   * Actualizar el estado de un partido (método interno)
   * Solo debe ser usado por el propio PartidoService y las clases de estado
   */
  private static async actualizarEstadoPartido(id: string, nuevoEstado: string): Promise<boolean> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    // Obtener el estado anterior del partido antes de actualizarlo
    const partidoAntes = await this.obtenerPartidoPorId(id);
    if (!partidoAntes) {
      return false;
    }
    const estadoAnterior = partidoAntes.estado;

    const [rowsUpdated] = await Partido.update(
      { 
        estado: nuevoEstado,
        updatedAt: new Date()
      },
      { where: { id } }
    );

    // Si se actualizó correctamente y cambió el estado, notificar observadores
    if (rowsUpdated > 0 && estadoAnterior !== nuevoEstado) {
      try {
        const partidoActualizado = await this.obtenerPartidoPorId(id);
        if (partidoActualizado) {
          await this.subject.notificarObservadores(partidoActualizado, estadoAnterior, nuevoEstado);
        }
      } catch (error) {
        console.error('[PartidoService] Error al notificar observadores:', error);
        // No fallar la actualización del estado si hay error en notificaciones
      }
    }

    return rowsUpdated > 0;
  }

  // =====================================
  // FIN SECCIÓN: MÉTODOS PATRÓN STATE
  // =====================================

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

    const cantidadNecesaria = partido.cantidadJugadores || 0;
    const jugadoresConfirmados = partido.jugadoresConfirmados || 0;

    return jugadoresConfirmados >= cantidadNecesaria;
  }

  /**
   * Remover un usuario de un partido
   */
  static async removerUsuarioDePartido(partidoId: string, usuarioId: string): Promise<boolean> {
    const db = await dbPromise;
    const UsuarioPartido = db.UsuarioPartido as any;
    const Partido = db.Partido as any;

    // Buscar la relación usuario-partido
    const usuarioPartido = await UsuarioPartido.findOne({
      where: { 
        usuarioId: usuarioId,
        partidoId: partidoId 
      }
    });

    if (!usuarioPartido) {
      return false; // No está en el partido
    }

    // Eliminar la relación usuario-partido
    await usuarioPartido.destroy();    // Decrementar jugadoresConfirmados en el partido
    await Partido.decrement('jugadoresConfirmados', {
      where: { id: partidoId }
    });

    // Verificar si necesita volver al estado "NECESITAMOS_JUGADORES" usando patrón State
    await this.verificarYTransicionarANecesitamosJugadores(partidoId);

    return true;
  }

  /**
   * Obtener todos los partidos de un usuario específico (como organizador o participante)
   */
  static async obtenerPartidosDeUsuario(userId: string): Promise<PartidoDTO[]> {
    const db = await dbPromise;
    const Partido = db.Partido as any;
    const Usuario = db.Usuario as any;
    const Deporte = db.Deporte as any;
    const Zona = db.Zona as any;
    const UsuarioPartido = db.UsuarioPartido as any;

    // Obtener partidos donde el usuario es organizador
    const partidosComoOrganizador = await Partido.findAll({
      where: {
        organizadorId: userId
      },
      include: [
        {
          model: Usuario,
          as: 'organizador',
          attributes: ['id', 'nombre', 'email', 'firebaseToken']
        },
        {
          model: Deporte,
          attributes: ['id', 'nombre']
        },
        {
          model: Zona,
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          as: 'participantes',
          attributes: ['id', 'nombre', 'email', 'nivel', 'firebaseToken'],
          through: {
            attributes: ['equipo'],
            as: 'usuarioPartido'
          }
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    // Obtener partidos donde el usuario es participante
    const partidosComoParticipante = await Partido.findAll({
      include: [
        {
          model: Usuario,
          as: 'organizador',
          attributes: ['id', 'nombre', 'email', 'firebaseToken']
        },
        {
          model: Deporte,
          attributes: ['id', 'nombre']
        },
        {
          model: Zona,
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          as: 'participantes',
          attributes: ['id', 'nombre', 'email', 'nivel', 'firebaseToken'],
          through: {
            attributes: ['equipo'],
            as: 'usuarioPartido'
          },
          where: {
            id: userId
          }
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    // Combinar ambos resultados y eliminar duplicados
    const todosLosPartidos = [...partidosComoOrganizador, ...partidosComoParticipante];
    const partidosUnicos = todosLosPartidos.filter((partido, index, array) => 
      array.findIndex(p => p.id === partido.id) === index
    );

    return partidosUnicos.map((partido: any) => this.mapearPartidoConRelacionesADTO(partido));
  }

  /**
   * Actualizar equipo ganador de un partido finalizado
   * @param partidoId ID del partido
   * @param equipoGanador 'A' o 'B'
   * @returns Partido actualizado
   */
  static async actualizarEquipoGanador(partidoId: string, equipoGanador: 'A' | 'B'): Promise<{ success: boolean, message: string, partido?: any }> {
    const db = await dbPromise;
    const Partido = db.Partido as any;
    const Usuario = db.Usuario as any;
    const Deporte = db.Deporte as any;
    const Zona = db.Zona as any;
    
    try {
      // Obtener el partido
      const partido = await Partido.findByPk(partidoId, {
        include: [
          { model: Usuario, as: 'organizador' },
          { model: Deporte },
          { model: Zona }
        ]
      });
      
      if (!partido) {
        return { 
          success: false, 
          message: 'Partido no encontrado' 
        };
      }      
      // Validar que el partido esté finalizado usando EstadoFactory
      const estadoActual = partido.estado as EstadoPartidoType;
      if (estadoActual !== 'FINALIZADO') {
        return { 
          success: false, 
          message: 'Solo se puede establecer el equipo ganador en un partido finalizado' 
        };
      }
      
      // Validar el equipo ganador
      if (!['A', 'B'].includes(equipoGanador)) {
        return { 
          success: false, 
          message: 'El equipo ganador debe ser A o B' 
        };
      }
      
      // Actualizar el campo equipoGanador
      partido.equipoGanador = equipoGanador;      await partido.save();
        // No notificamos a los observadores por ahora
      // Se podría implementar una notificación específica más adelante
      return { 
        success: true, 
        message: `Equipo ${equipoGanador} marcado como ganador`, 
        partido: partido 
      };
    } catch (error) {
      console.error('[PartidoService] Error al actualizar equipo ganador:', error);
      return { 
        success: false, 
        message: `Error al actualizar equipo ganador: ${(error as Error).message}` 
      };
    }
  }
}
