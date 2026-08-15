import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

type EmailAttachment = {
  filename: string;
  path?: string;
  content?: Buffer;
  cid?: string;
  contentType?: string;
};

const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: EmailAttachment[],
) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

export default sendEmail;