'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {  async up(queryInterface, Sequelize) {
    // Verificar y eliminar tablas que dependen de equipos solo si existen
    try {
      await queryInterface.dropTable('usuario_equipos');
    } catch (error) {
      console.log('Tabla usuario_equipos no existe, continuando...');
    }
    
    try {
      await queryInterface.dropTable('equipos');
    } catch (error) {
      console.log('Tabla equipos no existe, continuando...');
    }
    
    // Creamos la nueva tabla usuario_partidos
    await queryInterface.createTable('usuario_partidos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      partido_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'partidos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },      equipo: {
        type: Sequelize.ENUM('A', 'B'),
        allowNull: true
      },
      fecha_union: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
      // Eliminamos la columna equipo_ganador_id de partidos ya que no habrá equipos (solo si existe)
    try {
      await queryInterface.removeColumn('partidos', 'equipo_ganador_id');
    } catch (error) {
      console.log('Columna equipo_ganador_id no existe, continuando...');
    }
    
    // Agregamos columna equipo_ganador para indicar qué equipo ganó (A o B)
    await queryInterface.addColumn('partidos', 'equipo_ganador', {
      type: Sequelize.ENUM('A', 'B'),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios
    await queryInterface.dropTable('usuario_partidos');
    
    // Recrear tabla equipos
    await queryInterface.createTable('equipos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      partido_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'partidos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Recrear tabla usuario_equipos
    await queryInterface.createTable('usuario_equipos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      equipo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'equipos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Restaurar columna equipo_ganador_id
    await queryInterface.removeColumn('partidos', 'equipo_ganador');
    await queryInterface.addColumn('partidos', 'equipo_ganador_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'equipos',
        key: 'id'
      }
    });
  }
};
