import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes, ModelStatic, Model } from 'sequelize';
import dotenv from 'dotenv';
import databaseConfig from '../config/database.js';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env as keyof typeof databaseConfig];

interface DbInterface {
  [key: string]: ModelStatic<Model> | Sequelize | typeof Sequelize;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

let sequelize: Sequelize;
if (config.use_env_variable) {
  const { username, password, database, ...options } = config;
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, options);
} else {
  const { username, password, database, ...options } = config;
  sequelize = new Sequelize(database, username, password || undefined, options);
}

async function initializeModels(): Promise<DbInterface> {
  const db: DbInterface = {} as DbInterface;  const files = fs.readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        (file.endsWith('.js') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))) &&
        !file.includes('.test.') &&
        !file.includes('.spec.')
      );
    });

  // Load models dynamically
  for (const file of files) {
    const modelPath = new URL(file, import.meta.url);
    
    try {
      const model = await import(modelPath.href);
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
    if (modelName !== 'sequelize' && modelName !== 'Sequelize') {
      const model = db[modelName] as ModelStatic<Model> & { associate?: (db: DbInterface) => void };
      if (model.associate) {
        model.associate(db);
      }
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}

export default await initializeModels();
