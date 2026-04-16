type ExpenseEmailTemplateProps = {
  firstname: string;
  tripTitle: string;
  payerName: string;
  expenseTitle: string;
  amount: number;
  tripLink: string;
};

const buildExpenseNotificationTemplate = ({
  firstname,
  tripTitle,
  payerName,
  expenseTitle,
  amount,
  tripLink,
}: ExpenseEmailTemplateProps) => {
  const logoUrl = process.env.EMAIL_LOGO_URL;

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nouvelle dépense - TripTogether</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f7f7f7; font-family:Arial, Helvetica, sans-serif; color:#222222;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f7f7f7; margin:0; padding:24px 0;">
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="max-width:620px; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.08);"
              >
                
                <tr>
                  <td
                    style="
                      background:linear-gradient(135deg, #2d7738 0%, #25642f 100%);
                      padding:32px 24px 28px;
                      text-align:center;
                    "
                  >
                    ${
                      logoUrl
                        ? `<img
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
                          />`
                        : `<div style="font-size:34px; line-height:1; margin-bottom:16px;">🧳</div>`
                    }

                    <h1 style="margin:0; font-size:32px; line-height:1.2; color:#ffffff; font-weight:700;">
                      TripTogether
                    </h1>

                    <p style="margin:10px 0 0; font-size:16px; line-height:1.5; color:#ffe4ea;">
                      Une nouvelle dépense a été ajoutée à votre voyage
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 32px 16px;">
                    <p style="margin:0 0 18px; font-size:18px; line-height:1.5; color:#222222;">
                      Bonjour <strong>${firstname}</strong>,
                    </p>

                    <p style="margin:0 0 24px; font-size:17px; line-height:1.7; color:#444444;">
                      Une nouvelle dépense a été enregistrée sur le voyage
                      <strong style="color:#111111;">"${tripTitle}"</strong>.
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      style="
                        background:linear-gradient(180deg, #fff8f8 0%, #ffffff 100%);
                        border:1px solid #f3d5db;
                        border-radius:20px;
                        margin-bottom:28px;
                      "
                    >
                      <tr>
                        <td style="padding:24px;">
                          <p style="margin:0 0 14px; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#d12b52;">
                            Nouvelle dépense
                          </p>

                          <p style="margin:0 0 14px; font-size:24px; line-height:1.3; font-weight:700; color:#111111;">
                            ${expenseTitle}
                          </p>

                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding:0 0 12px; font-size:15px; color:#666666;">
                                <strong style="color:#222222;">Payée par :</strong> ${payerName}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size:15px; color:#666666;">
                                <strong style="color:#222222;">Montant :</strong>
                                <span style="font-size:22px; font-weight:700; color:#ff385c;">${amount.toFixed(2)} €</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
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
                          Retrouvez tous les détails du voyage, les dépenses partagées et le budget mis à jour directement dans votre espace TripTogether.
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                      <tr>
                        <td align="center" style="border-radius:14px; background-color:#ff385c;">
                          <a
                            href="${tripLink}"
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
                            Voir le voyage
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px; text-align:center; font-size:13px; line-height:1.6; color:#8a8a8a;">
                      Ce lien vous redirige directement vers votre voyage sur TripTogether.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 32px 28px; text-align:center;">
                    <div style="height:1px; background-color:#eeeeee; margin-bottom:20px;"></div>

                    <p style="margin:0 0 8px; font-size:14px; color:#6b6b6b;">
                      À bientôt ✈️
                    </p>
                    <p style="margin:0; font-size:14px; font-weight:700; color:#222222;">
                      L’équipe TripTogether
                    </p>
                  </td>
                </tr>

              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;">
                <tr>
                  <td style="padding:16px 24px 0; text-align:center;">
                    <p style="margin:0; font-size:12px; line-height:1.6; color:#9a9a9a;">
                      Vous recevez cet email car vous participez à ce voyage et avez activé les notifications email.
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

export default buildExpenseNotificationTemplate;
