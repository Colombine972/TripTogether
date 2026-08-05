import {
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Phone,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type PaymentMethod = "wero" | "bank_transfer" | null;

type PaymentPreference = {
  preferred_method: PaymentMethod;
  wero_phone: string | null;
  iban: string | null;
  iban_holder_name: string | null;
};

type Participant = {
  userId: number;
  firstname: string;
  amount: number;
};

type PaymentDetailsModalProps = {
  tripId: number;
  participant: Participant;
  currency: string;
  token: string;
  onClose: () => void;
};

export default function PaymentDetailsModal({
  tripId,
  participant,
  currency,
  token,
  onClose,
}: PaymentDetailsModalProps) {
  const [paymentPreference, setPaymentPreference] =
    useState<PaymentPreference | null>(null);

  const [loading, setLoading] = useState(true);
  const [showIban, setShowIban] = useState(false);
  const [copiedField, setCopiedField] = useState<
    "wero" | "iban" | null
  >(null);

  useEffect(() => {
    const fetchPaymentPreference = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/participants/${participant.userId}/payment-preferences`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Impossible de charger les moyens de remboursement.",
          );
        }

        const preference =
          data?.paymentPreference ??
          data?.payment_preference ??
          data;

        setPaymentPreference({
          preferred_method: preference?.preferred_method ?? null,
          wero_phone: preference?.wero_phone ?? null,
          iban: preference?.iban ?? null,
          iban_holder_name: preference?.iban_holder_name ?? null,
        });
      } catch (error) {
        console.error(
          "Erreur fetchPaymentPreference :",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de charger les moyens de remboursement.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentPreference();
  }, [participant.userId, tripId, token]);

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  const maskIban = (iban: string) => {
    const normalizedIban = iban.replace(/\s+/g, "");

    if (normalizedIban.length <= 8) {
      return normalizedIban;
    }

    const beginning = normalizedIban.slice(0, 4);
    const ending = normalizedIban.slice(-4);

    return `${beginning} •••• •••• •••• ${ending}`;
  };

  const copyValue = async (
    value: string,
    field: "wero" | "iban",
  ) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopiedField(field);
      toast.success("Information copiée.");

      window.setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error("Erreur copie :", error);
      toast.error("Impossible de copier cette information.");
    }
  };

  const hasWero = Boolean(paymentPreference?.wero_phone);
  const hasBankTransfer = Boolean(paymentPreference?.iban);

  return (
    <div
      className="payment-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <dialog
        open
        className="payment-details-dialog"
        aria-labelledby="payment-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="payment-modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={22} />
        </button>

        <div className="payment-modal-header">
          <WalletCards size={28} />

          <div>
            <h3 id="payment-details-title">
              Rembourser {participant.firstname}
            </h3>

            <p>
              Montant à rembourser :{" "}
              <strong>
                {formatCurrency(participant.amount)}
              </strong>
            </p>
          </div>
        </div>

        {loading ? (
          <p className="payment-modal-loading">
            Chargement des moyens de remboursement...
          </p>
        ) : !paymentPreference ||
          (!hasWero && !hasBankTransfer) ? (
          <div className="payment-method-empty">
            <p>
              {participant.firstname} n’a pas encore renseigné
              de moyen de remboursement.
            </p>
          </div>
        ) : (
          <div className="payment-methods-list">
            {paymentPreference.preferred_method && (
              <p className="preferred-payment-label">
                Moyen préféré :{" "}
                <strong>
                  {paymentPreference.preferred_method === "wero"
                    ? "Wero"
                    : "Virement bancaire"}
                </strong>
              </p>
            )}

            {hasWero && (
              <section
                className={`payment-method-block ${
                  paymentPreference.preferred_method === "wero"
                    ? "preferred"
                    : ""
                }`}
              >
                <div className="payment-method-heading">
                  <Phone size={22} />

                  <div>
                    <h4>Wero</h4>
                    <p>Numéro associé au compte Wero</p>
                  </div>
                </div>

                <div className="payment-value-row">
                  <span>{paymentPreference.wero_phone}</span>

                  <button
                    type="button"
                    className="payment-copy-btn"
                    onClick={() =>
                      copyValue(
                        paymentPreference.wero_phone || "",
                        "wero",
                      )
                    }
                  >
                    {copiedField === "wero" ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}

                    {copiedField === "wero"
                      ? "Copié"
                      : "Copier"}
                  </button>
                </div>
              </section>
            )}

            {hasBankTransfer && (
              <section
                className={`payment-method-block ${
                  paymentPreference.preferred_method ===
                  "bank_transfer"
                    ? "preferred"
                    : ""
                }`}
              >
                <div className="payment-method-heading">
                  <CreditCard size={22} />

                  <div>
                    <h4>Virement bancaire</h4>

                    {paymentPreference.iban_holder_name && (
                      <p>
                        Titulaire :{" "}
                        {paymentPreference.iban_holder_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="payment-value-row">
                  <span className="payment-iban-value">
                    {showIban
                      ? paymentPreference.iban
                      : maskIban(paymentPreference.iban || "")}
                  </span>

                  <div className="payment-value-actions">
                    <button
                      type="button"
                      className="payment-icon-btn"
                      onClick={() =>
                        setShowIban((currentValue) => !currentValue)
                      }
                      aria-label={
                        showIban
                          ? "Masquer l’IBAN"
                          : "Afficher l’IBAN"
                      }
                      title={
                        showIban
                          ? "Masquer l’IBAN"
                          : "Afficher l’IBAN"
                      }
                    >
                      {showIban ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                    <button
                      type="button"
                      className="payment-copy-btn"
                      onClick={() =>
                        copyValue(
                          paymentPreference.iban || "",
                          "iban",
                        )
                      }
                    >
                      {copiedField === "iban" ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}

                      {copiedField === "iban"
                        ? "Copié"
                        : "Copier"}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        <button
          type="button"
          className="payment-modal-close-bottom"
          onClick={onClose}
        >
          Fermer
        </button>
      </dialog>
    </div>
  );
}