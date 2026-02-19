import type { NextFunction, Request, RequestHandler, Response } from "express";
import invitationRepository from "./invitationRepository";

const checkExpirationDate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const invitationId = Number(req.params.id);
    const invitation = await invitationRepository.read(invitationId);

    if (
      invitation &&
      invitation.status === "pending" &&
      invitation.trip_start
    ) {
      if (new Date() > new Date(invitation.trip_start)) {
        res.status(400).json({ error: "Invitation expirée" });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default { checkExpirationDate };
