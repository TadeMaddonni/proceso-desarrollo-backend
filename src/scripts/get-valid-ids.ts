import dbPromise from '../models/index.js';

async function getValidIds() {
  try {
    const db = await dbPromise;
    const Zona = db.Zona as any;
    const Deporte = db.Deporte as any;

    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();

    console.log('Zona ID:', zona?.id || 'No hay zonas');
    console.log('Deporte ID:', deporte?.id || 'No hay deportes');

    if (!zona || !deporte) {
      console.log('Creando zona y deporte de prueba...');
      
      const nuevaZona = await Zona.create({
        nombre: 'Zona Test',
        descripcion: 'Zona para pruebas'
      });

      const nuevoDeporte = await Deporte.create({
        nombre: 'Fútbol Test',
        descripcion: 'Deporte para pruebas'
      });

      console.log('Nueva Zona ID:', nuevaZona.id);
      console.log('Nuevo Deporte ID:', nuevoDeporte.id);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

getValidIds();
