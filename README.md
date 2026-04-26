# TFG - Sistema de Gestión de Torneos de Fútbol Históricos

Este proyecto consiste en una plataforma web completa para la visualización y gestión de datos estadísticos de grandes torneos de fútbol internacionales (Mundiales y Eurocopas). La aplicación utiliza un proceso ETL para extraer datos de APIs externas, procesarlos y almacenarlos en una base de datos propia optimizada para consultas estadísticas complejas.

## Características Principales

- Visualización detallada de torneos por temporada.
- Tablas de clasificación dinámicas para fases de grupos.
- Visualización de cuadros eliminatorios (Brackets).
- Estadísticas detalladas de jugadores (goleadores, asistentes, ratings).
- Comparador avanzado entre selecciones nacionales.
- Sistema de autenticación de usuarios.
- Gestión de favoritos (partidos y temporadas).
- Perfil de usuario con personalización de datos y seguridad.

## Stack Tecnológico

### Backend
- Node.js y Express: Servidor de aplicaciones.
- TypeScript: Lenguaje de programación para mayor robustez.
- Prisma ORM: Gestión de la base de datos y migraciones.
- PostgreSQL: Base de datos relacional.
- JWT (JSON Web Tokens): Autenticación segura y sin estado.
- Bcrypt: Encriptación de contraseñas.
- Nodemailer: Envío de correos para recuperación de cuentas.
- Vitest: Marco de pruebas unitarias y de integración.

### Frontend
- React 18: Biblioteca para la interfaz de usuario.
- Vite: Herramienta de construcción y desarrollo.
- React Router 7: Gestión de rutas y navegación.
- Axios: Cliente HTTP para comunicación con la API.
- CSS Vanilla: Estilizado personalizado sin frameworks de utilidad.
- FontAwesome: Iconografía profesional.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales:

- /backend: Contiene la lógica del servidor, modelos de datos, rutas y scripts ETL.
- /frontend: Contiene la aplicación cliente, componentes, contextos y servicios.

## Configuración del Entorno

### Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- Una clave de API de API-Football (para ejecución de ETL)

### Variables de Entorno

Crear un archivo .env en /backend con los siguientes campos:

DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db"
PORT=4000
JWT_SECRET="tu_clave_secreta_larga"
JWT_EXPIRES_IN=7d
API_FOOTBALL_KEY="tu_clave_api"
API_FOOTBALL_URL="https://v3.football.api-sports.io"
FRONTEND_URL="http://localhost:5173"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu_correo@gmail.com"
EMAIL_PASS="tu_password_de_aplicacion"

### Instalación

1. Clonar el repositorio.
2. En la carpeta /backend:
   - Ejecutar 'npm install'.
   - Ejecutar 'npx prisma migrate dev' para crear las tablas.
   - (Opcional) Ejecutar los scripts en 'src/scripts/etl' para poblar la base de datos.
3. En la carpeta /frontend:
   - Ejecutar 'npm install'.
   - Crear un archivo .env con 'VITE_API_URL=http://localhost:4000/api'.

## Scripts Disponibles

### Backend
- 'npm run dev': Inicia el servidor en modo desarrollo con nodemon.
- 'npm run build': Compila el código TypeScript a JavaScript.
- 'npm run start': Inicia el servidor compilado.
- 'npm run prisma:generate': Genera el cliente de Prisma.
- 'npm test': Ejecuta las pruebas automatizadas con Vitest.

### Frontend
- 'npm run dev': Inicia el servidor de desarrollo de Vite.
- 'npm run build': Genera el bundle de producción en la carpeta dist.

## Proceso ETL

La aplicación incluye un flujo de trabajo para la ingesta de datos:
1. Importación básica: Estructura de torneos, temporadas y equipos.
2. Partidos y alineaciones: Resultados detallados y convocatorias.
3. Eventos y estadísticas: Goles, tarjetas y métricas individuales de rendimiento.

## Seguridad Implementada

- Protección contra ataques de fuerza bruta mediante limitación de peticiones (Rate Limiting).
- Validación estricta de fortaleza de contraseñas.
- Protección contra ataques DoS mediante límites en el tamaño de los cuerpos de petición.
- Manejo seguro de errores para evitar la enumeración de cuentas de usuario.
- Rutas protegidas en el frontend mediante componentes de orden superior.