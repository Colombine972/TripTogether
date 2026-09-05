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
  tripImageUrl?: string | null;
};

const escapeHtml = (
  value: string,
): string => {
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
    const datePart =
      String(value).slice(0, 10);

    const [year, month, day] =
      datePart
        .split("-")
        .map(Number);

    if (!year || !month || !day) {
      return String(value);
    }

    date = new Date(
      year,
      month - 1,
      day,
    );
  }

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
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
  tripImageUrl,
}: BuildTripInvitationTemplateParams): string => {
  const logoUrl =
    process.env.EMAIL_LOGO_URL;

  const organizerName =
    `${organizerFirstname} ${
      organizerLastname ?? ""
    }`.trim();

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

  const safeTripImageUrl =
    tripImageUrl
      ? escapeHtml(
          tripImageUrl,
        )
      : null;

  const safeMessage =
    message?.trim()
      ? escapeHtml(
          message.trim(),
        ).replaceAll(
          "\n",
          "<br />",
        )
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

    <meta
      name="color-scheme"
      content="light"
    />

    <meta
      name="supported-color-schemes"
      content="light"
    />

    <title>
      Invitation TripTogether
    </title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background-color:#f4f2ed;
      font-family:Arial, Helvetica, sans-serif;
      color:#1f2a22;
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
        background-color:#f4f2ed;
        margin:0;
        padding:0;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding:40px 16px;
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
              max-width:640px;
              background-color:#ffffff;
              border-radius:24px;
              overflow:hidden;
              box-shadow:0 12px 35px rgba(0, 0, 0, 0.08);
            "
          >

            <!-- LOGO -->

            <tr>
              <td
                align="center"
                style="
                  padding:26px 30px 22px;
                  background-color:#ffffff;
                "
              >
                ${
                  logoUrl
                    ? `
                      <img
                        src="${escapeHtml(
                          logoUrl,
                        )}"
                        alt="TripTogether"
                        width="82"
                        style="
                          display:block;
                          width:82px;
                          max-width:82px;
                          height:auto;
                          margin:0 auto 8px;
                          border:0;
                        "
                      />
                    `
                    : `
                      <div
                        style="
                          margin-bottom:8px;
                          font-size:32px;
                        "
                      >
                        ✈️
                      </div>
                    `
                }

                <div
                  style="
                    color:#1f2a22;
                    font-size:20px;
                    font-weight:700;
                    line-height:1.3;
                  "
                >
                  TripTogether
                </div>
              </td>
            </tr>

            <!-- PHOTO DESTINATION -->

            ${
              safeTripImageUrl
                ? `
                  <tr>
                    <td
                      style="
                        padding:0;
                        line-height:0;
                        background-color:#e7ece5;
                      "
                    >
                      <img
                        src="${safeTripImageUrl}"
                        alt="${safeCity}, ${safeCountry}"
                        width="640"
                        style="
                          display:block;
                          width:100%;
                          max-width:640px;
                          height:270px;
                          object-fit:cover;
                          border:0;
                        "
                      />
                    </td>
                  </tr>
                `
                : ""
            }

            <!-- INTRO -->

            <tr>
              <td
                align="center"
                style="
                  padding:40px 38px 28px;
                  background-color:#ffffff;
                "
              >
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    margin:0 auto 16px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding:7px 14px;
                        background-color:#edf4ed;
                        border-radius:999px;
                        color:#2f5d2f;
                        font-size:13px;
                        line-height:1.4;
                        font-weight:700;
                      "
                    >
                      ✈️ Invitation à un voyage
                    </td>
                  </tr>
                </table>

                <h1
                  style="
                    margin:0 0 15px;
                    color:#1f2a22;
                    font-size:30px;
                    line-height:1.2;
                    font-weight:700;
                  "
                >
                  Vous êtes invité(e) à
                  <br />
                  rejoindre un voyage !
                </h1>

                ${
                  safeInvitedFirstname
                    ? `
                      <p
                        style="
                          margin:0 0 8px;
                          color:#4d554f;
                          font-size:16px;
                          line-height:1.6;
                        "
                      >
                        Bonjour
                        <strong>
                          ${safeInvitedFirstname}
                        </strong>,
                      </p>
                    `
                    : ""
                }

                <p
                  style="
                    margin:0;
                    color:#6c746d;
                    font-size:16px;
                    line-height:1.7;
                  "
                >
                  <strong
                    style="
                      color:#2f5d2f;
                    "
                  >
                    ${safeOrganizerName}
                  </strong>

                  vous invite à partager
                  une nouvelle aventure.
                </p>
              </td>
            </tr>

            <!-- CARTE VOYAGE -->

            <tr>
              <td
                style="
                  padding:0 32px 30px;
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
                    background-color:#faf9f6;
                    border:1px solid #e7e4dc;
                    border-radius:18px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding:26px;
                      "
                    >

                      <p
                        style="
                          margin:0 0 8px;
                          color:#2f5d2f;
                          font-size:12px;
                          line-height:1.4;
                          font-weight:700;
                          text-transform:uppercase;
                          letter-spacing:0.7px;
                        "
                      >
                        Votre prochain voyage
                      </p>

                      <h2
                        style="
                          margin:0 0 24px;
                          color:#1f2a22;
                          font-size:23px;
                          line-height:1.3;
                          font-weight:700;
                        "
                      >
                        ${safeTripTitle}
                      </h2>

                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                      >
                        <tr>
                          <td
                            width="38"
                            valign="top"
                            style="
                              width:38px;
                              padding-bottom:18px;
                              font-size:19px;
                            "
                          >
                            📍
                          </td>

                          <td
                            valign="top"
                            style="
                              padding-bottom:18px;
                            "
                          >
                            <div
                              style="
                                margin-bottom:3px;
                                color:#909690;
                                font-size:11px;
                                line-height:1.4;
                                font-weight:700;
                                text-transform:uppercase;
                                letter-spacing:0.5px;
                              "
                            >
                              Destination
                            </div>

                            <div
                              style="
                                color:#333a35;
                                font-size:15px;
                                line-height:1.5;
                                font-weight:600;
                              "
                            >
                              ${safeCity},
                              ${safeCountry}
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td
                            width="38"
                            valign="top"
                            style="
                              width:38px;
                              font-size:19px;
                            "
                          >
                            📅
                          </td>

                          <td
                            valign="top"
                          >
                            <div
                              style="
                                margin-bottom:3px;
                                color:#909690;
                                font-size:11px;
                                line-height:1.4;
                                font-weight:700;
                                text-transform:uppercase;
                                letter-spacing:0.5px;
                              "
                            >
                              Dates
                            </div>

                            <div
                              style="
                                color:#333a35;
                                font-size:15px;
                                line-height:1.5;
                                font-weight:600;
                              "
                            >
                              ${formattedStartAt}
                              →
                              ${formattedEndAt}
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
                                margin-top:24px;
                              "
                            >
                              <tr>
                                <td
                                  style="
                                    padding:17px 19px;
                                    background-color:#edf4ed;
                                    border-left:4px solid #2f5d2f;
                                    border-radius:10px;
                                  "
                                >
                                  <div
                                    style="
                                      margin-bottom:7px;
                                      color:#2f5d2f;
                                      font-size:12px;
                                      line-height:1.4;
                                      font-weight:700;
                                      text-transform:uppercase;
                                      letter-spacing:0.4px;
                                    "
                                  >
                                    💬 Message de
                                    ${safeOrganizerName}
                                  </div>

                                  <div
                                    style="
                                      color:#444b45;
                                      font-size:15px;
                                      line-height:1.7;
                                    "
                                  >
                                    ${safeMessage}
                                  </div>
                                </td>
                              </tr>
                            </table>
                          `
                          : ""
                      }

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->

            <tr>
              <td
                align="center"
                style="
                  padding:4px 32px 38px;
                "
              >
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    margin:0 auto;
                  "
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#2f5d2f"
                      style="
                        border-radius:12px;
                      "
                    >
                      <a
                        href="${safeInvitationUrl}"
                        target="_blank"
                        style="
                          display:inline-block;
                          padding:16px 32px;
                          background-color:#2f5d2f;
                          border-radius:12px;
                          color:#ffffff;
                          font-size:16px;
                          line-height:20px;
                          font-weight:700;
                          text-decoration:none;
                        "
                      >
                        Voir mon invitation&nbsp;&nbsp;→
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin:18px 0 6px;
                    color:#979c98;
                    font-size:12px;
                    line-height:1.6;
                  "
                >
                  Vous pourrez consulter
                  les informations du voyage
                  avant d'accepter ou refuser
                  l'invitation.
                </p>
              </td>
            </tr>

            <!-- PRESENTATION TRIPTOGETHER -->

            <tr>
              <td
                align="center"
                style="
                  padding:34px 42px;
                  background-color:#f3f6f1;
                  border-top:1px solid #e1e7df;
                "
              >
                <div
                  style="
                    margin-bottom:10px;
                    font-size:28px;
                  "
                >
                  🌍
                </div>

                <h2
                  style="
                    margin:0 0 11px;
                    color:#1f2a22;
                    font-size:19px;
                    line-height:1.3;
                    font-weight:700;
                  "
                >
                  À propos de
                  <span
                    style="
                      color:#2f5d2f;
                    "
                  >
                    TripTogether
                  </span>
                </h2>

                <p
                  style="
                    max-width:470px;
                    margin:0 auto;
                    color:#69706a;
                    font-size:14px;
                    line-height:1.7;
                  "
                >
                  TripTogether simplifie
                  l'organisation de vos voyages
                  en groupe. Proposez des étapes,
                  votez ensemble, partagez les
                  dépenses et suivez toute
                  l'activité du voyage au même
                  endroit.
                </p>

                <p
                  style="
                    margin:17px 0 0;
                    color:#2f5d2f;
                    font-size:14px;
                    line-height:1.5;
                    font-weight:700;
                  "
                >
                  Moins de stress,
                  plus de souvenirs.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->

            <tr>
              <td
                align="center"
                style="
                  padding:25px 30px;
                  background-color:#ffffff;
                "
              >
                <p
                  style="
                    margin:0 0 7px;
                    color:#8b918c;
                    font-size:12px;
                    line-height:1.6;
                  "
                >
                  Cette invitation vous a été
                  envoyée par
                  ${safeOrganizerName}
                  via TripTogether.
                </p>

                <p
                  style="
                    margin:0;
                    color:#a2a7a3;
                    font-size:11px;
                    line-height:1.6;
                  "
                >
                  © 2026 TripTogether
                  — Tous droits réservés
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