import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import invitationRepository from "./invitationRepository";

const checkExpirationDate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const invitationId = Number(req.params.id);

    if (
      !Number.isInteger(invitationId) ||
      invitationId <= 0
    ) {
      res.status(400).json({
        error: "ID d'invitation invalide",
      });

      return;
    }

    const invitation =
      await invitationRepository.read(
        invitationId,
      );

    if (
      invitation &&
      invitation.status === "pending" &&
      invitation.trip_end
    ) {
      const tripEnd =
        new Date(
          invitation.trip_end,
        );

      if (
        !Number.isNaN(
          tripEnd.getTime(),
        ) &&
        new Date() > tripEnd
      ) {
        res.status(400).json({
          error: "Invitation expirée",
        });

        return;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default {
  checkExpirationDate,
};