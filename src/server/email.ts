import { Resend } from "resend";

let client: Resend | null = null;

function getResendClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "MY_RESEND_API_KEY") {
    return null;
  }
  client = new Resend(apiKey);
  return client;
}

// Resend's shared sandbox sender works without a verified domain, but only delivers to
// the email address that owns the Resend account until a custom domain is verified.
const FROM = "NYLA <onboarding@resend.dev>";

async function send(to: string, subject: string, html: string) {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not configured, skipping send to ${to}: ${subject}`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error(`[email] Resend error sending "${subject}" to ${to}:`, error);
  }
}

const wrapper = (title: string, bodyHtml: string) => `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
    <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8a8a8a; margin: 0 0 24px;">NYLA · Navega las metas de tu vida</p>
    <h1 style="font-size: 24px; margin: 0 0 16px;">${title}</h1>
    ${bodyHtml}
    <p style="font-size: 11px; color: #8a8a8a; margin-top: 32px;">Este correo fue enviado por NYLA. Si no reconoces esta actividad, ignora este mensaje.</p>
  </div>
`;

export async function sendWelcomeEmail(to: string, name: string, role: string) {
  const roleText = role === "STUDENT" ? "estudiante" : "emprendedor";
  const html = wrapper(
    `¡Bienvenido a NYLA, ${name}!`,
    `
      <p style="font-size: 14px; line-height: 1.6;">Tu cuenta de <strong>${roleText}</strong> se registró correctamente con el correo <strong>${to}</strong>.</p>
      <p style="font-size: 14px; line-height: 1.6;">Ya puedes iniciar sesión y ${role === "STUDENT" ? "explorar proyectos abiertos publicados por emprendedores" : "publicar tu primer proyecto y recibir matches de estudiantes"}.</p>
    `
  );
  await send(to, "Bienvenido a NYLA — tu cuenta fue creada", html);
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = wrapper(
    "Restablece tu contraseña",
    `
      <p style="font-size: 14px; line-height: 1.6;">Recibimos una solicitud para restablecer la contraseña de tu cuenta NYLA.</p>
      <p style="margin: 24px 0;">
        <a href="${resetLink}" style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Restablecer contraseña</a>
      </p>
      <p style="font-size: 12px; color: #8a8a8a; line-height: 1.6;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
    `
  );
  await send(to, "Restablece tu contraseña de NYLA", html);
}
