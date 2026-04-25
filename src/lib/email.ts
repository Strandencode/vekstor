import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

export async function sendMagicLink(to: string, url: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Din påloggingslenke til Vekstor",
    html: `<p>Klikk lenken under for å logge inn. Den utløper om 10 minutter.</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendPasswordReset(to: string, url: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Tilbakestill passord — Vekstor",
    html: `<p>Klikk lenken under for å sette nytt passord. Den utløper om 1 time.</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendVerificationEmail(to: string, url: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bekreft e-postadressen din — Vekstor",
    html: `<p>Klikk lenken under for å bekrefte e-postadressen din.</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  workspaceName: string,
  url: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} har invitert deg til ${workspaceName} på Vekstor`,
    html: `<p>${inviterName} har invitert deg til å bli med i arbeidsområdet <strong>${workspaceName}</strong> på Vekstor.</p><p><a href="${url}">Aksepter invitasjonen</a></p><p>Lenken utløper om 14 dager.</p>`,
  });
}
