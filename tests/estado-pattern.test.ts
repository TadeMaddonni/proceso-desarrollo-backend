import request from 'supertest';
import app from '../src/app';

describe('Patrón State - Sistema de Partidos', () => {
  let partidoId: string;
  let usuarioId1: string;
  let usuarioId2: string;

  beforeAll(async () => {
    // IDs de usuarios existentes del seeder
    usuarioId1 = "b1da69c7-d50a-4570-84c8-6f9fc057ff3b"; // Juan
    usuarioId2 = "5e68b89a-69ae-48b3-9b9d-4de6905cf835"; // María
  });

  beforeEach(async () => {
    // Crear un nuevo partido para cada test
    const partidoData = {
      deporteId: "3adf2a29-0690-4a53-9b8c-91b6b5c91dd9", // Fútbol 5
      zonaId: "312ba00c-52cb-4225-90b6-77225fdfbd06", // Palermo
      organizadorId: usuarioId1,
      fecha: "2025-06-30",
      hora: "20:00",
      duracion: 2,
      direccion: "Cancha Test State",
      cantidadJugadores: 4
    };

    const response = await request(app)
      .post('/api/partidos')
      .send(partidoData)
      .expect(201);

    partidoId = response.body.data.id;
  });

  describe('Estados y Transiciones', () => {
    test('debería crear partido en estado NECESITAMOS_JUGADORES', async () => {
      const response = await request(app)
        .get(`/api/partidos/${partidoId}`)
        .expect(200);

      expect(response.body.data.estado).toBe('NECESITAMOS_JUGADORES');
    });

    test('debería permitir invitaciones en estado NECESITAMOS_JUGADORES', async () => {
      const response = await request(app)
        .get(`/api/partidos/${partidoId}/permite-invitaciones`)
        .expect(200);

      expect(response.body.data.permiteInvitaciones).toBe(true);
      expect(response.body.data.estado).toBe('NECESITAMOS_JUGADORES');
    });

    test('debería no permitir invitaciones en estado ARMADO', async () => {
      // Cambiar estado a ARMADO
      await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'ARMADO' })
        .expect(200);

      const response = await request(app)
        .get(`/api/partidos/${partidoId}/permite-invitaciones`)
        .expect(200);

      expect(response.body.data.permiteInvitaciones).toBe(false);
      expect(response.body.data.estado).toBe('ARMADO');
    });

    test('debería permitir transición válida NECESITAMOS_JUGADORES → ARMADO', async () => {
      const response = await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'ARMADO' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nuevoEstado).toBe('ARMADO');
    });

    test('debería permitir transición válida ARMADO → CONFIRMADO', async () => {
      // Primero cambiar a ARMADO
      await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'ARMADO' })
        .expect(200);

      // Luego cambiar a CONFIRMADO
      const response = await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'CONFIRMADO' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nuevoEstado).toBe('CONFIRMADO');
    });

    test('debería rechazar transición inválida NECESITAMOS_JUGADORES → FINALIZADO', async () => {
      const response = await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'FINALIZADO' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Transición no válida');
    });

    test('debería rechazar transición inválida CONFIRMADO → NECESITAMOS_JUGADORES', async () => {
      // Cambiar a ARMADO y luego a CONFIRMADO
      await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'ARMADO' })
        .expect(200);

      await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'CONFIRMADO' })
        .expect(200);

      // Intentar transición inválida
      const response = await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'NECESITAMOS_JUGADORES' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Transición no válida');
    });
  });

  describe('Unirse a Partidos y Auto-transiciones', () => {
    test('debería permitir unirse a partido en estado NECESITAMOS_JUGADORES', async () => {
      const response = await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId2, equipo: 'A' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.participacion.equipo).toBe('A');
    });

    test('debería auto-balancear equipos cuando no se especifica equipo', async () => {
      // Primer usuario al equipo A
      await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId1, equipo: 'A' })
        .expect(200);

      // Segundo usuario sin especificar equipo (debería ir al B)
      const response = await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId2 })
        .expect(200);

      expect(response.body.data.participacion.equipo).toBe('B');
    });

    test('debería transicionar automáticamente a ARMADO cuando se completa el partido', async () => {
      // IDs adicionales de usuarios del seeder
      const usuarioId3 = "5d1607ca-7e78-49ab-ad44-1fbc2fb8b7af"; // Carlos
      const usuarioId4 = "3dbf4490-480d-4fd5-b251-33f38b8127c8"; // Ana

      // Llenar el partido (cantidadJugadores: 4)
      await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId1, equipo: 'A' })
        .expect(200);

      await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId2, equipo: 'B' })
        .expect(200);

      await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId3, equipo: 'A' })
        .expect(200);

      // El último usuario debería completar el partido
      const lastResponse = await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId4, equipo: 'B' })
        .expect(200);

      expect(lastResponse.body.data.partidoCompleto).toBe(true);

      // Verificar que el estado cambió a ARMADO
      const partidoResponse = await request(app)
        .get(`/api/partidos/${partidoId}`)
        .expect(200);

      expect(partidoResponse.body.data.estado).toBe('ARMADO');
    });

    test('debería rechazar unirse a partido que no permite invitaciones', async () => {
      // Cambiar estado a ARMADO (no permite invitaciones)
      await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'ARMADO' })
        .expect(200);

      // Intentar unirse
      const response = await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId2, equipo: 'A' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No es posible unirse al partido en estado ARMADO');
    });
  });

  describe('Validaciones del Patrón State', () => {
    test('debería validar estado requerido para cambio de estado', async () => {
      const response = await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({}) // Sin nuevoEstado
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('debería validar estado válido para cambio de estado', async () => {
      const response = await request(app)
        .put(`/api/partidos/${partidoId}/cambiar-estado`)
        .send({ nuevoEstado: 'ESTADO_INVALIDO' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('debería mantener consistencia de estado después de operaciones', async () => {
      // Unir un usuario
      await request(app)
        .post(`/api/partidos/${partidoId}/unirse`)
        .send({ usuarioId: usuarioId1, equipo: 'A' })
        .expect(200);

      // Verificar que el estado sigue siendo NECESITAMOS_JUGADORES
      const response = await request(app)
        .get(`/api/partidos/${partidoId}`)
        .expect(200);

      expect(response.body.data.estado).toBe('NECESITAMOS_JUGADORES');
      expect(response.body.data.participantes).toHaveLength(1);
    });
  });

  describe('Principios SOLID en Patrón State', () => {
    test('debería verificar que el patrón State está implementado correctamente', () => {
      // Este test verifica que tenemos las clases del patrón State
      const fs = require('fs');
      const path = require('path');
      
      const estadosPath = path.join(__dirname, '../src/services/partido/estados');
      expect(fs.existsSync(estadosPath)).toBe(true);

      // Verificar archivos del patrón State
      const expectedFiles = [
        'EstadoPartido.ts',
        'NecesitamosJugadores.ts',
        'Armado.ts',
        'Confirmado.ts',
        'EnJuego.ts',
        'Finalizado.ts',
        'Cancelado.ts',
        'EstadoFactory.ts'
      ];

      expectedFiles.forEach(file => {
        const filePath = path.join(estadosPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });
});
