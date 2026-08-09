type BuildTripInvitationTemplateParams = {
  invitedFirstname?: string | null;
  organizerFirstname: string;
  organizerLastname?: string | null;
  tripTitle: string;
  city: string;
  country: string;
  startAt: string | Date;
  endAt: string | Date;
  invitationUrl: string;
  message?: string | null;
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const formatDate = (
  value: string | Date,
): string => {
  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else {
    const datePart = String(value).slice(
      0,
      10,
    );

    const [year, month, day] =
      datePart.split("-").map(Number);

    if (!year || !month || !day) {
      return String(value);
    }

    date = new Date(
      year,
      month - 1,
      day,
    );
  }

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
};

const buildTripInvitationTemplate = ({
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
}: BuildTripInvitationTemplateParams): string => {
  const organizerName =
    `${organizerFirstname} ${organizerLastname ?? ""}`.trim();

  const safeInvitedFirstname =
    invitedFirstname?.trim()
      ? escapeHtml(
          invitedFirstname.trim(),
        )
      : null;

  const safeOrganizerName =
    escapeHtml(
      organizerName ||
        "Un organisateur",
    );

  const safeTripTitle =
    escapeHtml(
      tripTitle || "un voyage",
    );

  const destination = [
    city,
    country,
  ]
    .filter(Boolean)
    .join(", ");

  const safeDestination =
    escapeHtml(destination);

  const formattedStartAt =
    formatDate(startAt);

  const formattedEndAt =
    formatDate(endAt);

  const safeInvitationUrl =
    escapeHtml(invitationUrl);

  const safeMessage =
    message?.trim()
      ? escapeHtml(message.trim())
      : null;

  return `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>Invitation TripTogether</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f7f4f8;
      font-family: Arial, Helvetica, sans-serif;
      color: #2d2d2d;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width: 100%;
        background-color: #f7f4f8;
        padding: 32px 16px;
      "
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width: 100%;
              max-width: 620px;
              background-color: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 12px 35px rgba(60, 35, 65, 0.08);
            "
          >
            <tr>
              <td
                style="
                  padding: 30px 32px;
                  background-color: #64476d;
                  text-align: center;
                "
              >
                <div
                  style="
                    font-size: 34px;
                    line-height: 1;
                    margin-bottom: 10px;
                  "
                >
                  ✈️
                </div>

                <div
                  style="
                    color: #ffffff;
                    font-size: 25px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                  "
                >
                  TripTogether
                </div>

                <div
                  style="
                    margin-top: 6px;
                    color: #eee5f1;
                    font-size: 14px;
                  "
                >
                  Voyagez ensemble, simplement.
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 38px 36px 24px;
                "
              >
                <p
                  style="
                    margin: 0 0 16px;
                    font-size: 16px;
                    line-height: 1.6;
                  "
                >
                  ${
                    safeInvitedFirstname
                      ? `Bonjour ${safeInvitedFirstname},`
                      : "Bonjour,"
                  }
                </p>

                <h1
                  style="
                    margin: 0 0 18px;
                    color: #3f2847;
                    font-size: 27px;
                    line-height: 1.3;
                  "
                >
                  Vous êtes invité(e) à un voyage 🎉
                </h1>

                <p
                  style="
                    margin: 0 0 28px;
                    color: #55505a;
                    font-size: 16px;
                    line-height: 1.65;
                  "
                >
                  <strong>
                    ${safeOrganizerName}
                  </strong>
                  vous invite à rejoindre son voyage
                  <strong>
                    ${safeTripTitle}
                  </strong>.
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    margin-bottom: 26px;
                    background-color: #faf7fb;
                    border: 1px solid #eee7f0;
                    border-radius: 16px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding: 24px;
                      "
                    >
                      <div
                        style="
                          margin-bottom: 16px;
                          color: #64476d;
                          font-size: 20px;
                          font-weight: 700;
                        "
                      >
                        ${safeTripTitle}
                      </div>

                      <div
                        style="
                          margin-bottom: 10px;
                          color: #55505a;
                          font-size: 15px;
                          line-height: 1.5;
                        "
                      >
                        📍
                        <strong>
                          Destination :
                        </strong>
                        ${safeDestination}
                      </div>

                      <div
                        style="
                          color: #55505a;
                          font-size: 15px;
                          line-height: 1.5;
                        "
                      >
                        📅
                        <strong>
                          Dates :
                        </strong>
                        du ${formattedStartAt}
                        au ${formattedEndAt}
                      </div>
                    </td>
                  </tr>
                </table>

                ${
                  safeMessage
                    ? `
                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="
                          margin-bottom: 28px;
                          background-color: #f3edf5;
                          border-radius: 14px;
                        "
                      >
                        <tr>
                          <td
                            style="
                              padding: 20px 22px;
                            "
                          >
                            <div
                              style="
                                margin-bottom: 8px;
                                color: #64476d;
                                font-size: 13px;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                              "
                            >
                              Petit mot de ${safeOrganizerName}
                            </div>

                            <div
                              style="
                                color: #493f4c;
                                font-size: 15px;
                                font-style: italic;
                                line-height: 1.6;
                              "
                            >
                              « ${safeMessage} »
                            </div>
                          </td>
                        </tr>
                      </table>
                    `
                    : ""
                }

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 4px 0 28px;
                      "
                    >
                      <a
                        href="${safeInvitationUrl}"
                        style="
                          display: inline-block;
                          padding: 15px 30px;
                          background-color: #64476d;
                          color: #ffffff;
                          font-size: 16px;
                          font-weight: 700;
                          text-decoration: none;
                          border-radius: 12px;
                        "
                      >
                        Voir l'invitation
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 0;
                    color: #77717a;
                    font-size: 13px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  Vous pourrez consulter toutes les informations du voyage,
                  puis accepter ou refuser l'invitation directement depuis
                  TripTogether.
                </p>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 22px 30px;
                  background-color: #faf8fa;
                  border-top: 1px solid #eee9ef;
                  color: #928a95;
                  font-size: 12px;
                  line-height: 1.5;
                  text-align: center;
                "
              >
                Cet email vous a été envoyé automatiquement par
                <strong>TripTogether</strong>.

                <br />

                Organisez, partagez et profitez du voyage ensemble.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export default buildTripInvitationTemplate;