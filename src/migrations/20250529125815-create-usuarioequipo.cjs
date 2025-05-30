'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuario_equipos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      usuarioId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'usuario_id',
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      equipoId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'equipo_id',
        references: {
          model: 'equipos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    });

    // Añadir índices para mejorar el rendimiento
    await queryInterface.addIndex('usuario_equipos', ['usuario_id']);
    await queryInterface.addIndex('usuario_equipos', ['equipo_id']);
    
    // Añadir índice único para evitar duplicados
    await queryInterface.addIndex('usuario_equipos', ['usuario_id', 'equipo_id'], {
      unique: true,
      name: 'unique_usuario_equipo'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario_equipos');
  }
};
