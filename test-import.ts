console.log('🔄 Iniciando test de importación...');

try {
  console.log('📦 Importando dotenv...');
  import('dotenv').then(dotenv => {
    console.log('✅ dotenv importado correctamente');
    dotenv.config();
    console.log('✅ dotenv configurado');
    
    console.log('📦 Importando models...');
    return import('./src/models/index.js');
  }).then(db => {
    console.log('✅ Models importados correctamente');
    console.log('🔍 Modelos disponibles:', Object.keys(db.default));
    
    // Intentar autenticar
    return db.default.sequelize.authenticate();
  }).then(() => {
    console.log('✅ Conexión a la base de datos exitosa');
  }).catch(error => {
    console.error('❌ Error:', error);
  });
} catch (error) {
  console.error('❌ Error sincrónico:', error);
}
