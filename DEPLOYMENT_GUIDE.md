# Guía de Despliegue - TFG Torneos de Fútbol

Esta guía contiene los pasos necesarios para llevar tu aplicación del entorno local a un entorno de producción real y gratuito.

---

## 1. Preparación del Código
Antes de empezar, asegúrate de que todos los cambios locales estén en tu repositorio de GitHub:
```bash
git add .
git commit -m "Preparación para despliegue: URLs dinámicas y ajustes de producción"
git push origin master  # O tu rama principal
```

---

## 2. Configuración de la Base de Datos (Railway)
Usaremos Railway para el backend y la base de datos PostgreSQL.
1.  Inicia sesión en [Railway.app](https://railway.app/).
2.  Haz clic en **"New Project"** -> **"Provision PostgreSQL"**.
3.  Espera a que se cree el servicio.
4.  Haz clic en el cuadro de la base de datos (`PostgreSQL`) -> Pestaña **"Variables"**.
5.  Copia el valor de `DATABASE_URL`. Lo necesitarás para el siguiente paso.

---

## 3. Despliegue del Backend (Railway)
1.  En el mismo proyecto de Railway, haz clic en **"New"** -> **"GitHub Repo"** y elige tu repositorio.
2.  Si la aplicación está en una subcarpeta (ej: `/backend`), configúralo en **"Settings"** -> **"Root Directory"**.
3.  Ve a la pestaña **"Variables"** del servicio backend y añade:
    *   `DATABASE_URL`: (Pega la URL de la base de datos que copiaste antes)
    *   `JWT_SECRET`: (Tu clave secreta del `.env` local)
    *   `JWT_EXPIRES_IN`: `7d`
    *   `NODE_ENV`: `production`
    *   `FRONTEND_URL`: `https://tu-proyecto.vercel.app` (Tendrás esta URL en el paso 4)
4.  Railway generará una URL pública para tu API en **Settings** -> **Public Networking**. Copia esa URL (ej: `https://backend-production-xyz.up.railway.app`).

---

## 4. Despliegue del Frontend (Vercel)
1.  Inicia sesión en [Vercel](https://vercel.com/).
2.  Haz clic en **"Add New"** -> **"Project"** e importa tu repositorio de GitHub.
3.  Si la aplicación está en una subcarpeta (ej: `/frontend`), Vercel lo detectará o podrás configurarlo en **"Root Directory"**.
4.  En la sección **"Environment Variables"**, añade:
    *   `VITE_API_URL`: (Pega la URL de la API de Railway que copiaste al final del paso 3) -> Ej: `https://backend-production-xyz.up.railway.app/api` (Asegúrate de añadir `/api` al final).
5.  Haz clic en **"Deploy"**. Al terminar, Vercel te dará una URL (ej: `https://tfg-torneos-futbol.vercel.app`).
6.  **¡IMPORTANTE!**: Vuelve a Railway y actualiza la variable `FRONTEND_URL` de tu backend con esta nueva dirección de Vercel.

---

## 5. Migración de Datos (Tu trabajo local a la nube)
Para que los equipos y torneos que tienes en local aparezcan en la web real:
1.  En tu carpeta local `backend`, abre el archivo `.env`.
2.  Comenta tu `DATABASE_URL` local y pega temporalmente la `DATABASE_URL` de Railway.
3.  En la terminal, dentro de la carpeta `backend`, ejecuta:
    ```bash
    npx prisma db push
    ```
    *Esto creará todas las tablas en la nube.*
4.  Ejecuta tus scripts de importación (si los usaste para cargar datos):
    ```bash
    npm run etl:step1
    npm run etl:step2
    # ... y así sucesivamente
    ```
5.  **IMPORTANTE**: Una vez terminada la carga, vuelve a poner tu `.env` local como estaba antes.

---

## 💡 Consejos para la Defensa
*   **Comandos de Build**: Vercel usa `npm run build` y Railway usa `npm start`. Ya están configurados en tus `package.json`.
*   **Logs**: Si algo falla, mira la sección "Logs" tanto en Railway como en Vercel para ver el error exacto.
*   **Caché de Vite**: Si haces cambios y no se ven, recuerda que Vercel redespliega automáticamente al hacer `push` a GitHub.

¡Buena suerte con el despliegue y con tu presentación!
