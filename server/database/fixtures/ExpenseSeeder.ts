import AbstractSeeder from "./AbstractSeeder";
import ExpenseCategorySeeder from "./ExpenseCategorySeeder";
import TripSeeder from "./TripSeeder";
import UserSeeder from "./UserSeeder";

class ExpenseSeeder extends AbstractSeeder {
  constructor() {
    super({
      table: "expense",
      truncate: true,
      dependencies: [TripSeeder, UserSeeder, ExpenseCategorySeeder],
    });
  }

  async run() {
    for (let i = 0; i < 10; i += 1) {
      const trip = this.getRef(`trip_${i % 10}`);
      const user = this.getRef(`user_${i % 10}`);
      const category = this.getRef(
        [
          "cat_transport",
          "cat_logement",
          "cat_nourriture",
          "cat_activites",
          "cat_autre",
        ][this.faker.number.int({ min: 0, max: 4 })],
      );

      const fakeExpense = {
        trip_id: trip.insertId,
        title: this.faker.lorem.word(),
        amount: this.faker.finance.amount(),
        date: this.faker.date.recent().toISOString().split("T")[0],
        paid_by: user.insertId,
        category_id: category.insertId,
        refName: `expense_${i}`,
      };

      this.insert(fakeExpense);
    }
  }
}

export default ExpenseSeeder;
