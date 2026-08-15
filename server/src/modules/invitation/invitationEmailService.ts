import buildTripInvitationTemplate from "../../utils/buildTripInvitationTemplate";
import sendEmail from "../../utils/sendEmail";
import { getPlacePhotoUrl } from "../services/googlePlacesService";

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
  placeId?: string | null;
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
  placeId,
}: SendTripInvitationEmailParams): Promise<void> => {
  const clientUrl =
    process.env.CLIENT_URL ??
    "http://localhost:3000";

  const invitationUrl =
    `${clientUrl}/trip/${tripId}/invitation/${invitationId}`;

  const organizerName =
    `${organizerFirstname} ${
      organizerLastname ?? ""
    }`.trim();

  const subject =
    `${organizerFirstname} vous invite à rejoindre son voyage à ${city}`;

  const text = `${organizerName} vous invite à rejoindre le voyage "${tripTitle}".

Destination : ${city}, ${country}

${message?.trim() ? `Message : ${message.trim()}\n\n` : ""}Voir l'invitation :
${invitationUrl}`;

  /* =====================================================
     RÉCUPÉRATION DE LA PHOTO DU VOYAGE
  ====================================================== */

  let imageBuffer: Buffer | null = null;

  if (placeId) {
    try {
      const photoUrl =
        await getPlacePhotoUrl(
          placeId,
        );

      if (photoUrl) {
        const photoResponse =
          await fetch(photoUrl);

        if (photoResponse.ok) {
          const arrayBuffer =
            await photoResponse.arrayBuffer();

          imageBuffer =
            Buffer.from(
              arrayBuffer,
            );
        } else {
          console.error(
            "Erreur récupération photo invitation :",
            photoResponse.status,
          );
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la photo pour l'email :",
        error,
      );
    }
  }

  /* =====================================================
     CONSTRUCTION DU TEMPLATE HTML
  ====================================================== */

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

      tripImageUrl:
        imageBuffer
          ? "cid:trip-destination"
          : null,
    });

  /* =====================================================
     ENVOI DE L'EMAIL
  ====================================================== */

  await sendEmail(
    recipientEmail,
    subject,
    text,
    html,

    imageBuffer
      ? [
          {
            filename:
              "trip-destination.jpg",

            content:
              imageBuffer,

            cid:
              "trip-destination",

            contentType:
              "image/jpeg",
          },
        ]
      : undefined,
  );
};

export default {
  sendTripInvitationEmail,
};