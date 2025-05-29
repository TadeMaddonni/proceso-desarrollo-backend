import dotenv from 'dotenv';
dotenv.config();

console.log('🔄 Ejecutando migraciones...');

async function runMigrations() {
  try {
    console.log('📦 Importando Sequelize y models...');
    const db = await import('./src/models/index.js');
    const { sequelize } = db.default;
    
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Sincronización completada');
    
    console.log('🔌 Cerrando conexión...');
    await sequelize.close();
    console.log('✅ Migraciones completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
