'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historiales', {
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
      partidoId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'partido_id',
        references: {
          model: 'partidos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      resultado: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.addIndex('historiales', ['usuario_id']);
    await queryInterface.addIndex('historiales', ['partido_id']);
    await queryInterface.addIndex('historiales', ['resultado']);
    
    // Índice compuesto para consultas frecuentes
    await queryInterface.addIndex('historiales', ['usuario_id', 'partido_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('historiales');
  }
};
