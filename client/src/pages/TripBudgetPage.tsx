import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetSummary from "../components/BudgetSummary";
import Modal from "../components/Modal";
import NavTabs from "../components/NavTabs";
import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";
import type { TheTrip } from "../types/tripType";
import "./styles/TripBugdetPage.css";

type BudgetSummaryData = {
  total: number;
  paid: number;
  owed?: number;
  balance: number;
};

type ExpenseShare = {
  user_id: number;
  firstname: string;
  share_amount: number;
  split_type?: "equal" | "exact";
};

type Expense = {
  id: number;
  trip_id?: number;
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
  date: string;
  created_at?: string;

  category_name?: string;
  paid_by_name?: string;
  shares?: ExpenseShare[];
};

type MemberApiResponse = {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
};

type Member = {
  id: number;
  firstname: string;
};

type Category = {
  id: number;
  name: string;
};

function TripBudgetPage() {
  const { id } = useParams();
  const tripId = Number(id);

  const { auth } = useAuth();

  const token = auth?.token || localStorage.getItem("token") || "";
  const currentUserId = auth?.user?.id;

  const [trip, setTrip] = useState<TheTrip | null>(null);

  const [summary, setSummary] = useState<BudgetSummaryData>({
    total: 0,
    paid: 0,
    owed: 0,
    balance: 0,
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [expenseToDelete, setExpenseToDelete] =
    useState<Expense | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const authHeaders = useMemo<Record<string, string>>(() => {
    if (!token) {
      return {
        "Content-Type": "application/json",
      };
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const getTrip = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
        {
          headers: authHeaders,
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de charger le voyage.",
        );
      }

      setTrip(data);
    } catch (error) {
      console.error("Erreur getTrip :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de charger le voyage.",
      );
    }
  }, [tripId, authHeaders]);

  const getMembers = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/members`,
        {
          headers: authHeaders,
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de charger les participants.",
        );
      }

      const receivedMembers: MemberApiResponse[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.members)
          ? data.members
          : [];

      const formattedMembers: Member[] = receivedMembers.map((member) => ({
        id: member.id,
        firstname:
          member.firstname?.trim() ||
          member.email?.trim() ||
          "Participant",
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Erreur getMembers :", error);
      setMembers([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de charger les participants.",
      );
    }
  }, [tripId, authHeaders]);

  const getCategories = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories`,
        {
          headers: authHeaders,
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de charger les catégories.",
        );
      }

      const receivedCategories: Category[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
          ? data.categories
          : [];

      setCategories(receivedCategories);
    } catch (error) {
      console.error("Erreur getCategories :", error);
      setCategories([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de charger les catégories.",
      );
    }
  }, [authHeaders]);

  const getExpenses = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}`,
        {
          headers: authHeaders,
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de charger les dépenses.",
        );
      }

      const receivedExpenses: Expense[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.expenses)
          ? data.expenses
          : [];

      setExpenses(receivedExpenses);
    } catch (error) {
      console.error("Erreur getExpenses :", error);
      setExpenses([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de charger les dépenses.",
      );
    }
  }, [tripId, authHeaders]);

  const getSummary = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}/summary`,
        {
          headers: authHeaders,
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de charger le résumé du budget.",
        );
      }

      setSummary({
        total: Number(data?.total || 0),
        paid: Number(data?.paid || 0),
        owed: Number(data?.owed || 0),
        balance: Number(data?.balance || 0),
      });
    } catch (error) {
      console.error("Erreur getSummary :", error);

      setSummary({
        total: 0,
        paid: 0,
        owed: 0,
        balance: 0,
      });
    }
  }, [tripId, token, authHeaders]);

  const refreshBudget = useCallback(async () => {
    await Promise.all([getExpenses(), getSummary()]);
  }, [getExpenses, getSummary]);

  useEffect(() => {
    if (!tripId || Number.isNaN(tripId)) {
      toast.error("Identifiant du voyage invalide.");
      setIsLoading(false);
      return;
    }

    const loadBudgetPage = async () => {
      setIsLoading(true);

      await Promise.all([
        getTrip(),
        getMembers(),
        getCategories(),
        getExpenses(),
        getSummary(),
      ]);

      setIsLoading(false);
    };

    loadBudgetPage();
  }, [
    tripId,
    getTrip,
    getMembers,
    getCategories,
    getExpenses,
    getSummary,
  ]);

  const displayCurrency =
    trip?.base_currency ||
    expenses.find((expense) => expense.converted_currency)
      ?.converted_currency ||
    "EUR";

  const formatCurrency = (
    amount?: number | null,
    currency?: string | null,
  ) => {
    const safeAmount = Number(amount || 0);
    const safeCurrency = currency || displayCurrency || "EUR";

    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: safeCurrency,
      }).format(safeAmount);
    } catch {
      return `${safeAmount.toFixed(2)} ${safeCurrency}`;
    }
  };

  const formatExpenseDate = (date: string) => {
    const parsedDate = new Date(`${date}T12:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date inconnue";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsedDate);
  };

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};

    const sortedExpenses = [...expenses].sort((expenseA, expenseB) => {
      const dateA = new Date(
        expenseA.date || expenseA.created_at || 0,
      ).getTime();

      const dateB = new Date(
        expenseB.date || expenseB.created_at || 0,
      ).getTime();

      return dateB - dateA;
    });

    for (const expense of sortedExpenses) {
      const dateKey =
        expense.date ||
        expense.created_at?.split("T")[0] ||
        "Date inconnue";

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(expense);
    }

    return groups;
  }, [expenses]);

  const handleExpenseAdded = async () => {
    setIsModalOpen(false);
    await refreshBudget();
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) {
      return;
    }

    if (!token) {
      toast.error("Session invalide. Merci de te reconnecter.");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${expenseToDelete.id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de supprimer la dépense.",
        );
      }

      toast.success("Dépense supprimée.");

      setExpenseToDelete(null);
      await refreshBudget();
    } catch (error) {
      console.error("Erreur handleDeleteExpense :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la dépense.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {trip && <TripInfos trip={trip} />}

      <main className="page-membre trip-budget-page">
        <NavTabs />

        {isLoading ? (
          <p className="loading-text">Chargement du budget...</p>
        ) : (
          <>
            <BudgetSummary
              total={summary.total}
              paid={summary.paid}
              balance={summary.balance}
              expenseCount={expenses.length}
              currency={displayCurrency}
            />

            <section className="expenses-section">
              <div className="expenses-header">
                <div>
                  <h2>Dépenses ({expenses.length})</h2>

                  <p className="expenses-subtitle">
                    Retrouvez toutes les dépenses du voyage.
                  </p>
                </div>

                <button
                  type="button"
                  className="add-expense-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Ajouter une dépense
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="empty-expenses">
                  <p>Aucune dépense enregistrée pour le moment.</p>

                  <button
                    type="button"
                    className="add-expense-btn"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Ajouter la première dépense
                  </button>
                </div>
              ) : (
                Object.entries(groupedExpenses).map(
                  ([date, dateExpenses]) => (
                    <section key={date} className="expense-date-block">
                      <h3 className="expense-date-title">
                        {date === "Date inconnue"
                          ? date
                          : formatExpenseDate(date)}
                      </h3>

                      <div className="expense-date-list">
                        {dateExpenses.map((expense) => {
                          const displayedAmount =
                            expense.converted_amount ??
                            expense.amount ??
                            expense.original_amount ??
                            0;

                          const expenseCurrency =
                            expense.converted_currency ||
                            displayCurrency;

                          const participantCount =
                            expense.shares?.length || 0;

                          return (
                            <article
                              key={expense.id}
                              className="expense-card"
                            >
                              <div className="expense-header-row">
                                <div className="expense-left">
                                  <div className="expense-icon">
                                    {expense.emoji || "💸"}
                                  </div>

                                  <div>
                                    <h4 className="expense-description">
                                      {expense.title}
                                    </h4>

                                    <p className="expense-paid">
                                      Payé par{" "}
                                      {expense.paid_by_name ||
                                        "un participant"}
                                    </p>

                                    {expense.category_name && (
                                      <p className="expense-category">
                                        {expense.category_name}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="expense-right">
                                  <button
                                    type="button"
                                    className="delete-expense-btn"
                                    onClick={() =>
                                      setExpenseToDelete(expense)
                                    }
                                    aria-label={`Supprimer la dépense ${expense.title}`}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="trash-icon"
                                      aria-hidden="true"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.536 4.569a.75.75 0 0 0-1.44.32l.5 10a.75.75 0 0 0 1.498-.06l-.558-10.26Zm4.5 0a.75.75 0 0 0-1.5 0v10.26a.75.75 0 0 0 1.5 0v-10.26Zm3.536.26a.75.75 0 0 0-1.44-.32l-.558 10.26a.75.75 0 0 0 1.498.06l.5-10Z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>

                                  <strong className="expense-amount">
                                    {formatCurrency(
                                      displayedAmount,
                                      expenseCurrency,
                                    )}
                                  </strong>

                                  <span className="expense-participants">
                                    {participantCount > 0
                                      ? `${participantCount} participant${
                                          participantCount > 1 ? "s" : ""
                                        }`
                                      : "Aucun participant"}
                                  </span>
                                </div>
                              </div>

                              {expense.shares &&
                                expense.shares.length > 0 &&
                                currentUserId && (
                                  <>
                                    <div className="expense-divider" />

                                    <div className="expense-debt">
                                      {expense.paid_by ===
                                      currentUserId ? (
                                        <div className="debt-positive">
                                          <p>💰 On te doit :</p>

                                          {expense.shares
                                            .filter(
                                              (share) =>
                                                share.user_id !==
                                                currentUserId,
                                            )
                                            .map((share) => (
                                              <div
                                                key={share.user_id}
                                              >
                                                {share.firstname} te doit{" "}
                                                <strong>
                                                  {formatCurrency(
                                                    share.share_amount,
                                                    expenseCurrency,
                                                  )}
                                                </strong>
                                              </div>
                                            ))}
                                        </div>
                                      ) : (
                                        <div className="debt-negative">
                                          {expense.shares
                                            .filter(
                                              (share) =>
                                                share.user_id ===
                                                currentUserId,
                                            )
                                            .map((share) => (
                                              <p key={share.user_id}>
                                                ⚠ Tu dois{" "}
                                                <strong>
                                                  {formatCurrency(
                                                    share.share_amount,
                                                    expenseCurrency,
                                                  )}
                                                </strong>{" "}
                                                à{" "}
                                                {expense.paid_by_name ||
                                                  "ce participant"}
                                              </p>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ),
                )
              )}
            </section>
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <AddExpenseForm
            tripId={tripId}
            members={members}
            categories={categories}
            localCurrency={trip?.local_currency || "EUR"}
            preferredCurrency={trip?.base_currency || "EUR"}
            token={token}
            onExpenseAdded={handleExpenseAdded}
          />
        </Modal>

        {expenseToDelete && (
          <div className="modal-backdrop">
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-expense-title"
            >
              <h4 id="delete-expense-title">
                Supprimer cette dépense ?
              </h4>

              <p>
                Voulez-vous vraiment supprimer la dépense{" "}
                <strong>{expenseToDelete.title}</strong> ?
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-role"
                  onClick={() => setExpenseToDelete(null)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDeleteExpense}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? "Suppression..."
                    : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default TripBudgetPage;