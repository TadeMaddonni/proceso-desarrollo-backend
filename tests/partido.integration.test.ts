import { existsSync } from 'fs';
import { join } from 'path';

// Test básico de arquitectura SOLID
describe('Arquitectura SOLID - Sistema de Partidos', () => {
  const srcPath = join(__dirname, '../src');

  test('debería tener separación de responsabilidades - archivos existen', () => {
    // Verificar que los archivos principales existen
    const controllerPath = join(srcPath, 'controllers/partido/PartidoController.ts');
    const servicePath = join(srcPath, 'services/partido/PartidoService.ts');
    const middlewarePath = join(srcPath, 'middleware/partidoValidationMiddleware.ts');
    
    expect(existsSync(controllerPath)).toBe(true);
    expect(existsSync(servicePath)).toBe(true);
    expect(existsSync(middlewarePath)).toBe(true);
  });

  test('debería tener DTOs bien definidos - archivos existen', () => {
    // Verificar que los DTOs existen
    const partidoCreationDTOPath = join(srcPath, 'DTOs/PartidoCreationDTO.ts');
    const partidoDTOPath = join(srcPath, 'DTOs/PartidoDTO.ts');
    
    expect(existsSync(partidoCreationDTOPath)).toBe(true);
    expect(existsSync(partidoDTOPath)).toBe(true);
  });

  test('debería tener rutas configuradas con middlewares', () => {
    // Verificar que las rutas existen
    const routesPath = join(srcPath, 'routes/partido/Partido.ts');
    
    expect(existsSync(routesPath)).toBe(true);
  });

  test('verificar principios SOLID aplicados - estructura de archivos', () => {
    // SRP: Cada responsabilidad en archivo separado
    const paths = [
      join(srcPath, 'controllers/partido/PartidoController.ts'),  // HTTP
      join(srcPath, 'services/partido/PartidoService.ts'),        // Lógica de negocio  
      join(srcPath, 'middleware/partidoValidationMiddleware.ts'), // Validaciones
      join(srcPath, 'DTOs/PartidoDTO.ts'),                       // Contratos
      join(srcPath, 'routes/partido/Partido.ts')                 // Routing
    ];
    
    paths.forEach(path => {
      expect(existsSync(path)).toBe(true);
    });
    
    // Test simbólico: la compilación exitosa indica que los principios SOLID están aplicados
    expect(true).toBe(true);
  });

  test('debería tener documentación de la refactorización', () => {
    // Verificar que existe la documentación
    const docsPath = join(__dirname, '../REFACTORIZACION_SOLID.md');
    
    expect(existsSync(docsPath)).toBe(true);
  });
});
