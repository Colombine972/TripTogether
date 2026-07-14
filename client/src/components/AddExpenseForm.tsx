import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowRightLeft,
  CalendarDays,
  CircleDollarSign,
  FileText,
  PieChart,
  Smile,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import "../pages/styles/AddExpenseForm.css";

type Member = {
  id: number;
  firstname: string;
};

type Category = {
  id: number;
  name: string;
};

type SplitMode = "equal" | "exact";

type AddExpenseFormProps = {
  tripId: number;
  members?: Member[];
  categories?: Category[];
  localCurrency?: string;
  preferredCurrency?: string;
  token?: string;
  onExpenseAdded: () => void;
};

const categoryEmojis: Record<string, string> = {
  transport: "🚗",
  logement: "🏠",
  nourriture: "🍽️",
  activités: "🎟️",
  activites: "🎟️",
  autre: "💸",
};

function getCategoryEmoji(categoryName?: string) {
  if (!categoryName) {
    return "💸";
  }

  const normalizedCategoryName = categoryName.trim().toLowerCase();

  return categoryEmojis[normalizedCategoryName] || "💸";
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function AddExpenseForm({
  tripId,
  members = [],
  categories = [],
  localCurrency = "EUR",
  preferredCurrency = "EUR",
  token = "",
  onExpenseAdded,
}: AddExpenseFormProps) {
  const safeLocalCurrency = localCurrency || "EUR";
  const safePreferredCurrency = preferredCurrency || "EUR";

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [paidBy, setPaidBy] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [exactShares, setExactShares] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = categories.find(
    (category) => category.id === Number(categoryId),
  );

  const automaticEmoji = getCategoryEmoji(selectedCategory?.name);
  const finalEmoji = emoji.trim() || automaticEmoji;

  const convertedAmount = useMemo(() => {
    const numericAmount = Number(amount);
    const numericExchangeRate = Number(exchangeRate);

    if (
      Number.isNaN(numericAmount) ||
      Number.isNaN(numericExchangeRate) ||
      numericAmount <= 0 ||
      numericExchangeRate <= 0
    ) {
      return 0;
    }

    return Number((numericAmount * numericExchangeRate).toFixed(2));
  }, [amount, exchangeRate]);

  const formattedConvertedAmount = useMemo(() => {
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: safePreferredCurrency,
      }).format(convertedAmount);
    } catch {
      return `${convertedAmount.toFixed(2)} ${safePreferredCurrency}`;
    }
  }, [convertedAmount, safePreferredCurrency]);

  const toggleMember = (memberId: number) => {
    setSelectedMembers((currentMembers) => {
      const isSelected = currentMembers.includes(memberId);

      if (isSelected) {
        setExactShares((currentShares) => {
          const updatedShares = { ...currentShares };

          delete updatedShares[memberId];

          return updatedShares;
        });

        return currentMembers.filter((id) => id !== memberId);
      }

      return [...currentMembers, memberId];
    });
  };

  const resetForm = () => {
    setTitle("");
    setEmoji("");
    setAmount("");
    setExchangeRate("1");
    setPaidBy("");
    setCategoryId("");
    setDate(getTodayDate());
    setSplitMode("equal");
    setSelectedMembers([]);
    setExactShares({});
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Le titre de la dépense est obligatoire.");
      return false;
    }

    if (!categoryId) {
      toast.error("Sélectionne une catégorie.");
      return false;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Le montant doit être supérieur à zéro.");
      return false;
    }

    if (!exchangeRate || Number(exchangeRate) <= 0) {
      toast.error("Le taux de conversion doit être supérieur à zéro.");
      return false;
    }

    if (!paidBy) {
      toast.error("Sélectionne la personne qui a payé.");
      return false;
    }

    if (!date) {
      toast.error("La date de la dépense est obligatoire.");
      return false;
    }

    if (selectedMembers.length === 0) {
      toast.error("Sélectionne au moins un participant.");
      return false;
    }

    if (!token) {
      toast.error("Session invalide. Merci de te reconnecter.");
      return false;
    }

    if (splitMode === "exact") {
      const hasInvalidShare = selectedMembers.some((memberId) => {
        const value = exactShares[memberId];
        const shareAmount = Number(value);

        return (
          value === undefined ||
          value === "" ||
          Number.isNaN(shareAmount) ||
          shareAmount < 0
        );
      });

      if (hasInvalidShare) {
        toast.error(
          "Renseigne un montant valide pour chaque participant sélectionné.",
        );
        return false;
      }

      const exactTotal = selectedMembers.reduce(
        (sum, memberId) => sum + Number(exactShares[memberId] || 0),
        0,
      );

      if (
        Number(exactTotal.toFixed(2)) !==
        Number(convertedAmount.toFixed(2))
      ) {
        toast.error(
          `La somme des montants répartis doit être égale à ${formattedConvertedAmount}.`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const participants =
      splitMode === "equal"
        ? selectedMembers.map((userId) => ({
            user_id: userId,
            split_type: "equal" as const,
          }))
        : selectedMembers.map((userId) => ({
            user_id: userId,
            split_type: "exact" as const,
            share_amount: Number(exactShares[userId]),
          }));

    setIsSubmitting(true);

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
            title: title.trim(),
            emoji: finalEmoji,
            original_amount: Number(amount),
            original_currency: safeLocalCurrency,
            converted_currency: safePreferredCurrency,
            exchange_rate: Number(exchangeRate),
            paid_by: Number(paidBy),
            category_id: Number(categoryId),
            date,
            participants,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Erreur lors de l'ajout de la dépense.",
        );
      }

      toast.success("Dépense ajoutée avec succès.");

      resetForm();
      onExpenseAdded();
    } catch (error) {
      console.error("Erreur ajout dépense :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter la dépense.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="add-expense-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <header className="expense-form-header">
        <div className="expense-form-header-icon">
          <Wallet size={28} strokeWidth={2.1} />
        </div>

        <div>
          <h3>Ajouter une nouvelle dépense</h3>

        </div>
      </header>

      <fieldset className="form-section expense-info-section">
        <legend className="section-legend">
          <FileText size={18} />
          Informations de la dépense
        </legend>

        <div className="two-columns">
          <label className="form-field">
            <span className="field-label">
              <FileText size={17} />
              Titre
            </span>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex : Restaurant, hôtel, taxi..."
              maxLength={255}
            />
          </label>

          <label className="form-field">
            <span className="field-label">
              <Smile size={17} />
              Emoji
            </span>

            <input
              type="text"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder={automaticEmoji}
              maxLength={10}
            />
          </label>
        </div>

        <label className="form-field full-width">
          <span className="field-label">
            <Tag size={17} />
            Catégorie
          </span>

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Choisir une catégorie</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getCategoryEmoji(category.name)} {category.name}
              </option>
            ))}
          </select>
        </label>

        {categories.length === 0 && (
          <p className="form-info">
            Aucune catégorie disponible pour le moment.
          </p>
        )}
      </fieldset>

      <fieldset className="form-section amount-section">
        <legend className="section-legend">
          <CircleDollarSign size={18} />
          Montant
        </legend>

        <div className="amount-grid">
          <div className="amount-card">
            <span className="amount-label">
              <CircleDollarSign size={16} />
              Montant en devise locale
            </span>

            <div className="amount-input">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
              />

              <span className="currency-tag">
                {safeLocalCurrency}
              </span>
            </div>
          </div>

          <div className="amount-card">
            <span className="amount-label">
              <ArrowRightLeft size={16} />
              Taux de conversion
            </span>

            <div className="amount-input conversion-input">
              <span className="conversion-prefix">
                1 {safeLocalCurrency} =
              </span>

              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value={exchangeRate}
                onChange={(event) =>
                  setExchangeRate(event.target.value)
                }
              />

              <span className="currency-tag">
                {safePreferredCurrency}
              </span>
            </div>
          </div>

          <div className="amount-card converted-card">
            <span className="amount-label">
              <Wallet size={16} />
              Montant converti
            </span>

            <strong>{formattedConvertedAmount}</strong>
          </div>
        </div>
      </fieldset>

      <div className="payer-date-grid">
        <fieldset className="form-section payer-section">
        <label className="form-field">
            <span className="field-label">
              <Users size={17} />
              Payé par
            </span>

            <select
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
            >
              <option value="">Choisir une personne</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstname}
                </option>
              ))}
            </select>
          </label>

          {members.length === 0 && (
            <p className="form-info">
              Aucun participant disponible pour ce voyage.
            </p>
          )}
        </fieldset>

        <fieldset className="form-section date-section">
          <label className="form-field">
            <span className="field-label">
              <CalendarDays size={17} />
              Date de la dépense
            </span>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </fieldset>
      </div>

      <fieldset className="form-section split-section">
        <legend className="section-legend">
          <PieChart size={18} />
          Répartition
        </legend>

        <div className="split-choice">
          <button
            type="button"
            className={splitMode === "equal" ? "active" : ""}
            aria-pressed={splitMode === "equal"}
            onClick={() => setSplitMode("equal")}
          >
            Répartition égale
          </button>

          <button
            type="button"
            className={splitMode === "exact" ? "active" : ""}
            aria-pressed={splitMode === "exact"}
            onClick={() => setSplitMode("exact")}
          >
            Montants exacts
          </button>
        </div>

        <div className="participants-list">
          {members.map((member) => {
            const isSelected = selectedMembers.includes(member.id);

            return (
              <div
                key={member.id}
                className={`participant-row ${
                  isSelected ? "selected" : ""
                }`}
              >
                <label className="participant-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMember(member.id)}
                  />

                  <span>{member.firstname}</span>
                </label>

                {splitMode === "exact" && isSelected && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={`Montant en ${safePreferredCurrency}`}
                    value={exactShares[member.id] || ""}
                    onChange={(event) =>
                      setExactShares((currentShares) => ({
                        ...currentShares,
                        [member.id]: event.target.value,
                      }))
                    }
                    aria-label={`Montant exact pour ${member.firstname}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        className="submit-expense-button"
        disabled={
          isSubmitting ||
          categories.length === 0 ||
          members.length === 0
        }
      >
        {isSubmitting
          ? "Ajout en cours..."
          : "Ajouter la dépense"}
      </button>
    </form>
  );
}

export default AddExpenseForm;