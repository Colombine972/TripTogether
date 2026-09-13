import fs from "node:fs";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error(
    "RESEND_API_KEY est manquant dans les variables d'environnement.",
  );
}

const resend = new Resend(resendApiKey);

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
  const resendAttachments = attachments?.map((attachment) => {
    if (attachment.content) {
      return {
        filename: attachment.filename,
        content: attachment.content,
      };
    }

    if (attachment.path) {
      return {
        filename: attachment.filename,
        content: fs.readFileSync(attachment.path),
      };
    }

    throw new Error(
      `La pièce jointe "${attachment.filename}" ne contient ni path ni content.`,
    );
  });

  const { data, error } = await resend.emails.send({
    from: "TripTogether <noreply@trip-together.fr>",
    to: [to],
    subject,
    text,
    html,
    attachments: resendAttachments,
  });

  if (error) {
    throw new Error(`Erreur Resend : ${error.message}`);
  }

  return data;
};

export default sendEmail;
