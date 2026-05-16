import nodemailer from "nodemailer";

type MailerConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

/** Credenciales: SMTP_USER / SMTP_PASSWORD o aliases GMAIL_USER / GMAIL_APP_PASSWORD */
function getMailerConfig(): MailerConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user =
    process.env.SMTP_USER?.trim() ?? process.env.GMAIL_USER?.trim();
  const pass =
    process.env.SMTP_PASSWORD?.trim() ??
    process.env.GMAIL_APP_PASSWORD?.trim();
  const from = process.env.MAIL_FROM?.trim();

  if (!host || !user || !pass || !from) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    user,
    pass,
    from,
  };
}

export function isEmailConfigured(): boolean {
  return getMailerConfig() !== null;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const config = getMailerConfig();
  if (!config) {
    console.warn(
      "[email] SMTP no configurado. Define SMTP_HOST, MAIL_FROM y credenciales (SMTP_USER + SMTP_PASSWORD, o GMAIL_USER + GMAIL_APP_PASSWORD)."
    );
    return;
  }

  const secure = config.port === 465;
  const gmailHost = config.host.toLowerCase().includes("gmail");

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure,
    // Gmail en 587: STARTTLS obligatorio vía nodemailer (requireTLS).
    ...(secure || !gmailHost ? {} : { requireTLS: true }),
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transport.sendMail({
    from: config.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
