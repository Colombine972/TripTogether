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
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nouvelle dépense - TripTogether</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; margin: 0; padding: 24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
                    <div style="font-size: 32px; line-height: 1;">🧳</div>
                    <h1 style="margin: 12px 0 0; font-size: 28px; color: #ffffff;">TripTogether</h1>
                    <p style="margin: 8px 0 0; font-size: 15px; color: #e9e7ff;">
                      Une nouvelle activité a eu lieu sur votre voyage
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 32px 24px 16px;">
                    <p style="margin: 0 0 16px; font-size: 16px;">
                      Bonjour <strong>${firstname}</strong>,
                    </p>

                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                      Une nouvelle dépense a été ajoutée au voyage
                      <strong>"${tripTitle}"</strong>.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 12px; font-size: 15px; color: #6b7280;">Détail de la dépense</p>

                          <p style="margin: 0 0 10px; font-size: 16px;">
                            <strong>Payée par :</strong> ${payerName}
                          </p>

                          <p style="margin: 0 0 10px; font-size: 16px;">
                            <strong>Dépense :</strong> ${expenseTitle}
                          </p>

                          <p style="margin: 0; font-size: 16px;">
                            <strong>Montant :</strong> ${amount.toFixed(2)} €
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px;">
                      <tr>
                        <td align="center" style="border-radius: 10px; background-color: #4f46e5;">
                          <a
                            href="${tripLink}"
                            target="_blank"
                            style="
                              display: inline-block;
                              padding: 14px 24px;
                              font-size: 15px;
                              font-weight: bold;
                              color: #ffffff;
                              text-decoration: none;
                              border-radius: 10px;
                            "
                          >
                            Voir le voyage
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                      Connectez-vous à TripTogether pour consulter les détails du voyage et suivre les dépenses partagées.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                      À bientôt ✈️
                    </p>
                    <p style="margin: 0; font-size: 13px; font-weight: bold; color: #374151;">
                      L’équipe TripTogether
                    </p>
                  </td>
                </tr>

              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                <tr>
                  <td style="padding: 16px 24px 0; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      Vous recevez cet email car vous participez à ce voyage et avez activé les notifications.
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