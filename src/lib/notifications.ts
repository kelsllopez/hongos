// ---------------------------------------------------------------------------
// Notificaciones por correo, OPCIONALES. Si no configuras RESEND_API_KEY y
// ALERT_EMAIL_TO en las variables de entorno, esta función simplemente no
// hace nada -- el sitio sigue funcionando exactamente igual sin avisos por
// correo, solo que tendrás que revisar /edit/security manualmente.
//
// Resend (resend.com) tiene un nivel gratuito que alcanza de sobra para
// este uso (avisos ocasionales de seguridad, no marketing masivo).
// ---------------------------------------------------------------------------

export async function sendSecurityAlert(subject: string, message: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;

  if (!apiKey || !to) {
    return; // notificaciones desactivadas, no es un error
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.ALERT_EMAIL_FROM || "Bosque de Hongos <onboarding@resend.dev>",
      to,
      subject: `🍄 ${subject}`,
      text: message,
    });
  } catch (err) {
    // Un fallo al enviar el correo nunca debe romper la acción principal
    // (ej. el bloqueo de una IP debe seguir aplicándose igual).
    console.error("No se pudo enviar la notificación por correo:", err);
  }
}
