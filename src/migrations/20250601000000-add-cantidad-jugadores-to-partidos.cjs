'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('partidos', 'cantidad_jugadores', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10, // Valor por defecto temporal para partidos existentes
      validate: {
        min: 2,
        max: 50
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('partidos', 'cantidad_jugadores');
  }
};
