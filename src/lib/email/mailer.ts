import nodemailer from "nodemailer";

type MailerConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

function getMailerConfig(): MailerConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
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
      "[email] SMTP no configurado. Define SMTP_HOST, SMTP_USER, SMTP_PASSWORD y MAIL_FROM."
    );
    return;
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
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
