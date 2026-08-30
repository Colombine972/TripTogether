import type { RequestHandler } from "express";

import activityService from "../activity/activityService";
import expenseShareRepository from "../expenseShare/expenseShareRepository";
import notificationService from "../notification/notificationService";

import expenseRepository from "./expenseRepository";
import reimbursementRepository from "../reimbursement/reimbursementRepository";

/* =========================================================
   AJOUTER UNE DÉPENSE
========================================================= */

const add: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    const actorUserId = Number(req.auth?.sub);

    if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

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

    /* =====================================================
       VALIDATION DU VOYAGE
    ====================================================== */

    if (Number.isNaN(tripId)) {
      res.status(400).json({
        error: "ID du voyage invalide",
      });

      return;
    }

    /* =====================================================
       VALIDATION DES CHAMPS
    ====================================================== */

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
      res.status(400).json({
        error: "Champs obligatoires manquants",
      });

      return;
    }

    const cleanTitle = String(title).trim();

    if (!cleanTitle) {
      res.status(400).json({
        error: "Le titre de la dépense est obligatoire",
      });

      return;
    }

    const originalAmount = Number(original_amount);

    const exchangeRate = Number(exchange_rate);

    const paidBy = Number(paid_by);

    const categoryId = Number(category_id);

    /* =====================================================
       VALIDATION DES VALEURS NUMÉRIQUES
    ====================================================== */

    if (
      !Number.isFinite(originalAmount) ||
      originalAmount <= 0 ||
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0 ||
      !Number.isInteger(paidBy) ||
      paidBy <= 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      res.status(400).json({
        error: "Montant, taux, payeur ou catégorie invalide",
      });

      return;
    }

    /* =====================================================
       CONVERSION
    ====================================================== */

    const convertedAmount =
      original_currency === converted_currency
        ? originalAmount
        : Number((originalAmount * exchangeRate).toFixed(2));

    /* =====================================================
       CRÉATION DE LA DÉPENSE
    ====================================================== */

    const expenseId = await expenseRepository.create({
      tripId,

      title: cleanTitle,

      emoji,

      originalAmount,

      originalCurrency: String(original_currency).toUpperCase(),

      convertedAmount,

      convertedCurrency: String(converted_currency).toUpperCase(),

      exchangeRate,

      paidBy,

      categoryId,

      date,
    });

    /* =====================================================
       TYPE DE RÉPARTITION
    ====================================================== */

    const hasExactSplit = participants.some(
      (participant) => participant.split_type === "exact",
    );

    /* =====================================================
       RÉPARTITION EXACTE
    ====================================================== */

    if (hasExactSplit) {
      const allParticipantsAreExact = participants.every(
        (participant) => participant.split_type === "exact",
      );

      if (!allParticipantsAreExact) {
        res.status(400).json({
          error:
            "Tous les participants doivent utiliser le même type de répartition",
        });

        return;
      }

      const hasInvalidShare = participants.some((participant) => {
        const participantUserId = Number(participant.user_id);

        const shareAmount = Number(participant.share_amount);

        return (
          !Number.isInteger(participantUserId) ||
          participantUserId <= 0 ||
          !Number.isFinite(shareAmount) ||
          shareAmount < 0
        );
      });

      if (hasInvalidShare) {
        res.status(400).json({
          error: "Une ou plusieurs répartitions sont invalides",
        });

        return;
      }

      const exactTotal = participants.reduce(
        (sum, participant) => sum + Number(participant.share_amount || 0),
        0,
      );

      if (
        Number(exactTotal.toFixed(2)) !== Number(convertedAmount.toFixed(2))
      ) {
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

    /* =====================================================
       RÉPARTITION ÉGALE
    ====================================================== */
      const hasInvalidParticipant = participants.some((participant) => {
        const participantUserId = Number(participant.user_id);

        return !Number.isInteger(participantUserId) || participantUserId <= 0;
      });

      if (hasInvalidParticipant) {
        res.status(400).json({
          error: "Un ou plusieurs participants sont invalides",
        });

        return;
      }

      const totalInCents = Math.round(convertedAmount * 100);

      const participantCount = participants.length;

      const baseShareInCents = Math.floor(totalInCents / participantCount);

      const remainderInCents = totalInCents % participantCount;

      const payerIndex = participants.findIndex(
        (participant) => Number(participant.user_id) === paidBy,
      );

      /*
       * Si le payeur participe à la dépense,
       * il reçoit en priorité le centime restant.
       *
       * Sinon le premier participant reçoit
       * le reliquat.
       */
      const priorityIndex = payerIndex >= 0 ? payerIndex : 0;

      const remainderIndexes = Array.from(
        {
          length: remainderInCents,
        },
        (_, offset) => (priorityIndex + offset) % participantCount,
      );

      for (let index = 0; index < participants.length; index += 1) {
        const participant = participants[index];

        let shareInCents = baseShareInCents;

        if (remainderIndexes.includes(index)) {
          shareInCents += 1;
        }

        await expenseShareRepository.create(
          expenseId,

          Number(participant.user_id),

          shareInCents / 100,

          "equal",
        );
      }
    }

    /* =====================================================
       ACTIVITÉ DU VOYAGE
    ====================================================== */

    await activityService.createActivity({
      tripId,

      userId: actorUserId,

      type: "expense_created",

      title: "Nouvelle dépense",

      message: `a ajouté la dépense « ${cleanTitle} » pour ${convertedAmount.toFixed(
        2,
      )} ${String(converted_currency).toUpperCase()}.`,

      referenceType: "expense",

      referenceId: expenseId,
    });

    /* =====================================================
       NOTIFICATION
    ====================================================== */

    await notificationService.notifyExpenseAdded(
      tripId,

      actorUserId,

      expenseId,

      cleanTitle,

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

/* =========================================================
   MODIFIER UNE DÉPENSE
========================================================= */

const update: RequestHandler = async (req, res, next) => {
  try {
    const expenseId = Number(req.params.id);

    /*
     * L'utilisateur qui effectue réellement
     * la modification vient du JWT.
     *
     * On ne doit PAS utiliser paid_by ici :
     * le payeur et la personne qui modifie
     * peuvent être deux personnes différentes.
     */
    const actorUserId = Number(req.auth?.sub);

    if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      res.status(400).json({
        error: "ID de la dépense invalide",
      });

      return;
    }

    /* =====================================================
       DÉPENSE EXISTANTE
    ====================================================== */

    const existingExpense = await expenseRepository.findById(expenseId);

    if (!existingExpense) {
      res.status(404).json({
        error: "Dépense introuvable",
      });

      return;
    }

    /*
     * Le tripId provient de la dépense existante.
     */
    const tripId = Number(existingExpense.trip_id);

    if (!Number.isInteger(tripId) || tripId <= 0) {
      res.status(500).json({
        error: "Voyage associé à la dépense invalide",
      });

      return;
    }

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

    /* =====================================================
       VALIDATION DES CHAMPS
    ====================================================== */

    if (
      !title ||
      original_amount === undefined ||
      !original_currency ||
      !converted_currency ||
      exchange_rate === undefined ||
      paid_by === undefined ||
      category_id === undefined ||
      !date ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      res.status(400).json({
        error: "Champs obligatoires manquants",
      });

      return;
    }

    const cleanTitle = String(title).trim();

    if (!cleanTitle) {
      res.status(400).json({
        error: "Le titre de la dépense est obligatoire",
      });

      return;
    }

    const originalAmount = Number(original_amount);

    const exchangeRate = Number(exchange_rate);

    const paidBy = Number(paid_by);

    const categoryId = Number(category_id);

    /* =====================================================
       VALIDATION NUMÉRIQUE
    ====================================================== */

    if (
      !Number.isFinite(originalAmount) ||
      originalAmount <= 0 ||
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0 ||
      !Number.isInteger(paidBy) ||
      paidBy <= 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      res.status(400).json({
        error: "Montant, taux, payeur ou catégorie invalide",
      });

      return;
    }

    /* =====================================================
       CONVERSION
    ====================================================== */

    const convertedAmount =
      original_currency === converted_currency
        ? originalAmount
        : Number((originalAmount * exchangeRate).toFixed(2));

    /* =====================================================
       TYPE DE RÉPARTITION
    ====================================================== */

    const hasExactSplit = participants.some(
      (participant) => participant.split_type === "exact",
    );

    /* =====================================================
       VALIDATION AVANT MODIFICATION
    ====================================================== */

    if (hasExactSplit) {
      const allParticipantsAreExact = participants.every(
        (participant) => participant.split_type === "exact",
      );

      if (!allParticipantsAreExact) {
        res.status(400).json({
          error:
            "Tous les participants doivent utiliser le même type de répartition",
        });

        return;
      }

      const hasInvalidShare = participants.some((participant) => {
        const userId = Number(participant.user_id);

        const shareAmount = Number(participant.share_amount);

        return (
          !Number.isInteger(userId) ||
          userId <= 0 ||
          !Number.isFinite(shareAmount) ||
          shareAmount < 0
        );
      });

      if (hasInvalidShare) {
        res.status(400).json({
          error: "Une ou plusieurs répartitions sont invalides",
        });

        return;
      }

      const exactTotal = participants.reduce(
        (sum, participant) => sum + Number(participant.share_amount),
        0,
      );

      if (
        Number(exactTotal.toFixed(2)) !== Number(convertedAmount.toFixed(2))
      ) {
        res.status(400).json({
          error: "La somme des montants exacts doit correspondre à la dépense",
        });

        return;
      }
    } else {
      const hasInvalidParticipant = participants.some((participant) => {
        const userId = Number(participant.user_id);

        return !Number.isInteger(userId) || userId <= 0;
      });

      if (hasInvalidParticipant) {
        res.status(400).json({
          error: "Un ou plusieurs participants sont invalides",
        });

        return;
      }
    }

    /* =====================================================
       MISE À JOUR DE LA DÉPENSE
    ====================================================== */

    const affectedRows = await expenseRepository.update({
      expenseId,

      title: cleanTitle,

      emoji,

      originalAmount,

      originalCurrency: String(original_currency).toUpperCase(),

      convertedAmount,

      convertedCurrency: String(converted_currency).toUpperCase(),

      exchangeRate,

      paidBy,

      categoryId,

      date,
    });

    if (affectedRows === 0) {
      res.status(404).json({
        error: "Dépense introuvable",
      });

      return;
    }

    /* =====================================================
       SUPPRESSION DES ANCIENNES RÉPARTITIONS
    ====================================================== */

    await expenseShareRepository.deleteByExpense(expenseId);

    /* =====================================================
       NOUVELLE RÉPARTITION EXACTE
    ====================================================== */

    if (hasExactSplit) {
      for (const participant of participants) {
        await expenseShareRepository.create(
          expenseId,

          Number(participant.user_id),

          Number(participant.share_amount),

          "exact",
        );
      }
    } else {

    /* =====================================================
       NOUVELLE RÉPARTITION ÉGALE
    ====================================================== */
      const totalInCents = Math.round(convertedAmount * 100);

      const participantCount = participants.length;

      const baseShareInCents = Math.floor(totalInCents / participantCount);

      const remainderInCents = totalInCents % participantCount;

      const payerIndex = participants.findIndex(
        (participant) => Number(participant.user_id) === paidBy,
      );

      const priorityIndex = payerIndex >= 0 ? payerIndex : 0;

      const remainderIndexes = Array.from(
        {
          length: remainderInCents,
        },
        (_, offset) => (priorityIndex + offset) % participantCount,
      );

      for (let index = 0; index < participants.length; index += 1) {
        const participant = participants[index];

        let shareInCents = baseShareInCents;

        if (remainderIndexes.includes(index)) {
          shareInCents += 1;
        }

        await expenseShareRepository.create(
          expenseId,

          Number(participant.user_id),

          shareInCents / 100,

          "equal",
        );
      }
    }

    /* =====================================================
       NOTIFICATION DE MODIFICATION
    ====================================================== */

    await notificationService.notifyExpenseUpdated(
      tripId,

      actorUserId,

      expenseId,

      cleanTitle,
    );

    await activityService.createActivity({
      tripId,

      userId: actorUserId,

      type: "expense_updated",

      title: "Dépense modifiée",

      message: `a modifié la dépense « ${cleanTitle} ».`,

      referenceType: "expense",

      referenceId: expenseId,
    });

    res.status(200).json({
      id: expenseId,

      message: "Dépense modifiée avec succès",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   RÉCUPÉRER LES DÉPENSES DU VOYAGE
========================================================= */

const getExpensesByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({
        error: "ID du voyage invalide",
      });

      return;
    }

    const expenses = await expenseRepository.findByTrip(tripId);

    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   RÉSUMÉ DU BUDGET
========================================================= */

const getSummary: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    const userId = Number(req.auth?.sub);

    if (Number.isNaN(tripId) || Number.isNaN(userId)) {
      res.status(400).json({
        error: "Paramètres invalides",
      });

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

/* =========================================================
   SUPPRIMER UNE DÉPENSE
========================================================= */

const remove: RequestHandler = async (req, res, next) => {
  try {
    const expenseId = Number(req.params.id);

    const actorUserId = Number(req.auth?.sub);

    /* =====================================================
       UTILISATEUR AUTHENTIFIÉ
    ====================================================== */

    if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

    /* =====================================================
       ID DE LA DÉPENSE
    ====================================================== */

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      res.status(400).json({
        error: "ID de la dépense invalide",
      });

      return;
    }

    /* =====================================================
       VÉRIFIER QUE LA DÉPENSE EXISTE
    ====================================================== */

    const existingExpense =
      await expenseRepository.findById(expenseId);

    if (!existingExpense) {
      res.status(404).json({
        error: "Dépense introuvable",
      });

      return;
    }

    /* =====================================================
       VÉRIFIER SI LA DÉPENSE EST LIÉE
       À UN REMBOURSEMENT
    ====================================================== */

    const isLocked =
      await reimbursementRepository.isExpenseLockedByReimbursement(
        expenseId,
      );

    if (isLocked) {
      res.status(409).json({
        code: "EXPENSE_REIMBURSEMENT_LOCKED",

        error:
          "Cette dépense est liée à un remboursement et ne peut plus être supprimée.",
      });

      return;
    }

    /* =====================================================
       SUPPRESSION
    ====================================================== */

    await expenseRepository.delete(expenseId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   EXPORT
========================================================= */

export default {
  add,
  update,
  getExpensesByTrip,
  getSummary,
  remove,
};
