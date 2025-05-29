"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    development: {
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || 'proceso_desarrollo_db',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        use_env_variable: 'DATABASE_URL',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    },
    test: {
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME_TEST || 'proceso_desarrollo_db_test',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false
    },
    production: {
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || 'proceso_desarrollo_db',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        use_env_variable: 'DATABASE_URL',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
};
exports.default = config;
