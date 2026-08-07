import type { RequestHandler } from "express";
import expenseShareRepository from "../expenseShare/expenseShareRepository";
import notificationService from "../notification/notificationService";
import expenseRepository from "./expenseRepository";

/* =========================================================
   AJOUTER UNE DÉPENSE
   ========================================================= */

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
      res.status(400).json({
        error: "ID du voyage invalide",
      });

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
      res.status(400).json({
        error: "Champs obligatoires manquants",
      });

      return;
    }

    const originalAmount = Number(original_amount);
    const exchangeRate = Number(exchange_rate);

    const convertedAmount =
      original_currency === converted_currency
        ? originalAmount
        : Number(
            (
              originalAmount *
              exchangeRate
            ).toFixed(2),
          );

    if (
      originalAmount <= 0 ||
      exchangeRate <= 0
    ) {
      res.status(400).json({
        error: "Montant ou taux invalide",
      });

      return;
    }

    /* =====================================================
       CRÉATION DE LA DÉPENSE
       ===================================================== */

    const expenseId =
      await expenseRepository.create({
        tripId,

        title,

        emoji,

        originalAmount,

        originalCurrency:
          original_currency,

        convertedAmount,

        convertedCurrency:
          converted_currency,

        exchangeRate,

        paidBy:
          Number(paid_by),

        categoryId:
          Number(category_id),

        date,
      });

    const hasExactSplit =
      participants.some(
        (participant) =>
          participant.split_type ===
          "exact",
      );

    if (hasExactSplit) {
      const exactTotal =
        participants.reduce(
          (
            sum,
            participant,
          ) =>
            sum +
            Number(
              participant.share_amount ||
                0,
            ),
          0,
        );

      if (
        Number(
          exactTotal.toFixed(2),
        ) !== convertedAmount
      ) {
        res.status(400).json({
          error:
            "La somme des montants exacts doit correspondre à la dépense",
        });

        return;
      }

      for (const participant of participants) {
        await expenseShareRepository.create(
          expenseId,

          Number(
            participant.user_id,
          ),

          Number(
            participant.share_amount,
          ),

          "exact",
        );
      }
    } else {
      const totalInCents =
        Math.round(
          convertedAmount * 100,
        );

      const participantCount =
        participants.length;

      const baseShareInCents =
        Math.floor(
          totalInCents /
            participantCount,
        );

      const remainderInCents =
        totalInCents %
        participantCount;

      const payerIndex =
        participants.findIndex(
          (participant) =>
            Number(
              participant.user_id,
            ) ===
            Number(paid_by),
        );

      /*
       * Si le payeur participe à la dépense,
       * il reçoit en priorité le centime restant.
       *
       * Sinon le premier participant reçoit
       * le reliquat.
       */
      const priorityIndex =
        payerIndex >= 0
          ? payerIndex
          : 0;

      const remainderIndexes =
        Array.from(
          {
            length:
              remainderInCents,
          },

          (_, offset) =>
            (priorityIndex +
              offset) %
            participantCount,
        );

      for (
        let index = 0;
        index <
        participants.length;
        index += 1
      ) {
        const participant =
          participants[index];

        let shareInCents =
          baseShareInCents;

        if (
          remainderIndexes.includes(
            index,
          )
        ) {
          shareInCents += 1;
        }

        await expenseShareRepository.create(
          expenseId,

          Number(
            participant.user_id,
          ),

          shareInCents / 100,

          "equal",
        );
      }
    }


    await notificationService.notifyExpenseAdded(
      tripId,

      Number(paid_by),

      expenseId,

      title,

      convertedAmount,
    );

    res.status(201).json({
      id: expenseId,

      message:
        "Dépense ajoutée avec succès",
    });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const expenseId =
      Number(req.params.id);

    /*
     * L'utilisateur qui effectue réellement
     * la modification vient du JWT.
     *
     * On ne doit PAS utiliser paid_by ici :
     * le payeur et la personne qui modifie
     * peuvent être deux personnes différentes.
     */
    const actorUserId =
      Number(req.auth?.sub);

    if (
      !Number.isInteger(
        actorUserId,
      ) ||
      actorUserId <= 0
    ) {
      res.status(401).json({
        error:
          "Utilisateur non authentifié",
      });

      return;
    }

    if (
      !Number.isInteger(
        expenseId,
      ) ||
      expenseId <= 0
    ) {
      res.status(400).json({
        error:
          "ID de la dépense invalide",
      });

      return;
    }


    const existingExpense =
      await expenseRepository.findById(
        expenseId,
      );

    if (!existingExpense) {
      res.status(404).json({
        error:
          "Dépense introuvable",
      });

      return;
    }

    /*
     * Le tripId provient de la dépense existante.
     */
    const tripId =
      Number(
        existingExpense.trip_id,
      );

    if (
      !Number.isInteger(tripId) ||
      tripId <= 0
    ) {
      res.status(500).json({
        error:
          "Voyage associé à la dépense invalide",
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


    if (
      !title ||
      original_amount ===
        undefined ||
      !original_currency ||
      !converted_currency ||
      exchange_rate ===
        undefined ||
      paid_by === undefined ||
      category_id ===
        undefined ||
      !date ||
      !Array.isArray(
        participants,
      ) ||
      participants.length === 0
    ) {
      res.status(400).json({
        error:
          "Champs obligatoires manquants",
      });

      return;
    }

    const cleanTitle =
      String(title).trim();

    if (!cleanTitle) {
      res.status(400).json({
        error:
          "Le titre de la dépense est obligatoire",
      });

      return;
    }

    const originalAmount =
      Number(original_amount);

    const exchangeRate =
      Number(exchange_rate);

    const paidBy =
      Number(paid_by);

    const categoryId =
      Number(category_id);

    if (
      !Number.isFinite(
        originalAmount,
      ) ||
      originalAmount <= 0 ||
      !Number.isFinite(
        exchangeRate,
      ) ||
      exchangeRate <= 0 ||
      !Number.isInteger(
        paidBy,
      ) ||
      paidBy <= 0 ||
      !Number.isInteger(
        categoryId,
      ) ||
      categoryId <= 0
    ) {
      res.status(400).json({
        error:
          "Montant, taux, payeur ou catégorie invalide",
      });

      return;
    }

    const convertedAmount =
      original_currency ===
      converted_currency
        ? originalAmount
        : Number(
            (
              originalAmount *
              exchangeRate
            ).toFixed(2),
          );

    const hasExactSplit =
      participants.some(
        (participant) =>
          participant.split_type ===
          "exact",
      );

    /*
     * On valide la répartition avant
     * de modifier la base.
     */
    if (hasExactSplit) {
      const allParticipantsAreExact =
        participants.every(
          (participant) =>
            participant.split_type ===
            "exact",
        );

      if (
        !allParticipantsAreExact
      ) {
        res.status(400).json({
          error:
            "Tous les participants doivent utiliser le même type de répartition",
        });

        return;
      }

      const hasInvalidShare =
        participants.some(
          (participant) => {
            const userId =
              Number(
                participant.user_id,
              );

            const shareAmount =
              Number(
                participant.share_amount,
              );

            return (
              !Number.isInteger(
                userId,
              ) ||
              userId <= 0 ||
              !Number.isFinite(
                shareAmount,
              ) ||
              shareAmount < 0
            );
          },
        );

      if (hasInvalidShare) {
        res.status(400).json({
          error:
            "Une ou plusieurs répartitions sont invalides",
        });

        return;
      }

      const exactTotal =
        participants.reduce(
          (
            sum,
            participant,
          ) =>
            sum +
            Number(
              participant.share_amount,
            ),
          0,
        );

      if (
        Number(
          exactTotal.toFixed(2),
        ) !==
        Number(
          convertedAmount.toFixed(
            2,
          ),
        )
      ) {
        res.status(400).json({
          error:
            "La somme des montants exacts doit correspondre à la dépense",
        });

        return;
      }
    } else {
      const hasInvalidParticipant =
        participants.some(
          (participant) => {
            const userId =
              Number(
                participant.user_id,
              );

            return (
              !Number.isInteger(
                userId,
              ) ||
              userId <= 0
            );
          },
        );

      if (
        hasInvalidParticipant
      ) {
        res.status(400).json({
          error:
            "Un ou plusieurs participants sont invalides",
        });

        return;
      }
    }

    const affectedRows =
      await expenseRepository.update({
        expenseId,

        title:
          cleanTitle,

        emoji,

        originalAmount,

        originalCurrency:
          String(
            original_currency,
          ).toUpperCase(),

        convertedAmount,

        convertedCurrency:
          String(
            converted_currency,
          ).toUpperCase(),

        exchangeRate,

        paidBy,

        categoryId,

        date,
      });

    if (affectedRows === 0) {
      res.status(404).json({
        error:
          "Dépense introuvable",
      });

      return;
    }

    await expenseShareRepository.deleteByExpense(
      expenseId,
    );

    if (hasExactSplit) {
      for (const participant of participants) {
        await expenseShareRepository.create(
          expenseId,

          Number(
            participant.user_id,
          ),

          Number(
            participant.share_amount,
          ),

          "exact",
        );
      }
    } else {
      const totalInCents =
        Math.round(
          convertedAmount * 100,
        );

      const participantCount =
        participants.length;

      const baseShareInCents =
        Math.floor(
          totalInCents /
            participantCount,
        );

      const remainderInCents =
        totalInCents %
        participantCount;

      const payerIndex =
        participants.findIndex(
          (participant) =>
            Number(
              participant.user_id,
            ) === paidBy,
        );

      const priorityIndex =
        payerIndex >= 0
          ? payerIndex
          : 0;

      const remainderIndexes =
        Array.from(
          {
            length:
              remainderInCents,
          },

          (_, offset) =>
            (priorityIndex +
              offset) %
            participantCount,
        );

      for (
        let index = 0;
        index <
        participants.length;
        index += 1
      ) {
        const participant =
          participants[index];

        let shareInCents =
          baseShareInCents;

        if (
          remainderIndexes.includes(
            index,
          )
        ) {
          shareInCents += 1;
        }

        await expenseShareRepository.create(
          expenseId,

          Number(
            participant.user_id,
          ),

          shareInCents / 100,

          "equal",
        );
      }
    }

    await notificationService.notifyExpenseUpdated(
      tripId,

      actorUserId,

      expenseId,

      cleanTitle,
    );

    res.status(200).json({
      id: expenseId,

      message:
        "Dépense modifiée avec succès",
    });
  } catch (err) {
    next(err);
  }
};


const getExpensesByTrip: RequestHandler =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const tripId =
        Number(req.params.id);

      if (
        Number.isNaN(tripId)
      ) {
        res.status(400).json({
          error:
            "ID du voyage invalide",
        });

        return;
      }

      const expenses =
        await expenseRepository.findByTrip(
          tripId,
        );

      res.json(expenses);
    } catch (err) {
      next(err);
    }
  };


const getSummary: RequestHandler =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const tripId =
        Number(req.params.id);

      const userId =
        Number(req.auth?.sub);

      if (
        Number.isNaN(tripId) ||
        Number.isNaN(userId)
      ) {
        res.status(400).json({
          error:
            "Paramètres invalides",
        });

        return;
      }

      const total =
        await expenseRepository.sumTotalByTrip(
          tripId,
        );

      const paid =
        await expenseRepository.sumPaidByUser(
          tripId,
          userId,
        );

      const owed =
        await expenseShareRepository.sumSharesByUser(
          tripId,
          userId,
        );

      res.json({
        total,

        paid,

        owed,

        balance:
          paid - owed,
      });
    } catch (err) {
      next(err);
    }
  };


const remove: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const expenseId =
      Number(req.params.id);

    if (
      Number.isNaN(expenseId)
    ) {
      res.status(400).json({
        error: "ID invalide",
      });

      return;
    }

    await expenseRepository.delete(
      expenseId,
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};


export default {
  add,
  update,
  getExpensesByTrip,
  getSummary,
  remove,
};