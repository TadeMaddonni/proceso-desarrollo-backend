'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      contraseña: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nivel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 3
        }
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
      },      deporte_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'deportes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 50
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }    });

    // Añadir índices para mejorar el rendimiento
    await queryInterface.addIndex('usuarios', ['correo'], { unique: true });
    await queryInterface.addIndex('usuarios', ['zona_id']);
    await queryInterface.addIndex('usuarios', ['deporte_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
