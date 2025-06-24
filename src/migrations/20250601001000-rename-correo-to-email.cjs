'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna 'correo' existe antes de intentar renombrarla
    const tableInfo = await queryInterface.describeTable('usuarios');
    
    if (tableInfo.correo) {
      // Renombrar la columna 'correo' a 'email'
      await queryInterface.renameColumn('usuarios', 'correo', 'email');
      console.log('Columna correo renombrada a email exitosamente');
    } else if (!tableInfo.email) {
      // Si no existe ni correo ni email, crear la columna email
      await queryInterface.addColumn('usuarios', 'email', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        defaultValue: 'temp@example.com' // Valor temporal para evitar errores
      });
      console.log('Columna email creada exitosamente');
    } else {
      console.log('La columna email ya existe, no se requiere migración');
    }
  },

  async down(queryInterface, Sequelize) {
    // Verificar si la columna 'email' existe antes de intentar renombrarla
    const tableInfo = await queryInterface.describeTable('usuarios');
    
    if (tableInfo.email) {
      // Renombrar la columna 'email' de vuelta a 'correo'
      await queryInterface.renameColumn('usuarios', 'email', 'correo');
      console.log('Columna email renombrada de vuelta a correo');
    }
  }
};
