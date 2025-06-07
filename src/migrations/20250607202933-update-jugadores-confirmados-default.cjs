'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Cambiar el valor por defecto de jugadores_confirmados de 0 a 1
    await queryInterface.changeColumn('partidos', 'jugadores_confirmados', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    // Actualizar los registros existentes que tengan 0 jugadores confirmados
    await queryInterface.sequelize.query(
      "UPDATE partidos SET jugadores_confirmados = 1 WHERE jugadores_confirmados = 0"
    );
  },

  async down (queryInterface, Sequelize) {
    // Revertir el cambio: cambiar el valor por defecto de 1 a 0
    await queryInterface.changeColumn('partidos', 'jugadores_confirmados', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Revertir los registros que se actualizaron (opcional)
    await queryInterface.sequelize.query(
      "UPDATE partidos SET jugadores_confirmados = 0 WHERE jugadores_confirmados = 1"
    );
  }
};
