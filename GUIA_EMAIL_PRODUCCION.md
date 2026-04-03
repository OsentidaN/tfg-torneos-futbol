# Guía de Migración a Producción: Envío de Emails Transaccionales

Esta guía documenta los pasos necesarios para migrar el sistema de recuperación de contraseñas (y cualquier otro envío de emails futuros) del entorno de desarrollo (Gmail SMTP / Nodemailer) a un entorno de **producción real** utilizando **Resend**, el estándar actual en ecosistemas Node.js/TypeScript.

## ¿Por qué no usar Gmail en Producción?

*   **Límites estrictos:** Gmail limita los envíos a aproximadamente 500 correos por día.
*   **Deliverability:** Los correos enviados vía SMTP de Gmail desde servidores externos suelen acabar en la carpeta de Spam.
*   **Riesgo de bloqueo:** Google puede detectar "actividad inusual" si muchos usuarios solicitan correos en poco tiempo y bloquear tu cuenta personal.
*   **Falta de analíticas:** No puedes saber si un correo ha rebotado (bounce), si el usuario lo ha abierto, o si lo ha marcado como spam.

---

## La Solución: Resend

[Resend](https://resend.com/) es una API de email diseñada para desarrolladores. Ofrece una integración modernizada, excelente entregabilidad, informes detallados y es gratuito hasta 3.000 correos al mes (100 diarios).

### Paso 1: Configurar una cuenta y verificar un Dominio

Para que tus emails lleguen directamente a la bandeja de entrada (Inbox) con alta fiabilidad, no basta con la API key; necesitas ser dueño de un dominio (ej: `torneosfutbol.com`) para firmar los correos criptográficamente (DKIM / SPF).

1.  Regístrate en [Resend](https://resend.com).
2.  Ve a **Domains** -> **Add Domain**. Escribe tu dominio.
3.  Resend te proporcionará una serie de **registros DNS** (generalmente TXT y MX).
4.  Ve al proveedor donde compraste el dominio (Hostinger, Namecheap, GoDaddy, Cloudflare, etc.) y añade esos registros DNS en el panel de configuración de tu dominio.
5.  Una vez propagados (puede tardar unos minutos u horas), tu dominio aparecerá como **Verified** en Resend.
6.  Ve a **API Keys**, crea una nueva clave y guárdala.

> **Importante:** Nunca uses una dirección como `@gmail.com` o `@yahoo.com` en el campo `from` al enviar emails transaccionales a través de un servicio profesional. Si lo haces, tus correos serán rechazados automáticamente bajo políticas estrictas de DMARC. Debes usar un email bajo tu dominio comprobado (ej. `no-reply@torneosfutbol.com`).

---

### Paso 2: Instalación del SDK en el Backend

En la terminal de tu servidor backend, elimina `nodemailer` y añade `resend`:

```bash
# Desinstalar nodemailer y sus tipos
npm uninstall nodemailer @types/nodemailer

# Instalar Resend SDK
npm install resend
```

---

### Paso 3: Actualizar Variables de Entorno (.env)

Elimina las variables de SMTP obsoletas e incorpora tu clave de la API de Resend:

**Eliminar:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_aqui
```

**Añadir:**
```env
RESEND_API_KEY=re_123456789_abcdefghijklmnopqrstuvwxyz
EMAIL_FROM="TFG Torneos <no-reply@tudominio.com>" 
```

> **Nota:** Recuerda añadir estas variables en tu proveedor de hosting (ej. Render, Heroku, Vercel, Railway) donde tengas subido tu backend.

---

### Paso 4: Actualizar el Servicio de Email (email.service.ts)

Reescribe tu archivo `src/services/email.service.ts` para que utilice el SDK de Resend en lugar de Nodemailer. Todo el servicio puede simplificarse a este bloque de código:

```typescript
import { Resend } from 'resend';

// Verifica que la clave exista antes de instanciar
if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY no está definida.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
    toEmail: string,
    userName: string,
    resetToken: string
): Promise<void> => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        
        // Define el remitente validado en el .env
        const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

        // Resend devuelve un objeto con { data, error }
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: 'Recuperación de contraseña – TFG Torneos de Fútbol',
            html: `
                <!-- Aquí pegas exactamente el mismo HTML que ya tenías creado -->
                <p>Hola ${userName}, este es tu enlace: <a href="${resetUrl}">Restablecer contraseña</a></p>
            `
        });

        if (error) {
            console.error('Error enviando correo vía Resend:', error);
            throw new Error('Fallo confirmación Resend');
        }

        console.log('Correo enviado correctamente con ID:', data?.id);
    } catch (err) {
        console.error('Excepción al invocar Resend:', err);
        throw err;
    }
};
```

---

### Paso 5: Manejo de Errores en Producción

El controlador `/forgot-password` actual limpia el token de la base de datos si el envío del email falla. Al pasar a producción, con Resend y el bloque `try-catch` anterior, esta lógica sigue siendo perfectamente válida y segura.

```typescript
// auth.controller.ts (Ya está implementado así)
try {
    await sendPasswordResetEmail(user.email, user.name, rawToken);
} catch (err) {
    // Failsafe: borramos el token generado si falló la red / API de email
    await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpiry: null }
    });
    throw new AppError('Error al enviar el email...', 500);
}
```

### Resumen Visual: Flujo en Producción

Toda la lógica base que hemos escrito hoy soporta a la perfección el flujo de producción con extrema seguridad y criptografía. Lo único a reemplazar es la capa de transporte (la biblioteca que emite la acción de enviar a un SMTP / o una API).
