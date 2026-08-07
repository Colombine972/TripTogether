import { Check, Clock3, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import type { Reimbursement } from "../types/reimbursement";

type PendingReimbursementsProps = {
  reimbursements: Reimbursement[];
  currentUserId: number;
  token: string;
  onUpdated: () => Promise<void> | void;
};

export default function PendingReimbursements({
  reimbursements,
  currentUserId,
  token,
  onUpdated,
}: PendingReimbursementsProps) {
  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const pendingReceived =
    reimbursements.filter(
      (reimbursement) =>
        reimbursement.status === "pending" &&
        Number(
          reimbursement.to_user_id,
        ) === currentUserId,
    );

  if (pendingReceived.length === 0) {
    return null;
  }

  const updateStatus = async (
    reimbursementId: number,
    action: "confirm" | "reject",
  ) => {
    setProcessingId(
      reimbursementId,
    );

    try {
      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/reimbursements/${reimbursementId}/${action}`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de mettre à jour le remboursement.",
        );
      }

      toast.success(
        action === "confirm"
          ? "Remboursement confirmé."
          : "Remboursement signalé comme non reçu.",
      );

      await onUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour le remboursement.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (
    amount: number | string,
    currency: string,
  ) =>
    new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency,
      },
    ).format(
      Number(amount),
    );

  return (
    <section className="pending-reimbursements">
      <div className="pending-reimbursements-header">
        <div className="pending-reimbursements-icon">
          <Clock3 size={20} />
        </div>

        <div>
          <h3>
            Remboursements à confirmer
          </h3>

          <p>
            Vérifiez votre application bancaire avant de confirmer la réception.
          </p>
        </div>
      </div>

      <div className="pending-reimbursements-list">
        {pendingReceived.map(
          (reimbursement) => (
            <article
              key={
                reimbursement.id
              }
              className="pending-reimbursement-card"
              data-notification-ref={`reimbursement-${reimbursement.id}`}
            >
              <div className="pending-reimbursement-person">
                <div className="pending-reimbursement-avatar">
                  {(
                    reimbursement.from_firstname ||
                    "P"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="pending-reimbursement-content">
                  <strong>
                    {reimbursement.from_firstname ||
                      "Un participant"}
                  </strong>

                  <p>
                    déclare vous avoir remboursé{" "}
                    <strong>
                      {formatCurrency(
                        reimbursement.amount,
                        reimbursement.currency,
                      )}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="pending-reimbursement-actions">
                <button
                  type="button"
                  className="reimbursement-reject-btn"
                  disabled={
                    processingId ===
                    reimbursement.id
                  }
                  onClick={() =>
                    updateStatus(
                      reimbursement.id,
                      "reject",
                    )
                  }
                >
                  <X size={18} />
                  Non reçu
                </button>

                <button
                  type="button"
                  className="reimbursement-confirm-btn"
                  disabled={
                    processingId ===
                    reimbursement.id
                  }
                  onClick={() =>
                    updateStatus(
                      reimbursement.id,
                      "confirm",
                    )
                  }
                >
                  <Check size={18} />
                  Confirmer la réception
                </button>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}