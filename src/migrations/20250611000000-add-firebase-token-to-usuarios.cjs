'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'firebase_token', {
      type: Sequelize.STRING(500), // Los tokens de Firebase pueden ser largos
      allowNull: true,
      comment: 'Token de Firebase para notificaciones push'
    });

    // Agregar índice para mejorar las consultas por token
    await queryInterface.addIndex('usuarios', ['firebase_token'], {
      name: 'idx_usuarios_firebase_token'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice primero
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_firebase_token');
    
    // Luego eliminar la columna
    await queryInterface.removeColumn('usuarios', 'firebase_token');
  }
};
