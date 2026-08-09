import buildTripInvitationTemplate from "../../utils/buildTripInvitationTemplate";
import sendEmail from "../../utils/sendEmail";

type SendTripInvitationEmailParams = {
  recipientEmail: string;
  invitedFirstname?: string | null;
  organizerFirstname: string;
  organizerLastname?: string | null;
  tripId: number;
  invitationId: number;
  tripTitle: string;
  city: string;
  country: string;
  startAt: string | Date;
  endAt: string | Date;
  message?: string | null;
};

const sendTripInvitationEmail = async ({
  recipientEmail,
  invitedFirstname,
  organizerFirstname,
  organizerLastname,
  tripId,
  invitationId,
  tripTitle,
  city,
  country,
  startAt,
  endAt,
  message,
}: SendTripInvitationEmailParams): Promise<void> => {
  const clientUrl =
    process.env.CLIENT_URL ??
    "http://localhost:3000";

  const invitationUrl =
    `${clientUrl}/trip/${tripId}/invitation/${invitationId}`;

  const organizerName =
    `${organizerFirstname} ${organizerLastname ?? ""}`.trim();

  const subject =
    `${organizerFirstname} vous invite à rejoindre son voyage à ${city}`;

  const text = `${organizerName} vous invite à rejoindre le voyage "${tripTitle}".

Destination : ${city}, ${country}

${message?.trim() ? `Message : ${message.trim()}\n\n` : ""}Voir l'invitation :
${invitationUrl}`;

  const html =
    buildTripInvitationTemplate({
      invitedFirstname,
      organizerFirstname,
      organizerLastname,
      tripTitle,
      city,
      country,
      startAt,
      endAt,
      invitationUrl,
      message,
    });

  await sendEmail(
    recipientEmail,
    subject,
    text,
    html,
  );
};

export default {
  sendTripInvitationEmail,
};