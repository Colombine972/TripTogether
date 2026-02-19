import type { RequestHandler } from "express";
import budgetRepository from "../budget/budgetRepository";
import expenseShareRepository from "../expenseShare/expenseShareRepository";
import expenseShareService from "../expenseShare/expenseShareService";
import tripRepository from "../trip/tripRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const budget = await budgetRepository.findExpenseByTrip(tripId);
    res.status(200).json(budget);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const { title, amount, paid_by, category_id } = req.body;

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID du voyage invalide" });
      return;
    }

    if (!title || amount == null || !paid_by || !category_id) {
      res
        .status(400)
        .json({ error: "Titre, montant, payeur, et catégorie requis" });
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: "Montant invalide" });
      return;
    }

    // 1- Crée la dépense
    const expenseId = await budgetRepository.create(
      tripId,
      title,
      numericAmount,
      Number(paid_by),
      Number(category_id),
    );

    // 2- Récupère les membres du voyage
    const members = await tripRepository.findMembersByTrip(tripId);
    const participantIds = (members as { id: number }[]).map((m) => m.id);

    if (participantIds.length === 0) {
      res.status(400).json({ error: "Aucun participant pour ce voyage" });
      return;
    }

    // 3- Crée les shares égaux
    await expenseShareService.createEqualShares(
      expenseId,
      numericAmount,
      participantIds,
    );

    res.status(201).json({
      id: expenseId,
      message: "Dépense ajoutée et répartie avec succès",
    });
  } catch (err) {
    next(err);
  }
};

const browse: RequestHandler = async (_req, res, next) => {
  try {
    const budgets = await budgetRepository.readAll();
    res.json(budgets);
  } catch (err) {
    next(err);
  }
};

const getExpensesByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    const expenses = await budgetRepository.findByTrip(tripId);

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur récupération dépenses" });
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

    const total = await budgetRepository.sumTotalByTrip(tripId);
    const paid = await budgetRepository.sumPaidByUser(tripId, userId);
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
      return res.status(400).json({ error: "ID invalide" });
    }

    await budgetRepository.delete(expenseId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default { read, add, browse, getExpensesByTrip, getSummary, remove };
