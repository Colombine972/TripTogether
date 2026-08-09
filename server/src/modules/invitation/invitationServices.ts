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

    if (!invitation) {
      next();
      return;
    }

    if (
      invitation.status === "pending" &&
      invitation.trip_end
    ) {
      const datePart =
        String(invitation.trip_end).slice(
          0,
          10,
        );

      const [year, month, day] =
        datePart
          .split("-")
          .map(Number);

      if (year && month && day) {
        const tripEnd = new Date(
          year,
          month - 1,
          day,
          23,
          59,
          59,
          999,
        );

        if (new Date() > tripEnd) {
          res.status(400).json({
            error:
              "Invitation expirée",
          });

          return;
        }
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