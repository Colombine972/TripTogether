import expenseShareRepository from "./expenseShareRepository";

type ExpenseShare = {
  id: number;
  expense_id: number;
  user_id: number;
  share_amount: number;
};

class ExpenseShareService {
  async createEqualShares(
    expenseId: number,
    totalAmount: number,
    participantIds: number[],
  ): Promise<ExpenseShare[]> {
    if (participantIds.length === 0) {
      throw new Error("Aucun participant fourni");
    }

    const shareAmount = Number(
      (totalAmount / participantIds.length).toFixed(2),
    );

    const createdShares: ExpenseShare[] = [];

    for (const userId of participantIds) {
      const id = await expenseShareRepository.create(
        expenseId,
        userId,
        shareAmount,
      );

      createdShares.push({
        id,
        expense_id: expenseId,
        user_id: userId,
        share_amount: shareAmount,
      });
    }

    return createdShares;
  }
}

export default new ExpenseShareService();
