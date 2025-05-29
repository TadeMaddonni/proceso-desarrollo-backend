import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import databaseConfig from '../config/database.js';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

async function initializeModels() {
  const db = {};

  const files = fs.readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        (file.slice(-3) === '.js' || file.slice(-3) === '.ts') &&
        file.indexOf('.test.js') === -1 &&
        file.indexOf('.test.ts') === -1
      );
    });

  // Load models dynamically
  for (const file of files) {
    const modelPath = new URL(file, import.meta.url);
    
    try {
      const model = await import(modelPath);
      // ESM uses default export
      const modelDefiner = model.default;
      
      if (typeof modelDefiner === 'function') {
        const definedModel = modelDefiner(sequelize, DataTypes);
        db[definedModel.name] = definedModel;
      }
    } catch (error) {
      console.error(`Error importing model ${file}:`, error);
    }
  }

  // Associate all models
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}

export default await initializeModels();
