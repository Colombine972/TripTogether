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
    const datePart = String(value).slice(0, 10);
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
  const logoUrl =
    process.env.EMAIL_LOGO_URL;

  const organizerName =
    `${organizerFirstname} ${organizerLastname ?? ""}`
      .trim();

  const safeOrganizerName =
    escapeHtml(
      organizerName ||
        "Un organisateur",
    );

  const safeInvitedFirstname =
    invitedFirstname?.trim()
      ? escapeHtml(
          invitedFirstname.trim(),
        )
      : null;

  const safeTripTitle =
    escapeHtml(
      tripTitle || "Voyage",
    );

  const safeCity =
    escapeHtml(city || "");

  const safeCountry =
    escapeHtml(country || "");

  const safeInvitationUrl =
    escapeHtml(invitationUrl);

  const safeMessage =
    message?.trim()
      ? escapeHtml(message.trim())
      : null;

  const formattedStartAt =
    formatDate(startAt);

  const formattedEndAt =
    formatDate(endAt);

  return `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>
      Invitation - TripTogether
    </title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background-color:#f7f7f7;
      font-family:Arial, Helvetica, sans-serif;
      color:#222222;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width:100%;
        background-color:#f7f7f7;
        padding:32px 16px;
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
              width:100%;
              max-width:620px;
              background-color:#ffffff;
              border-radius:24px;
              overflow:hidden;
              box-shadow:0 12px 35px rgba(0, 0, 0, 0.08);
            "
          >

            <tr>
              <td
                style="
                  background:linear-gradient(
                    135deg,
                    #2d7738 0%,
                    #25642f 100%
                  );
                  padding:32px 24px 28px;
                  text-align:center;
                "
              >
                ${
                  logoUrl
                    ? `
                      <img
                        src="${logoUrl}"
                        alt="TripTogether"
                        width="76"
                        style="
                          display:block;
                          margin:0 auto 16px;
                          border-radius:18px;
                          background:#ffffff;
                          padding:8px;
                        "
                      />
                    `
                    : `
                      <div
                        style="
                          font-size:34px;
                          line-height:1;
                          margin-bottom:16px;
                        "
                      >
                        🧳
                      </div>
                    `
                }

                <h1
                  style="
                    margin:0;
                    font-size:32px;
                    line-height:1.2;
                    color:#ffffff;
                    font-weight:700;
                  "
                >
                  TripTogether
                </h1>

                <p
                  style="
                    margin:10px 0 0;
                    font-size:16px;
                    line-height:1.5;
                    color:#e9f4eb;
                  "
                >
                  Une invitation au voyage vient d'arriver
                </p>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:36px 32px 16px;
                "
              >
                <p
                  style="
                    margin:0 0 18px;
                    font-size:18px;
                    line-height:1.5;
                    color:#222222;
                  "
                >
                  ${
                    safeInvitedFirstname
                      ? `Bonjour <strong>${safeInvitedFirstname}</strong>,`
                      : "Bonjour,"
                  }
                </p>

                <p
                  style="
                    margin:0 0 24px;
                    font-size:17px;
                    line-height:1.7;
                    color:#444444;
                  "
                >
                  <strong
                    style="
                      color:#111111;
                    "
                  >
                    ${safeOrganizerName}
                  </strong>
                  vous invite à rejoindre son voyage
                  <strong
                    style="
                      color:#111111;
                    "
                  >
                    "${safeTripTitle}"
                  </strong>.
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background:linear-gradient(
                      180deg,
                      #f6fbf7 0%,
                      #ffffff 100%
                    );
                    border:1px solid #d8eadb;
                    border-radius:20px;
                    margin-bottom:28px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding:24px;
                      "
                    >
                      <p
                        style="
                          margin:0 0 14px;
                          font-size:13px;
                          font-weight:700;
                          letter-spacing:0.08em;
                          text-transform:uppercase;
                          color:#2d7738;
                        "
                      >
                        Votre prochain voyage
                      </p>

                      <p
                        style="
                          margin:0 0 18px;
                          font-size:24px;
                          line-height:1.3;
                          font-weight:700;
                          color:#111111;
                        "
                      >
                        ${safeTripTitle}
                      </p>

                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                      >
                        <tr>
                          <td
                            style="
                              padding:0 0 12px;
                              font-size:15px;
                              line-height:1.6;
                              color:#666666;
                            "
                          >
                            <strong
                              style="
                                color:#222222;
                              "
                            >
                              📍 Destination :
                            </strong>

                            ${safeCity}, ${safeCountry}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              font-size:15px;
                              line-height:1.6;
                              color:#666666;
                            "
                          >
                            <strong
                              style="
                                color:#222222;
                              "
                            >
                              📅 Dates :
                            </strong>

                            du ${formattedStartAt}
                            au ${formattedEndAt}
                          </td>
                        </tr>
                      </table>
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
                          margin-bottom:28px;
                        "
                      >
                        <tr>
                          <td
                            style="
                              background-color:#f7f7f7;
                              border-radius:16px;
                              padding:18px 20px;
                            "
                          >
                            <p
                              style="
                                margin:0 0 10px;
                                font-size:13px;
                                font-weight:700;
                                letter-spacing:0.06em;
                                text-transform:uppercase;
                                color:#2d7738;
                              "
                            >
                              Petit mot de ${safeOrganizerName}
                            </p>

                            <p
                              style="
                                margin:0;
                                font-size:15px;
                                font-style:italic;
                                line-height:1.7;
                                color:#555555;
                              "
                            >
                              « ${safeMessage} »
                            </p>
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
                  style="
                    margin-bottom:28px;
                  "
                >
                  <tr>
                    <td
                      style="
                        background-color:#f7f7f7;
                        border-radius:16px;
                        padding:18px 20px;
                        font-size:15px;
                        line-height:1.7;
                        color:#555555;
                      "
                    >
                      Consultez les informations du voyage puis acceptez ou refusez directement l'invitation depuis TripTogether.
                    </td>
                  </tr>
                </table>

                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    margin:0 auto 20px;
                  "
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        border-radius:14px;
                        background-color:#ff385c;
                      "
                    >
                      <a
                        href="${safeInvitationUrl}"
                        target="_blank"
                        style="
                          display:inline-block;
                          padding:16px 28px;
                          font-size:16px;
                          font-weight:700;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:14px;
                        "
                      >
                        Voir l'invitation
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin:0 0 8px;
                    text-align:center;
                    font-size:13px;
                    line-height:1.6;
                    color:#8a8a8a;
                  "
                >
                  Ce lien vous redirige directement vers votre invitation TripTogether.
                </p>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:20px 32px 28px;
                  text-align:center;
                "
              >
                <div
                  style="
                    height:1px;
                    background-color:#eeeeee;
                    margin-bottom:20px;
                  "
                ></div>

                <p
                  style="
                    margin:0 0 8px;
                    font-size:14px;
                    color:#6b6b6b;
                  "
                >
                  À bientôt ✈️
                </p>

                <p
                  style="
                    margin:0;
                    font-size:14px;
                    font-weight:700;
                    color:#222222;
                  "
                >
                  L'équipe TripTogether
                </p>
              </td>
            </tr>

          </table>

          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              max-width:620px;
            "
          >
            <tr>
              <td
                style="
                  padding:16px 24px 0;
                  text-align:center;
                "
              >
                <p
                  style="
                    margin:0;
                    font-size:12px;
                    line-height:1.6;
                    color:#9a9a9a;
                  "
                >
                  Vous recevez cet email car ${safeOrganizerName} vous a invité(e) à rejoindre un voyage sur TripTogether.
                </p>
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