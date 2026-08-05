import type { RequestHandler } from "express";
import userPaymentPreferenceRepository from "./userPaymentPreferenceRepository";
import type { PaymentMethod } from "../../types/paymentPreference";

const normalizeOptionalString = (
  value: unknown,
  maxLength: number,
): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.slice(0, maxLength);
};

const normalizeIban = (value: unknown): string | null => {
  const iban = normalizeOptionalString(value, 42);

  if (!iban) {
    return null;
  }

  return iban.replace(/\s+/g, "").toUpperCase();
};

const get: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.auth?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });
      return;
    }

    const preference =
      await userPaymentPreferenceRepository.findByUserId(userId);

    if (!preference) {
      res.status(200).json({
        preferred_method: null,
        wero_phone: null,
        iban: null,
        iban_holder_name: null,
      });
      return;
    }

    res.status(200).json({
      preferred_method: preference.preferred_method,
      wero_phone: preference.wero_phone,
      iban: preference.iban,
      iban_holder_name: preference.iban_holder_name,
    });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.auth?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });
      return;
    }

    const {
      preferred_method,
      wero_phone,
      iban,
      iban_holder_name,
    } = req.body;

    const allowedMethods: PaymentMethod[] = [
      "wero",
      "bank_transfer",
    ];

    let preferredMethod: PaymentMethod | null = null;

    if (
      preferred_method !== null &&
      preferred_method !== undefined &&
      preferred_method !== ""
    ) {
      if (
        typeof preferred_method !== "string" ||
        !allowedMethods.includes(
          preferred_method as PaymentMethod,
        )
      ) {
        res.status(400).json({
          error:
            "Le moyen préféré doit être « wero » ou « bank_transfer »",
        });
        return;
      }

      preferredMethod = preferred_method as PaymentMethod;
    }

    const weroPhone = normalizeOptionalString(
      wero_phone,
      20,
    );

    const normalizedIban = normalizeIban(iban);

    const ibanHolderName = normalizeOptionalString(
      iban_holder_name,
      120,
    );

    if (preferredMethod === "wero" && !weroPhone) {
      res.status(400).json({
        error:
          "Le numéro de téléphone Wero est obligatoire lorsque Wero est le moyen préféré",
      });
      return;
    }

    if (preferredMethod === "bank_transfer") {
      if (!normalizedIban) {
        res.status(400).json({
          error:
            "L’IBAN est obligatoire lorsque le virement bancaire est le moyen préféré",
        });
        return;
      }

      if (!ibanHolderName) {
        res.status(400).json({
          error:
            "Le nom du titulaire est obligatoire pour le virement bancaire",
        });
        return;
      }
    }

    if (
      normalizedIban &&
      !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(
        normalizedIban,
      )
    ) {
      res.status(400).json({
        error: "Le format de l’IBAN est invalide",
      });
      return;
    }

    await userPaymentPreferenceRepository.upsert({
      userId,
      preferredMethod,
      weroPhone,
      iban: normalizedIban,
      ibanHolderName,
    });

    const updatedPreference =
      await userPaymentPreferenceRepository.findByUserId(userId);

    res.status(200).json({
      message:
        "Préférences de remboursement enregistrées avec succès",
      paymentPreference: updatedPreference,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  get,
  update,
};