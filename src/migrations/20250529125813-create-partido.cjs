'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('partidos', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      deporte_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'deportes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      zona_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'zonas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      organizador_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false
      },
      hora: {
        type: Sequelize.TIME,
        allowNull: false
      },
      duracion: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM(
          'NECESITAMOS_JUGADORES',
          'ARMADO',
          'CONFIRMADO',
          'EN_JUEGO',
          'FINALIZADO',
          'CANCELADO'
        ),
        defaultValue: 'NECESITAMOS_JUGADORES',
        allowNull: false,
      },
      equipo_ganador_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      tipo_emparejamiento: {
        type: Sequelize.ENUM(
          'NIVEL',
          'ZONA',
          'HISTORIAL'
        ),
        allowNull: false,
        defaultValue: 'ZONA',
      },
      nivel_minimo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 3 }
      },
      nivel_maximo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 3 }
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('partidos');
  }
};
