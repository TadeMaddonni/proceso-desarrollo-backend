# Backend API

Este es el backend de la aplicación desarrollado con Node.js, Express y TypeScript.

## 🚀 Tecnologías Principales

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Sequelize ORM
- Jest (Testing)
- Firebase Admin
- JWT Authentication

## 📋 Prerrequisitos

- Node.js (versión recomendada: 18.x o superior)
- PostgreSQL
- npm o yarn

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# JWT
JWT_SECRET=your_jwt_secret

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

## 🏃‍♂️ Scripts Disponibles

- `npm run build`: Compila el proyecto TypeScript
- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con hot-reload
- `npm test`: Ejecuta los tests
- `npm run test:watch`: Ejecuta los tests en modo watch
- `npm run db:migrate`: Ejecuta las migraciones de la base de datos
- `npm run db:seed`: Ejecuta los seeders de la base de datos
- `npm run db:create`: Crea la base de datos
- `npm run db:drop`: Elimina la base de datos

## 📁 Estructura del Proyecto

```
src/
├── config/         # Configuraciones de la aplicación
├── controllers/    # Controladores de las rutas
├── dtos/          # Data Transfer Objects
├── middleware/    # Middlewares personalizados
├── migrations/    # Migraciones de la base de datos
├── models/        # Modelos de Sequelize
├── routes/        # Definición de rutas
├── seeders/       # Seeders de la base de datos
├── services/      # Lógica de negocio
├── types/         # Definiciones de tipos TypeScript
├── utils/         # Utilidades y helpers
└── app.ts         # Punto de entrada de la aplicación
```

## 🔒 Seguridad

El proyecto implementa varias medidas de seguridad:
- Autenticación JWT
- Rate limiting
- Helmet para headers de seguridad
- Validación de datos con express-validator
- Encriptación de contraseñas con bcryptjs

## 📧 Email

El proyecto utiliza Resend para el envío de emails.

## 🧪 Testing

Los tests están escritos con Jest y se pueden ejecutar con:
```bash
npm test
```

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.
