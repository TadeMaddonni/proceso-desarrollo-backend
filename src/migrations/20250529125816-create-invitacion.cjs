'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invitaciones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      estado: {
        type: Sequelize.ENUM('pendiente', 'aceptada', 'cancelada'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      criterioOrigen: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'criterio_origen'
      },
      fechaEnvio: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'fecha_envio'
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
    await queryInterface.addIndex('invitaciones', ['partido_id']);
    await queryInterface.addIndex('invitaciones', ['usuario_id']);
    await queryInterface.addIndex('invitaciones', ['estado']);
    await queryInterface.addIndex('invitaciones', ['fecha_envio']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invitaciones');
  }
};
