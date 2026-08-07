import type { RequestHandler } from "express";
import type { ReimbursementPaymentMethod } from "../../types/reimbursement";
import notificationService from "../notification/notificationService";
import tripRepository from "../trip/tripRepository";
import reimbursementRepository from "./reimbursementRepository";

const allowedPaymentMethods: ReimbursementPaymentMethod[] = [
  "wero",
  "bank_transfer",
  "other",
];

const add: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const fromUserId =
      Number(req.auth?.sub);

    const {
      trip_id,
      to_user_id,
      amount,
      currency,
      payment_method,
    } = req.body;

    const tripId =
      Number(trip_id);

    const toUserId =
      Number(to_user_id);

    const reimbursementAmount =
      Number(amount);

    if (
      !Number.isInteger(fromUserId) ||
      fromUserId <= 0
    ) {
      res.status(401).json({
        error:
          "Utilisateur non authentifié",
      });

      return;
    }

    if (
      !Number.isInteger(tripId) ||
      tripId <= 0
    ) {
      res.status(400).json({
        error:
          "Identifiant du voyage invalide",
      });

      return;
    }

    if (
      !Number.isInteger(toUserId) ||
      toUserId <= 0
    ) {
      res.status(400).json({
        error:
          "Identifiant du bénéficiaire invalide",
      });

      return;
    }

    if (
      fromUserId === toUserId
    ) {
      res.status(400).json({
        error:
          "Vous ne pouvez pas vous rembourser vous-même",
      });

      return;
    }

    if (
      !Number.isFinite(
        reimbursementAmount,
      ) ||
      reimbursementAmount <= 0
    ) {
      res.status(400).json({
        error:
          "Le montant du remboursement est invalide",
      });

      return;
    }

    const normalizedCurrency =
      String(
        currency || "",
      ).toUpperCase();

    if (
      !/^[A-Z]{3}$/.test(
        normalizedCurrency,
      )
    ) {
      res.status(400).json({
        error:
          "La devise est invalide",
      });

      return;
    }

    let normalizedPaymentMethod:
      | ReimbursementPaymentMethod
      | null = null;

    if (payment_method) {
      if (
        !allowedPaymentMethods.includes(
          payment_method as ReimbursementPaymentMethod,
        )
      ) {
        res.status(400).json({
          error:
            "Le moyen de paiement est invalide",
        });

        return;
      }

      normalizedPaymentMethod =
        payment_method as ReimbursementPaymentMethod;
    }

    const fromUserIsMember =
      await tripRepository.isUserMemberOfTrip(
        tripId,
        fromUserId,
      );

    if (!fromUserIsMember) {
      res.status(403).json({
        error:
          "Vous ne participez pas à ce voyage",
      });

      return;
    }

    const toUserIsMember =
      await tripRepository.isUserMemberOfTrip(
        tripId,
        toUserId,
      );

    if (!toUserIsMember) {
      res.status(404).json({
        error:
          "Le bénéficiaire ne participe pas à ce voyage",
      });

      return;
    }

    const existingPending =
      await reimbursementRepository.findPendingBetween(
        tripId,
        fromUserId,
        toUserId,
      );

    if (existingPending) {
      res.status(409).json({
        error:
          "Un remboursement est déjà en attente de confirmation pour ce participant",
      });

      return;
    }

    const outstandingDebt =
      await reimbursementRepository.getOutstandingDebtBetween(
        tripId,
        fromUserId,
        toUserId,
      );

    if (
      outstandingDebt < 0.01
    ) {
      res.status(400).json({
        error:
          "Aucune dette ne doit actuellement être remboursée à ce participant",
      });

      return;
    }

    if (
      reimbursementAmount >
      outstandingDebt + 0.01
    ) {
      res.status(400).json({
        error:
          `Le montant ne peut pas dépasser ${outstandingDebt.toFixed(
            2,
          )} ${normalizedCurrency}`,
      });

      return;
    }

    const finalAmount =
      Number(
        reimbursementAmount.toFixed(
          2,
        ),
      );

    const reimbursementId =
      await reimbursementRepository.create({
        tripId,
        fromUserId,
        toUserId,
        amount: finalAmount,
        currency:
          normalizedCurrency,
        paymentMethod:
          normalizedPaymentMethod,
      });

    const reimbursement =
      await reimbursementRepository.findById(
        reimbursementId,
      );

    await notificationService.notifyReimbursementPending(
      tripId,
      fromUserId,
      toUserId,
      reimbursementId,
      finalAmount,
      normalizedCurrency,
    );

    res.status(201).json({
      message:
        "Remboursement déclaré. Le bénéficiaire doit maintenant confirmer sa réception.",
      reimbursement,
    });
  } catch (err) {
    next(err);
  }
};

const browseByTrip: RequestHandler =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const tripId =
        Number(
          req.params.tripId,
        );

      const userId =
        Number(req.auth?.sub);

      if (
        !Number.isInteger(
          userId,
        ) ||
        userId <= 0
      ) {
        res.status(401).json({
          error:
            "Utilisateur non authentifié",
        });

        return;
      }

      if (
        !Number.isInteger(
          tripId,
        ) ||
        tripId <= 0
      ) {
        res.status(400).json({
          error:
            "Identifiant du voyage invalide",
        });

        return;
      }

      const userIsMember =
        await tripRepository.isUserMemberOfTrip(
          tripId,
          userId,
        );

      if (!userIsMember) {
        res.status(403).json({
          error:
            "Vous ne participez pas à ce voyage",
        });

        return;
      }

      const reimbursements =
        await reimbursementRepository.findByTripAndUser(
          tripId,
          userId,
        );

      res.status(200).json(
        reimbursements,
      );
    } catch (err) {
      next(err);
    }
  };

const confirm: RequestHandler =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const reimbursementId =
        Number(req.params.id);

      const userId =
        Number(req.auth?.sub);

      if (
        !Number.isInteger(
          userId,
        ) ||
        userId <= 0
      ) {
        res.status(401).json({
          error:
            "Utilisateur non authentifié",
        });

        return;
      }

      if (
        !Number.isInteger(
          reimbursementId,
        ) ||
        reimbursementId <= 0
      ) {
        res.status(400).json({
          error:
            "Identifiant du remboursement invalide",
        });

        return;
      }

      const reimbursement =
        await reimbursementRepository.findById(
          reimbursementId,
        );

      if (!reimbursement) {
        res.status(404).json({
          error:
            "Remboursement introuvable",
        });

        return;
      }

      if (
        Number(
          reimbursement.to_user_id,
        ) !== userId
      ) {
        res.status(403).json({
          error:
            "Seul le bénéficiaire peut confirmer ce remboursement",
        });

        return;
      }

      if (
        reimbursement.status !==
        "pending"
      ) {
        res.status(409).json({
          error:
            "Ce remboursement n’est plus en attente de confirmation",
        });

        return;
      }

      await reimbursementRepository.confirm(
        reimbursementId,
      );

      const updatedReimbursement =
        await reimbursementRepository.findById(
          reimbursementId,
        );

      await notificationService.notifyReimbursementConfirmed(
        Number(
          reimbursement.trip_id,
        ),
        Number(
          reimbursement.from_user_id,
        ),
        userId,
        reimbursementId,
        Number(
          reimbursement.amount,
        ),
        String(
          reimbursement.currency,
        ).toUpperCase(),
      );

      res.status(200).json({
        message:
          "Remboursement confirmé",
        reimbursement:
          updatedReimbursement,
      });
    } catch (err) {
      next(err);
    }
  };

const reject: RequestHandler =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const reimbursementId =
        Number(req.params.id);

      const userId =
        Number(req.auth?.sub);

      if (
        !Number.isInteger(
          userId,
        ) ||
        userId <= 0
      ) {
        res.status(401).json({
          error:
            "Utilisateur non authentifié",
        });

        return;
      }

      if (
        !Number.isInteger(
          reimbursementId,
        ) ||
        reimbursementId <= 0
      ) {
        res.status(400).json({
          error:
            "Identifiant du remboursement invalide",
        });

        return;
      }

      const reimbursement =
        await reimbursementRepository.findById(
          reimbursementId,
        );

      if (!reimbursement) {
        res.status(404).json({
          error:
            "Remboursement introuvable",
        });

        return;
      }

      if (
        Number(
          reimbursement.to_user_id,
        ) !== userId
      ) {
        res.status(403).json({
          error:
            "Seul le bénéficiaire peut refuser ce remboursement",
        });

        return;
      }

      if (
        reimbursement.status !==
        "pending"
      ) {
        res.status(409).json({
          error:
            "Ce remboursement n’est plus en attente de confirmation",
        });

        return;
      }

      await reimbursementRepository.reject(
        reimbursementId,
      );

      const updatedReimbursement =
        await reimbursementRepository.findById(
          reimbursementId,
        );

      await notificationService.notifyReimbursementRejected(
        Number(
          reimbursement.trip_id,
        ),
        Number(
          reimbursement.from_user_id,
        ),
        userId,
        reimbursementId,
        Number(
          reimbursement.amount,
        ),
        String(
          reimbursement.currency,
        ).toUpperCase(),
      );

      res.status(200).json({
        message:
          "Le remboursement a été signalé comme non reçu",
        reimbursement:
          updatedReimbursement,
      });
    } catch (err) {
      next(err);
    }
  };

export default {
  add,
  browseByTrip,
  confirm,
  reject,
};