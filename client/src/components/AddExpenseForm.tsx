import {
  ArrowRightLeft,
  BadgeEuro,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  ListChecks,
  PieChart,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "../pages/styles/AddExpenseForm.css";

type Member = {
  id: number;
  firstname: string;
  avatar_url?: string | null;
};

type Category = {
  id: number;
  name: string;
};

type SplitMode = "equal" | "exact";

type ExpenseShare = {
  user_id: number;
  firstname: string;
  share_amount: number;
  split_type?: SplitMode;
};

type EditableExpense = {
  id: number;
  title: string;
  emoji?: string | null;

  amount?: number;
  original_amount?: number | null;
  original_currency?: string | null;
  converted_amount?: number | null;
  converted_currency?: string | null;
  exchange_rate?: number | null;

  paid_by: number;
  category_id: number;

  date?: string | null;
  created_at?: string | null;

  participants?: ExpenseShare[];
};

type AddExpenseFormProps = {
  tripId: number;
  members?: Member[];
  categories?: Category[];
  localCurrency?: string;
  preferredCurrency?: string;
  token?: string;

  expenseToEdit?: EditableExpense | null;

  onExpenseAdded: () => void | Promise<void>;
};

const categoryEmojiOptions: Record<string, string[]> = {
  transport: ["🚗", "✈️", "🚆", "🚌", "🚕", "⛽", "🚲"],
  logement: ["🏠", "🏨", "🛏️", "🏡", "🏕️", "🛎️"],
  nourriture: ["🍽️", "🍕", "🍔", "🥐", "☕", "🍷", "🛒"],
  activité: ["🎟️", "🎭", "🎨", "🏖️", "🎢", "🏛️", "⚽"],
  activités: ["🎟️", "🎭", "🎨", "🏖️", "🎢", "🏛️", "⚽"],
  activite: ["🎟️", "🎭", "🎨", "🏖️", "🎢", "🏛️", "⚽"],
  activites: ["🎟️", "🎭", "🎨", "🏖️", "🎢", "🏛️", "⚽"],
  autre: ["💸", "🧾", "🛍️", "🎁", "📦", "💳"],
};

function normalizeCategoryName(categoryName?: string) {
  return categoryName?.trim().toLowerCase() || "";
}

function getCategoryEmojiOptions(categoryName?: string) {
  const normalizedName = normalizeCategoryName(categoryName);

  return categoryEmojiOptions[normalizedName] || ["💸"];
}

function getDefaultCategoryEmoji(categoryName?: string) {
  return getCategoryEmojiOptions(categoryName)[0];
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
  expenseToEdit = null,
  onExpenseAdded,
}: AddExpenseFormProps) {
  const isEditMode = Boolean(expenseToEdit);
  
  const safeLocalCurrency = (localCurrency || "EUR").toUpperCase();
  const safePreferredCurrency = (preferredCurrency || "EUR").toUpperCase();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState<string | null>(
    null,
  );

  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState(getTodayDate());

  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [exactShares, setExactShares] = useState<Record<number, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Récupération automatique du taux de conversion.
   *
   * Cette fonction appelle :
   * GET /api/exchange-rates?from=MUR&to=EUR
   *
   * Réponse attendue :
   * { "rate": 0.0185 }
   */
  useEffect(() => {
    const abortController = new AbortController();

    const fetchExchangeRate = async () => {
      setExchangeRateError(null);

      if (safeLocalCurrency === safePreferredCurrency) {
        setExchangeRate("1");
        setIsRateLoading(false);
        return;
      }

      setIsRateLoading(true);
      setExchangeRate("");

      try {
        const searchParams = new URLSearchParams({
          from: safeLocalCurrency,
          to: safePreferredCurrency,
        });

        const headers: HeadersInit = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/exchange-rates?${searchParams.toString()}`,
          {
            method: "GET",
            headers,
            signal: abortController.signal,
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Impossible de récupérer le taux de conversion.",
          );
        }

        const receivedRate = Number(data?.rate);

        if (!Number.isFinite(receivedRate) || receivedRate <= 0) {
          throw new Error("Le taux de conversion reçu est invalide.");
        }

        setExchangeRate(String(receivedRate));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Erreur récupération taux de change :", error);

        setExchangeRate("");
        setExchangeRateError(
          "Taux automatique indisponible. Vous pouvez le saisir manuellement.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsRateLoading(false);
        }
      }
    };

    fetchExchangeRate();

    return () => {
      abortController.abort();
    };
  }, [safeLocalCurrency, safePreferredCurrency, token]);

  const selectedCategory = categories.find(
    (category) => category.id === Number(categoryId),
  );

  const availableEmojis = useMemo(
    () => getCategoryEmojiOptions(selectedCategory?.name),
    [selectedCategory?.name],
  );

  const automaticEmoji = selectedCategory
    ? getDefaultCategoryEmoji(selectedCategory.name)
    : "";

  const finalEmoji = selectedEmoji || automaticEmoji;

  const convertedAmount = useMemo(() => {
    const numericAmount = Number(amount);
    const numericExchangeRate = Number(exchangeRate);

    if (
      !Number.isFinite(numericAmount) ||
      !Number.isFinite(numericExchangeRate) ||
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

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCategoryId(event.target.value);
    setSelectedEmoji("");
    setShowEmojiPicker(false);
  };

  const handleExchangeRateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setExchangeRate(event.target.value);
    setExchangeRateError(null);
  };

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
    setCategoryId("");
    setSelectedEmoji("");
    setShowEmojiPicker(false);

    setAmount("");

    setPaidBy("");
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

    if (
      !exchangeRate ||
      !Number.isFinite(Number(exchangeRate)) ||
      Number(exchangeRate) <= 0
    ) {
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
          !Number.isFinite(shareAmount) ||
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
        Number(exactTotal.toFixed(2)) !== Number(convertedAmount.toFixed(2))
      ) {
        toast.error(
          `La somme des montants répartis doit être égale à ${formattedConvertedAmount}.`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    <form className="add-expense-form" onSubmit={handleSubmit} noValidate>
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
          <ClipboardList size={18} />
          Informations de la dépense
        </legend>

        <label className="form-field full-width">
          <span className="field-label">
            <ListChecks size={17} />
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

        <label className="form-field full-width">
          <span className="field-label">
            <Tag size={17} />
            Catégorie
          </span>

          <select value={categoryId} onChange={handleCategoryChange}>
            <option value="">Choisir une catégorie</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getDefaultCategoryEmoji(category.name)} {category.name}
              </option>
            ))}
          </select>
        </label>

        {categories.length === 0 && (
          <p className="form-info">
            Aucune catégorie disponible pour le moment.
          </p>
        )}

        {selectedCategory && (
          <div className="emoji-customization">
            <div className="emoji-preview">
              <span className="emoji-preview-icon">{finalEmoji}</span>

              <div>
                <p className="emoji-preview-title">Emoji de la dépense</p>

                <p className="emoji-preview-description">
                  Choisi automatiquement selon la catégorie{" "}
                  {selectedCategory.name}.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="emoji-toggle-button"
              onClick={() =>
                setShowEmojiPicker((currentValue) => !currentValue)
              }
              aria-expanded={showEmojiPicker}
            >
              {showEmojiPicker ? "Fermer" : "Modifier l’emoji"}
            </button>

            {showEmojiPicker && (
              <div className="emoji-picker">
                {availableEmojis.map((emojiOption) => {
                  const isSelected = finalEmoji === emojiOption;

                  return (
                    <button
                      key={emojiOption}
                      type="button"
                      className={`emoji-option ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedEmoji(emojiOption);
                        setShowEmojiPicker(false);
                      }}
                      aria-label={`Choisir l’emoji ${emojiOption}`}
                      aria-pressed={isSelected}
                    >
                      {emojiOption}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
              <Banknote size={16} />
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

              <span className="currency-tag">{safeLocalCurrency}</span>
            </div>
          </div>

          <div className="amount-card">
            <span className="amount-label">
              <ArrowRightLeft size={16} />
              Taux de conversion
            </span>

            <div className="amount-input conversion-input">
              <span className="conversion-prefix">1 {safeLocalCurrency} =</span>

              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value={exchangeRate}
                onChange={handleExchangeRateChange}
                placeholder={isRateLoading ? "Chargement..." : "Saisir le taux"}
                disabled={isRateLoading}
                aria-label={`Taux de conversion de ${safeLocalCurrency} vers ${safePreferredCurrency}`}
              />

              <span className="currency-tag">{safePreferredCurrency}</span>
            </div>

            {isRateLoading && (
              <small className="rate-message">
                Récupération du taux en cours…
              </small>
            )}

            {exchangeRateError && (
              <small className="rate-error">{exchangeRateError}</small>
            )}
          </div>

          <div className="amount-card converted-card">
            <span className="amount-label">
              <BadgeEuro size={16} />
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
                className={`participant-row ${isSelected ? "selected" : ""}`}
              >
                <label className="participant-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMember(member.id)}
                  />

                  <img
                    src={member.avatar_url || "/images/utilisateur.png"}
                    alt={`Avatar de ${member.firstname}`}
                    className="participant-avatar"
                  />

                  <span className="participant-name">{member.firstname}</span>
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
          isSubmitting || categories.length === 0 || members.length === 0
        }
      >
        {isSubmitting ? "Ajout en cours..." : "Ajouter la dépense"}
      </button>
    </form>
  );
}

export default AddExpenseForm;
