import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetSummary from "../components/BudgetSummary";
import Modal from "../components/Modal";
import NavTabs from "../components/NavTabs";
import TripInfos from "../components/TripInfos";
import "../pages/styles/TripBugdetPage.css";
import { useAuth } from "../contexts/AuthContext";
import type { TheTrip } from "../types/tripType";

type BudgetSummaryData = {
  total: number;
  paid: number;
  balance: number;
};

type ExpenseShare = {
  user_id: number;
  firstname: string;
  share_amount: number;
};

type Expense = {
  id: number;
  title: string;
  amount: number;
  paid_by: number;
  category_id: number;
  date: string;
  category_name?: string;
  paid_by_name?: string;
  shares?: ExpenseShare[];
};

type Member = {
  id: number;
  firstname?: string;
  email?: string;
};

function TripBudgetPage() {
  const { id } = useParams();
  const tripId = Number(id);

  const [summary, setSummary] = useState<BudgetSummaryData>({
    total: 0,
    paid: 0,
    balance: 0,
  });

  const { auth } = useAuth();
  const currentUserId = auth?.user?.id;

  const [trip, setTrip] = useState<TheTrip | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getTrip = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
      );

      if (!response.ok) {
        throw new Error("Erreur chargement voyage");
      }

      const data = await response.json();

      setTrip(data); //
    } catch (error) {
      toast.error("Erreur chargement voyage");
    }
  }, [tripId]);

  const getMembers = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/members`,
      );

      if (!response.ok) {
        throw new Error("Erreur chargement participants");
      }

      const data = await response.json();
      console.log("MEMBERS DATA:", data);
      setMembers(data);
    } catch (error) {
      toast.error("Erreur chargement participants");
    }
  }, [tripId]);

  const getExpenses = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}`,
      );

      if (!response.ok) {
        throw new Error("Erreur chargement dépenses");
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      toast.error("Erreur chargement dépenses");
    }
  }, [tripId]);

  const getSummary = useCallback(async () => {
    if (!auth?.token) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}/summary`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      },
    );

    if (!response.ok) {
      console.error("Erreur summary");
      return;
    }

    const data = await response.json();
    setSummary(data);
  }, [tripId, auth]);

  useEffect(() => {
    if (!tripId) return;
    getTrip();
    getMembers();
    getExpenses();
    getSummary();
  }, [tripId, getTrip, getMembers, getExpenses, getSummary]);

  const groupedExpenses: Record<string, Expense[]> = {};

  for (const expense of expenses) {
    const category = expense.category_name || "Autre";
    if (!groupedExpenses[category]) {
      groupedExpenses[category] = [];
    }
    groupedExpenses[category].push(expense);
  }

  const handleDeleteExpense = async () => {
    if (!expenseToDelete || !auth?.token) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${expenseToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur suppression");
      }

      setExpenseToDelete(null);
      getExpenses();
      getSummary();
    } catch (error) {
      toast.error("Erreur suppression dépense");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {trip && <TripInfos trip={trip} />}
      <main className="page-membre trip-budget-page">
        <NavTabs />

        <BudgetSummary
          total={summary.total}
          paid={summary.paid}
          balance={summary.balance}
        />

        <section className="expenses-section">
          <div className="expenses-header">
            <h2>Dépenses ({expenses.length})</h2>

            <button
              type="button"
              className="add-expense-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + Ajouter
            </button>
          </div>

          {Object.entries(groupedExpenses).map(([category, items]) => (
            <div key={category} className="category-block">
              <h3 className="category-title">{category}</h3>

              {items.map((expense) => (
                <div key={expense.id} className="expense-card">
                  <div className="expense-header-row">
                    <div className="expense-left">
                      <div className="expense-icon">$</div>

                      <div>
                        <h4 className="expense-description">{expense.title}</h4>
                        <p className="expense-paid">
                          Payé par {expense.paid_by_name}
                        </p>
                      </div>
                    </div>

                    <div className="expense-right">
                      <button
                        type="button"
                        className="delete-expense-btn"
                        onClick={() => setExpenseToDelete(expense)}
                        aria-label="Supprimer la dépense"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="trash-icon"
                        >
                          <title>Poubelle</title>
                          <path
                            fillRule="evenodd"
                            d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.536 4.569a.75.75 0 0 0-1.44.32l.5 10a.75.75 0 0 0 1.498-.06l-.558-10.26Zm4.5 0a.75.75 0 0 0-1.5 0v10.26a.75.75 0 0 0 1.5 0v-10.26Zm3.536.26a.75.75 0 0 0-1.44-.32l-.558 10.26a.75.75 0 0 0 1.498.06l.5-10Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      <strong>{Number(expense.amount).toFixed(2)} €</strong>

                      <span>{members.length} Participants</span>
                    </div>
                  </div>

                  <div className="expense-divider" />

                  {expense.shares && currentUserId && (
                    <div className="expense-debt">
                      {expense.paid_by === currentUserId ? (
                        <div className="debt-positive">
                          <p>💰 On te doit :</p>

                          {expense.shares
                            .filter((share) => share.user_id !== currentUserId)
                            .map((share) => (
                              <div key={share.user_id}>
                                {share.firstname} te doit{" "}
                                <strong>
                                  {Number(share.share_amount).toFixed(2)} €
                                </strong>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="debt-negative">
                          {expense.shares
                            .filter((share) => share.user_id === currentUserId)
                            .map((share) => (
                              <p key={share.user_id}>
                                ⚠ Tu dois{" "}
                                <strong>
                                  {Number(share.share_amount).toFixed(2)} €
                                </strong>{" "}
                                à {expense.paid_by_name}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </section>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <AddExpenseForm
            tripId={tripId}
            members={members}
            onSuccess={() => {
              setIsModalOpen(false);
              getExpenses();
              getSummary();
            }}
          />
        </Modal>

        {expenseToDelete && (
          <div className="modal-backdrop">
            <div className="modal">
              <h4>Supprimer cette dépense ?</h4>

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
                  {isDeleting ? "Suppression..." : "Confirmer"}
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
