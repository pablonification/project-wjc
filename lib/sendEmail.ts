import { Resend } from "@resend/node";

const resendApiKey = process.env.RESEND_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendConfirmationEmail(to: string, kegiatanTitle: string) {
  if (!resend) {
    console.log("[Email] Confirmation to", to, "for", kegiatanTitle);
    return;
  }

  await resend.emails.send({
    from: "noreply@example.com",
    to,
    subject: "Pendaftaran Kegiatan Berhasil",
    html: `<p>Terima kasih telah mendaftar pada kegiatan <strong>${kegiatanTitle}</strong>.</p>`,
  });
}