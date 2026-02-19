import AbstractSeeder from "./AbstractSeeder";

class ExpenseCategorySeeder extends AbstractSeeder {
  constructor() {
    super({ table: "expense_category", truncate: true, dependencies: [] });
  }

  async run() {
    const categories = [
      { name: "Transport", refName: "cat_transport" },
      { name: "Logement", refName: "cat_logement" },
      { name: "Nourriture", refName: "cat_nourriture" },
      { name: "Activités", refName: "cat_activites" },
      { name: "Autre", refName: "cat_autre" },
    ];

    for (const category of categories) {
      this.insert(category);
    }
  }
}

export default ExpenseCategorySeeder;
