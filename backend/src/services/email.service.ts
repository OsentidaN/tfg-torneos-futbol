import nodemailer from 'nodemailer';

// ============================================
// CONFIGURACIÓN DEL TRANSPORTADOR SMTP
// ============================================

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true para puerto 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// ============================================
// ENVIAR EMAIL DE RECUPERACIÓN DE CONTRASEÑA
// ============================================

export const sendPasswordResetEmail = async (
    toEmail: string,
    userName: string,
    resetToken: string
): Promise<void> => {
    const transporter = createTransporter();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"TFG Torneos de Fútbol" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Recuperación de contraseña – TFG Torneos de Fútbol',
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar contraseña</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#0f0f1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
                 border-radius:16px;border:1px solid rgba(99,179,237,0.2);
                 overflow:hidden;max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#5a67d8 100%);
                        padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;
                          letter-spacing:-0.5px;">⚽ Torneos de Fútbol</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Sistema de recuperación de contraseña
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 12px;">
                Hola, <strong style="color:#90cdf4;">${userName}</strong>
              </p>
              <p style="color:#a0aec0;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
                Haz clic en el botón de abajo para crear una nueva contraseña.
                Este enlace <strong style="color:#fc8181;">caduca en 1 hora</strong>.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 36px;
                              background:linear-gradient(135deg,#667eea 0%,#5a67d8 100%);
                              color:#ffffff;text-decoration:none;border-radius:10px;
                              font-size:15px;font-weight:600;letter-spacing:0.3px;">
                      🔑 Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(99,179,237,0.15);margin:32px 0;">
              <p style="color:#718096;font-size:13px;line-height:1.6;margin:0 0 8px;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
              </p>
              <p style="color:#63b3ed;font-size:12px;word-break:break-all;margin:0;">
                ${resetUrl}
              </p>
              <hr style="border:none;border-top:1px solid rgba(99,179,237,0.15);margin:28px 0;">
              <p style="color:#4a5568;font-size:12px;margin:0;">
                Si no solicitaste este cambio, puedes ignorar este email. 
                Tu contraseña no cambiará hasta que accedas al enlace y crees una nueva.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.2);padding:20px 40px;text-align:center;">
              <p style="color:#4a5568;font-size:12px;margin:0;">
                © 2026 TFG Torneos de Fútbol · Osentida Nguema Rodríguez · DAW
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
};
