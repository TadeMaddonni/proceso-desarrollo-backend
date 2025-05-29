'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Función helper para agregar constraint con manejo de errores
    async function addConstraintSafely(tableName, constraint) {
      try {
        await queryInterface.addConstraint(tableName, constraint);
        console.log(`✓ Constraint ${constraint.name} agregada exitosamente`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('constraint already exists')) {
          console.log(`⚠ Constraint ${constraint.name} ya existe, saltando...`);
        } else {
          console.error(`✗ Error agregando constraint ${constraint.name}:`, error.message);
          throw error;
        }
      }
    }
    
    // Solo agregar la columna equipoGanadorId si no existe
    const table = await queryInterface.describeTable('Partidos');
    if (!table.equipoGanadorId) {
      await queryInterface.addColumn('Partidos', 'equipoGanadorId', {
        type: Sequelize.UUID,
        allowNull: true
      });
      console.log('✓ Columna equipoGanadorId agregada a tabla Partidos');
    } else {
      console.log('⚠ Columna equipoGanadorId ya existe en tabla Partidos');
    }

    // Foreign keys para tabla Usuarios
    await addConstraintSafely('Usuarios', {
      fields: ['zonaId'],
      type: 'foreign key',
      name: 'FK_Usuario_Zona',
      references: {
        table: 'Zonas',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await addConstraintSafely('Usuarios', {
      fields: ['deporteId'],
      type: 'foreign key',
      name: 'FK_Usuario_Deporte',
      references: {
        table: 'Deportes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Foreign keys para tabla Partidos
    await addConstraintSafely('Partidos', {
      fields: ['deporteId'],
      type: 'foreign key',
      name: 'FK_Partido_Deporte',
      references: {
        table: 'Deportes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await addConstraintSafely('Partidos', {
      fields: ['zonaId'],
      type: 'foreign key',
      name: 'FK_Partido_Zona',
      references: {
        table: 'Zonas',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await addConstraintSafely('Partidos', {
      fields: ['organizadorId'],
      type: 'foreign key',
      name: 'FK_Partido_Organizador',
      references: {
        table: 'Usuarios',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await addConstraintSafely('Partidos', {
      fields: ['equipoGanadorId'],
      type: 'foreign key',
      name: 'FK_Partido_EquipoGanador',
      references: {
        table: 'Equipos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Foreign keys para tabla Equipos
    await addConstraintSafely('Equipos', {
      fields: ['partidoId'],
      type: 'foreign key',
      name: 'FK_Equipo_Partido',
      references: {
        table: 'Partidos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });    // Foreign keys para tabla UsuarioEquipos
    await addConstraintSafely('UsuarioEquipos', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'FK_UsuarioEquipo_Usuario',
      references: {
        table: 'Usuarios',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await addConstraintSafely('UsuarioEquipos', {
      fields: ['equipoId'],
      type: 'foreign key',
      name: 'FK_UsuarioEquipo_Equipo',
      references: {
        table: 'Equipos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Foreign keys para tabla Invitacions (corregido nombre)
    await addConstraintSafely('Invitacions', {
      fields: ['partidoId'],
      type: 'foreign key',
      name: 'FK_Invitacion_Partido',
      references: {
        table: 'Partidos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await addConstraintSafely('Invitacions', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'FK_Invitacion_Usuario',
      references: {
        table: 'Usuarios',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Foreign keys para tabla Historials
    await addConstraintSafely('Historials', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'FK_Historial_Usuario',
      references: {
        table: 'Usuarios',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await addConstraintSafely('Historials', {
      fields: ['partidoId'],
      type: 'foreign key',
      name: 'FK_Historial_Partido',
      references: {
        table: 'Partidos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    // Función helper para eliminar constraint con manejo de errores
    async function removeConstraintSafely(tableName, constraintName) {
      try {
        await queryInterface.removeConstraint(tableName, constraintName);
        console.log(`✓ Constraint ${constraintName} eliminada exitosamente`);
      } catch (error) {
        if (error.message.includes('does not exist') || error.message.includes('constraint does not exist')) {
          console.log(`⚠ Constraint ${constraintName} no existe, saltando...`);
        } else {
          console.error(`✗ Error eliminando constraint ${constraintName}:`, error.message);
          throw error;
        }
      }
    }

    // Eliminar foreign keys en orden inverso
    await removeConstraintSafely('Historials', 'FK_Historial_Partido');
    await removeConstraintSafely('Historials', 'FK_Historial_Usuario');
    await removeConstraintSafely('Invitacions', 'FK_Invitacion_Usuario');
    await removeConstraintSafely('Invitacions', 'FK_Invitacion_Partido');
    await removeConstraintSafely('UsuarioEquipos', 'FK_UsuarioEquipo_Equipo');
    await removeConstraintSafely('UsuarioEquipos', 'FK_UsuarioEquipo_Usuario');
    await removeConstraintSafely('Equipos', 'FK_Equipo_Partido');
    await removeConstraintSafely('Partidos', 'FK_Partido_EquipoGanador');
    await removeConstraintSafely('Partidos', 'FK_Partido_Organizador');
    await removeConstraintSafely('Partidos', 'FK_Partido_Zona');
    await removeConstraintSafely('Partidos', 'FK_Partido_Deporte');
    await removeConstraintSafely('Usuarios', 'FK_Usuario_Deporte');
    await removeConstraintSafely('Usuarios', 'FK_Usuario_Zona');

    // Eliminar la columna equipoGanadorId si existe
    const table = await queryInterface.describeTable('Partidos');
    if (table.equipoGanadorId) {
      await queryInterface.removeColumn('Partidos', 'equipoGanadorId');
      console.log('✓ Columna equipoGanadorId eliminada de tabla Partidos');
    } else {
      console.log('⚠ Columna equipoGanadorId no existe en tabla Partidos');
    }
  }
};
