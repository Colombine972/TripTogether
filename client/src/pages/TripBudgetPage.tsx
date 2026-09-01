import { Download, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetSummary from "../components/BudgetSummary";
import Modal from "../components/Modal";
import PaymentDetailsModal from "../components/PaymentDetailsModal";
import PendingReimbursements from "../components/PendingReimbursements";
import RemboursementSummary from "../components/RemboursementSummary";
import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";
import type { ParticipantBalance } from "../types/participantBalance";
import type { Reimbursement } from "../types/reimbursement";
import type { TheTrip } from "../types/tripType";
import { exportBudgetToPdf } from "../utils/exportBudgetToPdf";
import "./styles/TripBugdetPage.css";

type BudgetSummaryData = {
  total: number;
  paid: number;
  owed?: number;
  balance: number;
};

type UserPreferences = {
  email_trip_notifications: boolean;
  default_currency: string;
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
  date?: string | null;
  created_at?: string | null;
  category_name?: string;
  paid_by_name?: string;
  participants?: ExpenseShare[];
  deletion_locked?: boolean;
};

type MemberApiResponse = {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  avatar_url?: string | null;
};

type Member = {
  id: number;
  firstname: string;
  avatar_url: string | null;
};

type Category = {
  id: number;
  name: string;
};

function TripBudgetPage() {
  const { id } = useParams();
  const tripId = Number(id);

  const [searchParams] = useSearchParams();

  const notificationTarget = searchParams.get("target");
  const notificationReferenceId = searchParams.get("ref");

  const { auth } = useAuth();

  const token = auth?.token || localStorage.getItem("token") || "";
  const currentUserId = auth?.user?.id;

  const [trip, setTrip] = useState<TheTrip | null>(null);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    email_trip_notifications: true,
    default_currency: "EUR",
  });

  const [participantToReimburse, setParticipantToReimburse] =
    useState<ParticipantBalance | null>(null);

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

  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);

  const authHeaders = useMemo((): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
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
          data?.error || data?.message || "Impossible de charger le voyage.",
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

  const getUserPreferences = useCallback(async () => {
    if (!token) {
      setUserPreferences({
        email_trip_notifications: true,
        default_currency: "EUR",
      });

      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/preferences`,
        {
          headers: authHeaders,
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de charger les préférences utilisateur.",
        );
      }

      setUserPreferences({
        email_trip_notifications: Boolean(data?.email_trip_notifications),
        default_currency: String(data?.default_currency || "EUR").toUpperCase(),
      });
    } catch (error) {
      console.error("Erreur getUserPreferences :", error);

      setUserPreferences({
        email_trip_notifications: true,
        default_currency: "EUR",
      });

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de charger les préférences utilisateur.",
      );
    }
  }, [token, authHeaders]);

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
          member.firstname?.trim() || member.email?.trim() || "Participant",
        avatar_url: member.avatar_url || null,
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

  const getReimbursements = useCallback(async () => {
    if (!token) {
      setReimbursements([]);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reimbursements/trip/${tripId}`,
        {
          headers: authHeaders,
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de charger les remboursements.",
        );
      }

      setReimbursements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur getReimbursements :", error);
      setReimbursements([]);
    }
  }, [tripId, token, authHeaders]);

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
          data?.error || data?.message || "Impossible de charger les dépenses.",
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
    await Promise.all([getExpenses(), getSummary(), getReimbursements()]);
  }, [getExpenses, getSummary, getReimbursements]);

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
        getUserPreferences(),
        getMembers(),
        getCategories(),
        getExpenses(),
        getSummary(),
        getReimbursements(),
      ]);

      setIsLoading(false);
    };

    loadBudgetPage();
  }, [
    tripId,
    getTrip,
    getUserPreferences,
    getMembers,
    getCategories,
    getExpenses,
    getSummary,
    getReimbursements,
  ]);

  useEffect(() => {
    if (!notificationTarget || !notificationReferenceId || isLoading) {
      return;
    }

    let selector: string | null = null;

    if (notificationTarget === "expense") {
      selector = `[data-notification-ref="expense-${notificationReferenceId}"]`;
    }

    if (notificationTarget === "reimbursement") {
      selector = `[data-notification-ref="reimbursement-${notificationReferenceId}"]`;
    }

    if (!selector) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;
    let timeoutId: number | undefined;

    const scrollToTarget = () => {
      if (!selector) {
        return;
      }

      const targetElement = document.querySelector<HTMLElement>(selector);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        targetElement.classList.add("notification-target-highlight");

        window.setTimeout(() => {
          targetElement.classList.remove("notification-target-highlight");
        }, 2500);

        return;
      }

      attempts += 1;

      if (attempts < maxAttempts) {
        timeoutId = window.setTimeout(scrollToTarget, 150);
      }
    };

    timeoutId = window.setTimeout(scrollToTarget, 150);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [notificationTarget, notificationReferenceId, isLoading]);

  const displayCurrency =
    userPreferences.default_currency ||
    expenses.find((expense) => expense.converted_currency)
      ?.converted_currency ||
    "EUR";

  const formatCurrency = (amount?: number | null, currency?: string | null) => {
    const safeAmount = Number(amount || 0);
    const safeCurrency = (currency || displayCurrency || "EUR").toUpperCase();

    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: safeCurrency,
      }).format(safeAmount);
    } catch {
      return `${safeAmount.toFixed(2)} ${safeCurrency}`;
    }
  };

  const getExpenseDateKey = useCallback((expense: Expense): string => {
    const rawDate = expense.date || expense.created_at;

    if (!rawDate) {
      return "Date inconnue";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return rawDate;
    }

    const parsedDate = new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date inconnue";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const formatExpenseDate = (date: string) => {
    if (date === "Date inconnue") {
      return date;
    }

    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) {
      return "Date inconnue";
    }

    const parsedDate = new Date(year, month - 1, day);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date inconnue";
    }

    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsedDate);

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};

    const sortedExpenses = [...expenses].sort((expenseA, expenseB) => {
      const dateKeyA = getExpenseDateKey(expenseA);
      const dateKeyB = getExpenseDateKey(expenseB);

      if (dateKeyA === "Date inconnue") {
        return 1;
      }

      if (dateKeyB === "Date inconnue") {
        return -1;
      }

      return dateKeyB.localeCompare(dateKeyA);
    });

    for (const expense of sortedExpenses) {
      const dateKey = getExpenseDateKey(expense);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(expense);
    }

    return groups;
  }, [expenses, getExpenseDateKey]);

  const balancesByParticipant = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    const balancesMap = new Map<number, ParticipantBalance>();
    const connectedUserId = Number(currentUserId);

    const getOrCreateBalance = (
      userId: number,
      firstname: string,
    ): ParticipantBalance => {
      const existingBalance = balancesMap.get(userId);

      if (existingBalance) {
        return existingBalance;
      }

      const newBalance: ParticipantBalance = {
        userId,
        firstname,
        amountToReceive: 0,
        amountToPay: 0,
        netBalance: 0,
      };

      balancesMap.set(userId, newBalance);

      return newBalance;
    };

    for (const expense of expenses) {
      const payerId = Number(expense.paid_by);
      const payerName = expense.paid_by_name || "Participant";

      if (payerId === connectedUserId) {
        for (const participant of expense.participants || []) {
          const participantId = Number(participant.user_id);

          if (participantId === connectedUserId) {
            continue;
          }

          const balance = getOrCreateBalance(
            participantId,
            participant.firstname || "Participant",
          );

          balance.amountToReceive += Number(participant.share_amount || 0);
        }

        continue;
      }

      const currentUserShare = expense.participants?.find(
        (participant) => Number(participant.user_id) === connectedUserId,
      );

      if (!currentUserShare) {
        continue;
      }

      const balance = getOrCreateBalance(payerId, payerName);

      balance.amountToPay += Number(currentUserShare.share_amount || 0);
    }

    for (const reimbursement of reimbursements) {
      if (reimbursement.status !== "confirmed") {
        continue;
      }

      const amount = Number(reimbursement.amount || 0);
      const fromUserId = Number(reimbursement.from_user_id);
      const toUserId = Number(reimbursement.to_user_id);

      if (fromUserId === connectedUserId) {
        const balance = balancesMap.get(toUserId);

        if (balance) {
          balance.amountToPay = Math.max(0, balance.amountToPay - amount);
        }
      }

      if (toUserId === connectedUserId) {
        const balance = balancesMap.get(fromUserId);

        if (balance) {
          balance.amountToReceive = Math.max(
            0,
            balance.amountToReceive - amount,
          );
        }
      }
    }

    return Array.from(balancesMap.values())
      .map((balance) => {
        const amountToReceive = Number(balance.amountToReceive.toFixed(2));

        const amountToPay = Number(balance.amountToPay.toFixed(2));

        const netBalance = Number((amountToReceive - amountToPay).toFixed(2));

        return {
          ...balance,
          amountToReceive,
          amountToPay,
          netBalance,
        };
      })
      .filter((balance) => Math.abs(balance.netBalance) >= 0.01)
      .sort(
        (balanceA, balanceB) =>
          Math.abs(balanceB.netBalance) - Math.abs(balanceA.netBalance),
      );
  }, [expenses, reimbursements, currentUserId]);

  const updatedBalance = useMemo(() => {
    return Number(
      balancesByParticipant
        .reduce(
          (total, participantBalance) => total + participantBalance.netBalance,
          0,
        )
        .toFixed(2),
    );
  }, [balancesByParticipant]);

  const handleExportBudgetPdf = async () => {
    if (!trip) {
      toast.error("Impossible d'exporter le budget : voyage introuvable.");

      return;
    }

    if (expenses.length === 0) {
      toast.info("Aucune dépense à exporter.");

      return;
    }

    try {
      await exportBudgetToPdf({
        tripTitle: trip.title || "Voyage TripTogether",

        destination:
          [trip.city, trip.country].filter(Boolean).join(", ") || null,

        startAt: trip.start_at || null,

        endAt: trip.end_at || null,

        currency: displayCurrency,

        total: summary.total,

        paid: summary.paid,

        balance: updatedBalance,

        expenses,

        balances: balancesByParticipant,

        reimbursements,

        members,

        tripImageUrl: trip.place_id
          ? `${import.meta.env.VITE_API_URL}/api/places/photo/${trip.place_id}`
          : null,
      });

      toast.success("Le PDF du budget a été généré.");
    } catch (error) {
      console.error("Erreur export PDF :", error);

      toast.error("Impossible de générer le PDF du budget.");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsModalOpen(false);
    setExpenseToEdit(null);
  };

  const handleExpenseAdded = async () => {
    handleCloseExpenseModal();
    await refreshBudget();
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) {
      return;
    }

    if (expenseToDelete.deletion_locked) {
      toast.info(
        "Cette dépense est liée à un remboursement. Sa suppression est impossible.",
      );

      setExpenseToDelete(null);

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
          data?.error || data?.message || "Impossible de supprimer la dépense.",
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
      {trip && <TripInfos trip={trip} onTripUpdated={setTrip} />}

      <main className="page-membre trip-budget-page">
        {isLoading ? (
          <p className="loading-text">Chargement du budget...</p>
        ) : (
          <>
            <BudgetSummary
              total={summary.total}
              paid={summary.paid}
              balance={updatedBalance}
              expenseCount={expenses.length}
              currency={displayCurrency}
            />

            {currentUserId && (
              <PendingReimbursements
                reimbursements={reimbursements}
                currentUserId={Number(currentUserId)}
                token={token}
                onUpdated={refreshBudget}
              />
            )}

            <RemboursementSummary
              balances={balancesByParticipant}
              currency={displayCurrency}
              onReimburse={setParticipantToReimburse}
            />
            <section className="expenses-section">
              <div className="expenses-header">
                <p className="expenses-subtitle">
                  Retrouvez toutes les dépenses du voyage.
                </p>

                <div className="expenses-header-actions">
                  <button
                    type="button"
                    className="export-budget-btn"
                    onClick={handleExportBudgetPdf}
                    disabled={expenses.length === 0}
                  >
                    <Download size={18} aria-hidden="true" />
                    Exporter en PDF
                  </button>

                  <button
                    type="button"
                    className="add-expense-btn"
                    onClick={() => {
                      setExpenseToEdit(null);
                      setIsModalOpen(true);
                    }}
                  >
                    + Ajouter une dépense
                  </button>
                </div>
              </div>

              {expenses.length === 0 ? (
                <div className="empty-expenses">
                  <p>Aucune dépense enregistrée pour le moment.</p>

                  <button
                    type="button"
                    className="add-expense-btn"
                    onClick={() => {
                      setExpenseToEdit(null);
                      setIsModalOpen(true);
                    }}
                  >
                    Ajouter la première dépense
                  </button>
                </div>
              ) : (
                Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
                  <section key={date} className="expense-date-block">
                    <h3 className="expense-date-title">
                      {formatExpenseDate(date)}
                    </h3>

                    <div className="expense-date-list">
                      {dateExpenses.map((expense) => {
                        const displayedAmount =
                          expense.converted_amount ??
                          expense.amount ??
                          expense.original_amount ??
                          0;

                        const expenseCurrency =
                          expense.converted_currency || displayCurrency;

                        return (
                          <article
                            key={expense.id}
                            className="expense-card"
                            data-notification-ref={`expense-${expense.id}`}
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
                                    {expense.paid_by_name || "un participant"}
                                  </p>

                                  {expense.category_name && (
                                    <p className="expense-category">
                                      {expense.category_name}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="expense-right">
                                <div className="expense-actions">
                                  <div
                                    className="expense-edit-wrapper"
                                    title={
                                      expense.deletion_locked
                                        ? "Cette dépense est liée à un remboursement. Sa modification est impossible."
                                        : "Modifier la dépense"
                                    }
                                  >
                                    <div
                                      className="expense-edit-wrapper"
                                      title={
                                        expense.deletion_locked
                                          ? "Cette dépense est liée à un remboursement. Sa modification est impossible."
                                          : "Modifier la dépense"
                                      }
                                    >
                                      <button
                                        type="button"
                                        className={`edit-expense-btn ${
                                          expense.deletion_locked
                                            ? "edit-expense-btn-disabled"
                                            : ""
                                        }`}
                                        aria-disabled={expense.deletion_locked}
                                        aria-label={
                                          expense.deletion_locked
                                            ? `Modification impossible pour la dépense ${expense.title} : dépense liée à un remboursement`
                                            : `Modifier la dépense ${expense.title}`
                                        }
                                        onClick={() => {
                                          if (expense.deletion_locked) {
                                            toast.info(
                                              "Cette dépense est liée à un remboursement. Sa modification est impossible.",
                                            );

                                            return;
                                          }

                                          handleEditExpense(expense);
                                        }}
                                      >
                                        <Pencil
                                          size={17}
                                          className="edit-icon"
                                          aria-hidden="true"
                                        />
                                      </button>
                                    </div>
                                  </div>

                                  <div
                                    className="expense-delete-wrapper"
                                    title={
                                      expense.deletion_locked
                                        ? "Cette dépense est liée à un remboursement. Sa suppression est impossible."
                                        : "Supprimer la dépense"
                                    }
                                  >
                                    <button
                                      type="button"
                                      className={`delete-expense-btn ${
                                        expense.deletion_locked
                                          ? "delete-expense-btn-disabled"
                                          : ""
                                      }`}
                                      aria-disabled={expense.deletion_locked}
                                      aria-label={
                                        expense.deletion_locked
                                          ? `Suppression impossible pour la dépense ${expense.title} : dépense liée à un remboursement`
                                          : `Supprimer la dépense ${expense.title}`
                                      }
                                      onClick={() => {
                                        if (expense.deletion_locked) {
                                          toast.info(
                                            "Cette dépense est liée à un remboursement. Sa suppression est impossible.",
                                          );

                                          return;
                                        }

                                        setExpenseToDelete(expense);
                                      }}
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
                                  </div>
                                </div>

                                <strong className="expense-amount">
                                  {formatCurrency(
                                    displayedAmount,
                                    expenseCurrency,
                                  )}
                                </strong>

                                <div className="expense-participants-wrapper">
                                  <span className="expense-participants">
                                    👥 {expense.participants?.length || 0}{" "}
                                    participant
                                    {(expense.participants?.length || 0) > 1
                                      ? "s"
                                      : ""}
                                  </span>

                                  {expense.participants &&
                                    expense.participants.length > 0 && (
                                      <span className="expense-participants-tooltip">
                                        {expense.participants
                                          .map(
                                            (participant) =>
                                              participant.firstname,
                                          )
                                          .join(" • ")}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>

                            {expense.participants &&
                              expense.participants.length > 0 &&
                              currentUserId && (
                                <>
                                  <div className="expense-divider" />

                                  <div className="expense-debt">
                                    {expense.paid_by === currentUserId ? (
                                      <div className="debt-positive">
                                        <p>💰 On te doit :</p>

                                        {expense.participants
                                          .filter(
                                            (share) =>
                                              share.user_id !== currentUserId,
                                          )
                                          .map((share) => (
                                            <div key={share.user_id}>
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
                                        {expense.participants
                                          .filter(
                                            (share) =>
                                              share.user_id === currentUserId,
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
                ))
              )}
            </section>
          </>
        )}

        <Modal isOpen={isModalOpen} onClose={handleCloseExpenseModal}>
          <AddExpenseForm
            tripId={tripId}
            members={members}
            categories={categories}
            localCurrency={trip?.local_currency || "EUR"}
            preferredCurrency={userPreferences.default_currency}
            token={token}
            expenseToEdit={expenseToEdit}
            onExpenseAdded={handleExpenseAdded}
          />
        </Modal>

        {expenseToDelete && (
          <div className="expense-delete-backdrop">
            <dialog
              open
              className="expense-delete-dialog"
              aria-labelledby="delete-expense-title"
            >
              <h4 id="delete-expense-title">Supprimer cette dépense ?</h4>

              <p>
                Voulez-vous vraiment supprimer la dépense{" "}
                <strong>{expenseToDelete.title}</strong> ?
              </p>

              <div className="expense-delete-actions">
                <button
                  type="button"
                  className="expense-delete-cancel"
                  onClick={() => setExpenseToDelete(null)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="expense-delete-confirm"
                  onClick={handleDeleteExpense}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Suppression..." : "Confirmer la suppression"}
                </button>
              </div>
            </dialog>
          </div>
        )}

        {participantToReimburse && (
          <PaymentDetailsModal
            tripId={tripId}
            participant={{
              userId: participantToReimburse.userId,
              firstname: participantToReimburse.firstname,
              amount: Math.abs(participantToReimburse.netBalance),
            }}
            currency={displayCurrency}
            token={token}
            onClose={() => setParticipantToReimburse(null)}
            onReimbursementDeclared={refreshBudget}
          />
        )}
      </main>
    </>
  );
}

export default TripBudgetPage;
