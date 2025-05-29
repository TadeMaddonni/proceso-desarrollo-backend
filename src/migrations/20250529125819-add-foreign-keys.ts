import { QueryInterface, DataTypes } from 'sequelize';

interface ConstraintOptions {
  fields: string[];
  type: 'foreign key';
  name: string;
  references: {
    table: string;
    field: string;
  };
  onUpdate: string;
  onDelete: string;
}

export const up = async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
  // Función helper para agregar constraint con manejo de errores
  async function addConstraintSafely(tableName: string, constraint: ConstraintOptions): Promise<void> {
    try {
      await queryInterface.addConstraint(tableName, constraint);
      console.log(`✓ Constraint ${constraint.name} agregada exitosamente`);
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('constraint already exists')) {
        console.log(`⚠ Constraint ${constraint.name} ya existe, saltando...`);
      } else {
        console.error(`✗ Error agregando constraint ${constraint.name}:`, error.message);
        throw error;
      }
    }
  }
  
  // Solo agregar la columna equipoGanadorId si no existe
  const table = await queryInterface.describeTable('partidos');
  if (!table.equipo_ganador_id) {
    await queryInterface.addColumn('partidos', 'equipo_ganador_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
    console.log('✓ Columna equipo_ganador_id agregada a tabla partidos');
  } else {
    console.log('⚠ Columna equipo_ganador_id ya existe en tabla partidos');
  }

  // Foreign keys para tabla usuarios
  await addConstraintSafely('usuarios', {
    fields: ['zona_id'],
    type: 'foreign key',
    name: 'FK_Usuario_Zona',
    references: {
      table: 'zonas',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await addConstraintSafely('usuarios', {
    fields: ['deporte_id'],
    type: 'foreign key',
    name: 'FK_Usuario_Deporte',
    references: {
      table: 'deportes',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  // Foreign keys para tabla partidos
  await addConstraintSafely('partidos', {
    fields: ['deporte_id'],
    type: 'foreign key',
    name: 'FK_Partido_Deporte',
    references: {
      table: 'deportes',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await addConstraintSafely('partidos', {
    fields: ['zona_id'],
    type: 'foreign key',
    name: 'FK_Partido_Zona',
    references: {
      table: 'zonas',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await addConstraintSafely('partidos', {
    fields: ['organizador_id'],
    type: 'foreign key',
    name: 'FK_Partido_Organizador',
    references: {
      table: 'usuarios',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await addConstraintSafely('partidos', {
    fields: ['equipo_ganador_id'],
    type: 'foreign key',
    name: 'FK_Partido_EquipoGanador',
    references: {
      table: 'equipos',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  // Foreign keys para tabla equipos
  await addConstraintSafely('equipos', {
    fields: ['partido_id'],
    type: 'foreign key',
    name: 'FK_Equipo_Partido',
    references: {
      table: 'partidos',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  // Foreign keys para tabla usuario_equipos
  await addConstraintSafely('usuario_equipos', {
    fields: ['usuario_id'],
    type: 'foreign key',
    name: 'FK_UsuarioEquipo_Usuario',
    references: {
      table: 'usuarios',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  await addConstraintSafely('usuario_equipos', {
    fields: ['equipo_id'],
    type: 'foreign key',
    name: 'FK_UsuarioEquipo_Equipo',
    references: {
      table: 'equipos',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  // Foreign keys para tabla invitaciones
  await addConstraintSafely('invitaciones', {
    fields: ['partido_id'],
    type: 'foreign key',
    name: 'FK_Invitacion_Partido',
    references: {
      table: 'partidos',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  await addConstraintSafely('invitaciones', {
    fields: ['usuario_id'],
    type: 'foreign key',
    name: 'FK_Invitacion_Usuario',
    references: {
      table: 'usuarios',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  // Foreign keys para tabla historiales
  await addConstraintSafely('historiales', {
    fields: ['usuario_id'],
    type: 'foreign key',
    name: 'FK_Historial_Usuario',
    references: {
      table: 'usuarios',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  await addConstraintSafely('historiales', {
    fields: ['partido_id'],
    type: 'foreign key',
    name: 'FK_Historial_Partido',
    references: {
      table: 'partidos',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Función helper para eliminar constraint con manejo de errores
  async function removeConstraintSafely(tableName: string, constraintName: string): Promise<void> {
    try {
      await queryInterface.removeConstraint(tableName, constraintName);
      console.log(`✓ Constraint ${constraintName} eliminada exitosamente`);
    } catch (error: any) {
      if (error.message.includes('does not exist') || error.message.includes('constraint does not exist')) {
        console.log(`⚠ Constraint ${constraintName} no existe, saltando...`);
      } else {
        console.error(`✗ Error eliminando constraint ${constraintName}:`, error.message);
        throw error;
      }
    }
  }

  // Eliminar foreign keys en orden inverso
  await removeConstraintSafely('historiales', 'FK_Historial_Partido');
  await removeConstraintSafely('historiales', 'FK_Historial_Usuario');
  await removeConstraintSafely('invitaciones', 'FK_Invitacion_Usuario');
  await removeConstraintSafely('invitaciones', 'FK_Invitacion_Partido');
  await removeConstraintSafely('usuario_equipos', 'FK_UsuarioEquipo_Equipo');
  await removeConstraintSafely('usuario_equipos', 'FK_UsuarioEquipo_Usuario');
  await removeConstraintSafely('equipos', 'FK_Equipo_Partido');
  await removeConstraintSafely('partidos', 'FK_Partido_EquipoGanador');
  await removeConstraintSafely('partidos', 'FK_Partido_Organizador');
  await removeConstraintSafely('partidos', 'FK_Partido_Zona');
  await removeConstraintSafely('partidos', 'FK_Partido_Deporte');
  await removeConstraintSafely('usuarios', 'FK_Usuario_Deporte');
  await removeConstraintSafely('usuarios', 'FK_Usuario_Zona');

  // Eliminar la columna equipo_ganador_id si existe
  const table = await queryInterface.describeTable('partidos');
  if (table.equipo_ganador_id) {
    await queryInterface.removeColumn('partidos', 'equipo_ganador_id');
    console.log('✓ Columna equipo_ganador_id eliminada de tabla partidos');
  } else {
    console.log('⚠ Columna equipo_ganador_id no existe en tabla partidos');
  }
};
