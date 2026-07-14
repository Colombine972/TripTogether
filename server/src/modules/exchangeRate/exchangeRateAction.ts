import type { RequestHandler } from "express";
import exchangeRateService from "./exchangeRateService";

const getRate: RequestHandler = async (req, res) => {
  try {
    const from = String(req.query.from || "")
      .trim()
      .toUpperCase();

    const to = String(req.query.to || "")
      .trim()
      .toUpperCase();

    if (!from || !to) {
      res.status(400).json({
        error: "Les paramètres 'from' et 'to' sont obligatoires.",
      });
      return;
    }

    if (from.length !== 3 || to.length !== 3) {
      res.status(400).json({
        error: "Les devises doivent être des codes ISO de 3 caractères.",
      });
      return;
    }

    const rate = await exchangeRateService.getRate(from, to);

    res.status(200).json({
      from,
      to,
      rate,
    });
  } catch (error) {
    console.error("Erreur récupération taux de change :", error);

    res.status(502).json({
      error:
        error instanceof Error
          ? error.message
          : "Impossible de récupérer le taux de conversion.",
    });
  }
};

export default {
  getRate,
};
