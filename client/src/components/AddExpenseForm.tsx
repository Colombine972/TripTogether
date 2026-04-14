import "../pages/styles/AddExpenseForm.css";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Member = {
  id: number;
  firstname?: string;
  email?: string;
};

type Category = {
  id: number;
  name: string;
};

type AddExpenseFormProps = {
  tripId: number;
  members: Member[];
  onSuccess: () => void;
};

function AddExpenseForm({
  tripId,
  members,
  onSuccess,
}: AddExpenseFormProps) {
  const { auth } = useAuth();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/categories`,
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des catégories");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur récupération catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategoryId("");
    setPaidBy("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!auth?.token) {
      console.error("Utilisateur non authentifié");
      return;
    }

    if (!title || !amount || !categoryId || !paidBy) {
      console.error("Champs manquants");
      return;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      console.error("Montant invalide");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            tripId,
            title: title.trim(),
            amount: numericAmount,
            paid_by: Number(paidBy),
            category_id: Number(categoryId),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur backend :", errorData);
        throw new Error(errorData.message || "Erreur création dépense");
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Erreur ajout dépense :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-expense-form" onSubmit={handleSubmit}>
      <h2>Ajouter une dépense</h2>

      <input
        type="text"
        placeholder="Titre"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        required
      />

      <input
        type="number"
        placeholder="Montant"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        min="0.01"
        step="0.01"
        disabled={isSubmitting}
        required
      />

      <select
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        disabled={isSubmitting}
        required
      >
        <option value="">Choisir une catégorie</option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={paidBy}
        onChange={(event) => setPaidBy(event.target.value)}
        disabled={isSubmitting}
        required
      >
        <option value="">Payé par</option>

        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.firstname || member.email}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={
          isSubmitting || !title || !amount || !categoryId || !paidBy
        }
      >
        {isSubmitting ? "Enregistrement en cours..." : "Enregistrer"}
      </button>
    </form>
  );
}

export default AddExpenseForm;