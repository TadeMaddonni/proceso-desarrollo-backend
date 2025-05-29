require('dotenv').config();

module.exports = {
  "development": {
    "dialect": "postgres",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 5432,
    "username": process.env.DB_USER || "postgres",
    "password": process.env.DB_PASSWORD || "",
    "database": process.env.DB_NAME || "proceso_desarrollo_dev",
    "logging": console.log,
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  },  "test": {
    "dialect": "postgres",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 5432,
    "username": process.env.DB_USER || "postgres",
    "password": process.env.DB_PASSWORD || "",
    "database": process.env.DB_TEST_NAME || "proceso_desarrollo_test",
    "logging": false,
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    },
    "logging": false,
    "pool": {
      "max": 10,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  }
};
