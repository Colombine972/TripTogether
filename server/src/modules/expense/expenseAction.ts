import type { RequestHandler } from "express";
import expenseRepository from "./expenseRepository";
import expenseShareRepository from "../expenseShare/expenseShareRepository";
import notificationService from "../notification/notificationService";

const read: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const budget = await expenseRepository.findExpenseByTrip(tripId);
    res.status(200).json(budget);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    const {
      title,
      emoji,
      original_amount,
      original_currency,
      converted_currency,
      exchange_rate,
      paid_by,
      category_id,
      date,
      participants,
    } = req.body;

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID du voyage invalide" });
      return;
    }

    if (
      !title ||
      !original_amount ||
      !original_currency ||
      !converted_currency ||
      !exchange_rate ||
      !paid_by ||
      !category_id ||
      !date ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    const originalAmount = Number(original_amount);
    const exchangeRate = Number(exchange_rate);
    const convertedAmount = Number((originalAmount * exchangeRate).toFixed(2));

    if (originalAmount <= 0 || exchangeRate <= 0) {
      res.status(400).json({ error: "Montant ou taux invalide" });
      return;
    }

    const expenseId = await expenseRepository.create({
      tripId,
      title,
      emoji,
      originalAmount,
      originalCurrency: original_currency,
      convertedAmount,
      convertedCurrency: converted_currency,
      exchangeRate,
      paidBy: Number(paid_by),
      categoryId: Number(category_id),
      date,
    });

    const hasExactSplit = participants.some(
      (participant) => participant.split_type === "exact",
    );

    if (hasExactSplit) {
      const exactTotal = participants.reduce(
        (sum, participant) => sum + Number(participant.share_amount || 0),
        0,
      );

      if (Number(exactTotal.toFixed(2)) !== convertedAmount) {
        res.status(400).json({
          error: "La somme des montants exacts doit correspondre à la dépense",
        });
        return;
      }

      for (const participant of participants) {
        await expenseShareRepository.create(
          expenseId,
          Number(participant.user_id),
          Number(participant.share_amount),
          "exact",
        );
      }
    } else {
      const shareAmount = Number(
        (convertedAmount / participants.length).toFixed(2),
      );

      for (const participant of participants) {
        await expenseShareRepository.create(
          expenseId,
          Number(participant.user_id),
          shareAmount,
          "equal",
        );
      }
    }

    await notificationService.notifyExpenseAdded(
      tripId,
      Number(paid_by),
      title,
      convertedAmount,
    );

    res.status(201).json({
      id: expenseId,
      message: "Dépense ajoutée avec succès",
    });
  } catch (err) {
    next(err);
  }
};

const browse: RequestHandler = async (_req, res, next) => {
  try {
    const budgets = await expenseRepository.readAll();
    res.json(budgets);
  } catch (err) {
    next(err);
  }
};

const getExpensesByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID du voyage invalide" });
      return;
    }

    const expenses = await expenseRepository.findByTrip(tripId);
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

const getSummary: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const userId = Number(req.auth?.sub);

    if (Number.isNaN(tripId) || Number.isNaN(userId)) {
      res.status(400).json({ error: "Paramètres invalides" });
      return;
    }

    const total = await expenseRepository.sumTotalByTrip(tripId);
    const paid = await expenseRepository.sumPaidByUser(tripId, userId);
    const owed = await expenseShareRepository.sumSharesByUser(tripId, userId);

    res.json({
      total,
      paid,
      owed,
      balance: paid - owed,
    });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler = async (req, res, next) => {
  try {
    const expenseId = Number(req.params.id);

    if (Number.isNaN(expenseId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    await expenseRepository.delete(expenseId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default {
  read,
  add,
  browse,
  getExpensesByTrip,
  getSummary,
  remove,
};
