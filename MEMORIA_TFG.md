# Memoria del Proyecto de Fin de Grado (DAW)
**Título del Proyecto:** TFG Torneos de Fútbol
**Autor:** Osentida Nguema Rodríguez
**Titulación:** Desarrollo de Aplicaciones Web (DAW)
**Fecha:** 2026

---

## 1. Introducción
El presente documento describe el desarrollo y la implementación del proyecto "TFG Torneos de Fútbol", una aplicación web integral (Full-Stack) diseñada para ofrecer a los usuarios información detallada, estadísticas históricas y seguimiento de grandes torneos a nivel de selecciones nacionales, centrándose principalmente en la Copa del Mundo y la Eurocopa (desde 2008 hasta la actualidad).

La aplicación permite la exploración profunda de equipos, temporadas, partidos (con alineaciones y eventos detallados minuto a minuto) y comparativas estadísticas. Además, incorpora un sistema completo de usuarios con capacidades transaccionales como favoritos personalizables, gestión de perfiles y recuperación segura de contraseñas.

## 2. Objetivos del Proyecto

### Objetivo General
Desarrollar una aplicación web moderna, escalable y con un alto grado evolutivo visual que recabe, estructure y muestre grandes volúmenes de datos futbolísticos, proveyendo al mismo tiempo un espacio personalizable para que los aficionados conserven sus momentos deportivos favoritos.

### Objetivos Específicos
1. **Consumo y Normalización de Datos:** Implementar scripts ETL (Extract, Transform, Load) para importar masivamente datos de proveedores externos (API-Football) a una base de datos relacional optimizada.
2. **Sistema de Autenticación y Seguridad:** Diseñar un sistema de usuarios usando JSON Web Tokens (JWT) y el cifrado de contraseñas y correos electrónicos para el manejo de recuperación de cuentas.
3. **Manejo de Estadísticas Dinámicas:** Desarrollar controladores capaces de cruzar múltiples tablas para obtener al máximo goleador, máximos asistentes, información de torneos y comparativas directas entre equipos.
4. **Diseño de Interfaz "Premium":** Implementar prácticas modernas de UI/UX, incluyendo glassmorphism, esquemas de color oscuros (Dark Mode), y micro-interacciones.

---

## 3. Arquitectura y Stack Tecnológico

El proyecto sigue una arquitectura **Cliente-Servidor (Frontend-Backend)** con separación de responsabilidades y comunicación mediante una API RESTful.

### 3.1. Frontend (Capa de Presentación)
*   **Core:** React (v18) con TypeScript.
*   **Build Tool:** Vite (Ofrece tiempos de compilación casi instantáneos).
*   **Enrutamiento:** React Router DOM.
*   **Estilos:** Vanilla CSS (Se ha optado por construir un sistema de diseño propio basado en propiedades CSS y *glassmorphism* para asegurar control total sobre la estética y el rendimiento).
*   **Peticiones HTTP:** Axios, interceptando tokens para áreas seguras.

### 3.2. Backend (Capa Lógica y API)
*   **Core:** Node.js con Express y TypeScript.
*   **ORM:** Prisma (Garantiza tipado estricto entre el código TypeScript y la BD).
*   **Seguridad y Tokens:** Bcryptjs (Hash de contraseñas) y JSON Web Tokens (JWT). *Nota sobre la arquitectura*: En este proyecto el JWT se almacena por simplicidad en el `LocalStorage` del navegador; sin embargo, se ha dejado constancia de que en un entorno altamente corporativo para producción se migrará a cookies `httpOnly` para mitigar ataques XSS (Cross-Site Scripting).
*   **Emails:** Nodemailer (Escalable a Resend para entorno de producción).

### 3.3. Base de Datos (Capa de Datos)
*   **Motor:** PostgreSQL. Elegido por su robustez ante consultas complejas (JOINs masivos) necesarios para la recopilación de datos estadísticos futbolísticos.

---

## 4. Diseño de la Base de Datos

La base de datos relacional ha sido uno de los retos principales del proyecto por el gran nivel de interconexión. El modelo consta de las siguientes entidades clave:

1.  **Tablas de Competición:** `Tournament` (Mundial, Eurocopa) y `Season` (Ej: Eurocopa 2024, conectada con el ganador y las fechas).
2.  **Tablas de Participantes:** `Team` (Selecciones) y una tabla central `SeasonTeam` que conecta a los equipos con ligas y guarda los puntos, goles a favor/contra y puesto final en esa edición.
3.  **Tablas de Eventos (Core de la aplicación):**
    *   `Match`: Integra equipos Locales/Visitantes, goles, ciudad, fecha y etapa.
    *   `MatchEvent`: Representa la línea del tiempo (Goles, Tarjetas Rojas, Sustituciones) asociados a un minuto exacto del partido.
    *   `MatchPlayerStats` y `MatchTeamStats`: Estructuras especializadas para llevar conteos de tiros y posesión de balón.
    *   `Lineup`: Alineaciones iniciales y banquillo.
4.  **Tablas de Usuarios:**
    *   `User`: Sistema de registro con campos dedicados a credenciales (hashed) y token de *Forgot Password*.
    *   `Favorite`: Tabla polimórfica que conecta a un usuario con temporadas o partidos concretos.

---

## 5. Funcionalidades Principales

### 5.1. Sistema de Exploración de Torneos y Partidos
La aplicación detalla métricas completas de cada competición:
*   Visualización de todos los partidos por rondas (Fase de grupos, Octavos, Cuartos...).
*   Pantalla de detalle por partido (Marcador, eventos en línea temporal y alineaciones titulares vs banquillo).
*   Perfiles de Equipos con su historial particular.

### 5.2. Panel de Estadísticas y Comparativas
A través de procedimientos matemáticos en el servidor (`stats.controller.ts`), la plataforma expone pantallas para graficar máximos goleadores históricos, métricas por fase (qué torneos se resolvieron en penaltis) y permite la funcionalidad de comparar frente a frente a dos selecciones distintas.

### 5.3. Sistema de Usuarios e Identidad
*   **Autenticación y Registro:** Contraseñas hasheadas y guardadas bajo salt.
*   **Recuperación Segura de Contraseña:** Generación de un token pseudoaleatorio cifrado en SHA-256 en base de datos. Se envía a través de SMTP integrado sin exponer si los usuarios existen o no en el sistema para evitar pishing (Security by obscurity en los endpoints).
*   **Perfil y Favoritos:** Los usuarios inmersos en la aplicación pueden guardar en un listado interno los partidos o las ediciones de campeonatos para un acceso rápido y recurrente.

---

## 6. Plan de Pruebas y Aseguramiento de Calidad (QA)

Para garantizar la estabilidad y confidencialidad del proyecto, se ha diseñado una estrategia de pruebas con distintos enfoques:

### 6.1. Pruebas Funcionales y Manuales
Testeo exhaustivo del flujo del usuario en el navegador validando la adaptabilidad en distintos dispositivos (Responsive Design), el estado de los componentes de React, y los comportamientos condicionales (ej. un usuario sin sesión no puede guardar en favoritos o acceder a páginas privadas).

### 6.2. Pruebas de Integración y Seguridad (API Testing)
Uso del entorno de desarrollo y pruebas **Postman** para enviar peticiones en crudo directamente contra la API y garantizar que la capa de red del backend es hermética:
1. **Acceso Restringido:** Comprobación de que los endpoints protegidos devuelven código `401 Unauthorized` si la petición carece de un Bearer JWT válido.
2. **Control de Errores de Validación:** Verificación de que el servidor rechaza cargas (payloads) JSON inválidas, abortando e instruyendo con estatus `400 Bad Request`.
3. **Persistencia y Control del Token:** Captura temporal del JWT tras el login en Postman para asegurar peticiones cifradas posteriores, con comprobaciones de caducidad.
4. **Endpoint Spoofing:** Verificación de que al intentar recuperar contraseña de cuentas inexistentes se muestra un mensaje genérico, frustrando ataques heurísticos.

Este doble enfoque subraya la fiabilidad de la arquitectura propuesta.

---

## 7. Conclusiones y Posibles Mejoras

El proyecto ha logrado cumplir exitosamente los requisitos del ciclo, abarcando todas las áreas clave del Desarrollo de Aplicaciones Web: integración con tecnologías externas, persistencia en BBDD relacioneles y diseño visual interactivo y responsivo.

**Posibles líneas futuras de trabajo:**
1.  **Panel de Administración (Backoffice):** Construir un portal interno para insertar manualmente datos de torneos menores.
2.  **WebSockets:** Implementar `Socket.io` para actualizar marcadores de partidos que se jueguen en directo.
3.  **Migración a la nube:** Integración y despliegue continuo (CI/CD) utilizando Docker y proveedores cloud como Vercel/Render y Supabase para la base de datos PostgreSQL.
