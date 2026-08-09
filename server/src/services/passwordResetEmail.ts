import sendEmail from "../utils/sendEmail";

type PasswordResetEmailParams = {
  email: string;
  firstname?: string | null;
  resetUrl: string;
};

const sendPasswordResetEmail = async ({
  email,
  firstname,
  resetUrl,
}: PasswordResetEmailParams) => {
  const greeting = firstname
    ? `Bonjour ${firstname},`
    : "Bonjour,";

  const subject =
    "Réinitialisation de votre mot de passe Trip Together";

  const text = `
${greeting}

Vous avez demandé la réinitialisation de votre mot de passe Trip Together.

Cliquez sur le lien suivant pour choisir un nouveau mot de passe :

${resetUrl}

Ce lien est valable pendant 30 minutes.

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.

L'équipe Trip Together
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f4f6f5;
          font-family: Arial, sans-serif;
          color: #172033;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          "
        >
          <div
            style="
              background-color: #ffffff;
              border-radius: 18px;
              padding: 40px;
            "
          >
            <div
              style="
                text-align: center;
                margin-bottom: 30px;
              "
            >
              <div
                style="
                  font-size: 38px;
                  margin-bottom: 8px;
                "
              >
                🧳
              </div>

              <h1
                style="
                  margin: 0;
                  color: #2e5c46;
                  font-size: 26px;
                "
              >
                Trip Together
              </h1>
            </div>

            <h2
              style="
                margin: 0 0 24px;
                font-size: 22px;
                text-align: center;
              "
            >
              Réinitialisation de votre mot de passe
            </h2>

            <p>${greeting}</p>

            <p
              style="
                color: #555555;
                line-height: 1.6;
              "
            >
              Vous avez demandé la réinitialisation de votre mot de passe
              Trip Together.
            </p>

            <p
              style="
                color: #555555;
                line-height: 1.6;
              "
            >
              Cliquez sur le bouton ci-dessous pour choisir un nouveau
              mot de passe.
            </p>

            <div
              style="
                margin: 32px 0;
                text-align: center;
              "
            >
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background-color: #2e5c46;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 24px;
                  font-weight: bold;
                "
              >
                Réinitialiser mon mot de passe
              </a>
            </div>

            <p
              style="
                color: #777777;
                font-size: 13px;
                line-height: 1.5;
              "
            >
              Ce lien est valable pendant 30 minutes.
            </p>

            <p
              style="
                color: #777777;
                font-size: 13px;
                line-height: 1.5;
              "
            >
              Si vous n'êtes pas à l'origine de cette demande,
              vous pouvez simplement ignorer cet e-mail.
            </p>

            <p
              style="
                margin-top: 30px;
                color: #777777;
                font-size: 13px;
              "
            >
              L'équipe Trip Together
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(
    email,
    subject,
    text,
    html,
  );
};

export default sendPasswordResetEmail;