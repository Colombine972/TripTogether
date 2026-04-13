import express from "express";
import sendEmail from "../../utils/sendEmail";

const router = express.Router();

router.get("/test-email", async (_req, res) => {
  try {
    await sendEmail(
      "ton_email@gmail.com",
      "Test TripTogether",
      "Ton premier email fonctionne 🎉"
    );

    res.status(200).json({ message: "Email envoyé !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur envoi email" });
  }
});

export default router;