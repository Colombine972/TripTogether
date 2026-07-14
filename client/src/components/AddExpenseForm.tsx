import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import "../pages/styles/AddExpenseForm.css";

type Member = {
  id: number;
  firstname: string;
};

type Category = {
  id: number;
  name: string;
};

type AddExpenseFormProps = {
  tripId: number;
  members: Member[];
  categories: Category[];
  localCurrency: string;
  preferredCurrency: string;
  token: string;
  onExpenseAdded: () => void;
};

const categoryEmojis: Record<string, string> = {
  Transport: "🚗",
  Logement: "🏠",
  Nourriture: "🍽️",
  Activités: "🎟️",
  Autre: "💸",
};

function AddExpenseForm({
  tripId,
  members,
  categories,
  localCurrency,
  preferredCurrency,
  token,
  onExpenseAdded,
}: AddExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [paidBy, setPaidBy] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [splitMode, setSplitMode] = useState<"equal" | "exact">("equal");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [exactShares, setExactShares] = useState<Record<number, string>>({});

  const selectedCategory = categories.find(
    (category) => category.id === Number(categoryId),
  );

  const automaticEmoji = selectedCategory
    ? categoryEmojis[selectedCategory.name] || "💸"
    : "💸";

  const finalEmoji = emoji || automaticEmoji;

  const convertedAmount = useMemo(() => {
    return Number(amount || 0) * Number(exchangeRate || 0);
  }, [amount, exchangeRate]);

  const toggleMember = (memberId: number) => {
    setSelectedMembers((currentMembers) =>
      currentMembers.includes(memberId)
        ? currentMembers.filter((id) => id !== memberId)
        : [...currentMembers, memberId],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !amount || !paidBy || !categoryId || !date) {
      toast.error("Merci de remplir tous les champs obligatoires.");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Sélectionne au moins un participant.");
      return;
    }

    const participants =
      splitMode === "equal"
        ? selectedMembers.map((userId) => ({
            user_id: userId,
            split_type: "equal",
          }))
        : selectedMembers.map((userId) => ({
            user_id: userId,
            split_type: "exact",
            share_amount: Number(exactShares[userId] || 0),
          }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            emoji: finalEmoji,
            original_amount: Number(amount),
            original_currency: localCurrency,
            converted_currency: preferredCurrency,
            exchange_rate: Number(exchangeRate),
            paid_by: Number(paidBy),
            category_id: Number(categoryId),
            date,
            participants,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout");
      }

      toast.success("Dépense ajoutée.");
      onExpenseAdded();

      setTitle("");
      setEmoji("");
      setAmount("");
      setExchangeRate("1");
      setPaidBy("");
      setCategoryId("");
      setSelectedMembers([]);
      setExactShares({});
      setSplitMode("equal");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <form className="add-expense-form" onSubmit={handleSubmit}>
      <h3>Ajouter une dépense</h3>

      <label>
        Titre
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex : Restaurant, hôtel, taxi..."
        />
      </label>

      <label>
        Emoji
        <input
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
          placeholder={automaticEmoji}
          maxLength={2}
        />
      </label>

      <label>
        Catégorie
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Choisir une catégorie</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {categoryEmojis[category.name] || "💸"} {category.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Montant en devise locale ({localCurrency})
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>

      <label>
        Taux de conversion : 1 {localCurrency} = ? {preferredCurrency}
        <input
          type="number"
          min="0"
          step="0.000001"
          value={exchangeRate}
          onChange={(event) => setExchangeRate(event.target.value)}
        />
      </label>

      <p className="converted-preview">
        Montant converti :{" "}
        <strong>
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: preferredCurrency,
          }).format(convertedAmount || 0)}
        </strong>
      </p>

      <label>
        Payé par
        <select value={paidBy} onChange={(event) => setPaidBy(event.target.value)}>
          <option value="">Choisir une personne</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstname}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date de la dépense
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      <div className="split-choice">
        <button
          type="button"
          className={splitMode === "equal" ? "active" : ""}
          onClick={() => setSplitMode("equal")}
        >
          Répartition égale
        </button>

        <button
          type="button"
          className={splitMode === "exact" ? "active" : ""}
          onClick={() => setSplitMode("exact")}
        >
          Montants exacts
        </button>
      </div>

      <div className="participants-list">
        {members.map((member) => (
          <div key={member.id} className="participant-row">
            <label className="participant-checkbox">
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => toggleMember(member.id)}
              />
              {member.firstname}
            </label>

            {splitMode === "exact" && selectedMembers.includes(member.id) && (
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={`Montant en ${preferredCurrency}`}
                value={exactShares[member.id] || ""}
                onChange={(event) =>
                  setExactShares({
                    ...exactShares,
                    [member.id]: event.target.value,
                  })
                }
              />
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="submit-expense-button">
        Ajouter
      </button>
    </form>
  );
}

export default AddExpenseForm;