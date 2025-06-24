'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Verificar si la columna score ya existe antes de agregarla
    const tableInfo = await queryInterface.describeTable('usuarios');
    
    if (!tableInfo.score) {
      await queryInterface.addColumn('usuarios', 'score', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Verificar si la columna score existe antes de eliminarla
    const tableInfo = await queryInterface.describeTable('usuarios');
    
    if (tableInfo.score) {
      await queryInterface.removeColumn('usuarios', 'score');
    }
  }
};
