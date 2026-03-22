import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class ExpenseCategoryRepository {
  async findAll() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, name FROM expense_category"
    );
    return rows;
  }
}

export default new ExpenseCategoryRepository();