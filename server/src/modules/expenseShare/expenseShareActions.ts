import type { Request, Response } from "express";
import expenseShareService from "./expenseShareService";

class ExpenseShareController {
  async create(req: Request, res: Response) {
    try {
      const expenseId = Number(req.params.id);
      const { totalAmount, participantIds } = req.body;

      const shares = await expenseShareService.createEqualShares(
        expenseId,
        totalAmount,
        participantIds,
      );

      res.status(201).json(shares);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}

export default new ExpenseShareController();
