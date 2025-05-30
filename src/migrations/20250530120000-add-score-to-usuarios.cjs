'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'score', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 50
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'score');
  }
};
