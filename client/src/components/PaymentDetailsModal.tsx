import {
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Info,
  Phone,
  ShieldCheck,
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

type ParticipantToReimburse = {
  userId: number;
  firstname: string;
  amount: number;
};

type PaymentDetailsModalProps = {
  tripId: number;
  participant: ParticipantToReimburse;
  currency: string;
  token: string;
  onClose: () => void;
  onReimbursementDeclared: () => Promise<void> | void;
};

export default function PaymentDetailsModal({
  tripId,
  participant,
  currency,
  token,
  onClose,
  onReimbursementDeclared,
}: PaymentDetailsModalProps) {
  const [paymentPreference, setPaymentPreference] =
    useState<PaymentPreference | null>(null);

  const [loading, setLoading] = useState(true);
  const [showIban, setShowIban] = useState(false);

  const [isDeclaring, setIsDeclaring] = useState(false);

  const [copiedField, setCopiedField] = useState<"wero" | "iban" | null>(null);

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
          data?.paymentPreference ?? data?.payment_preference ?? data;

        setPaymentPreference({
          preferred_method: preference?.preferred_method ?? null,
          wero_phone: preference?.wero_phone ?? null,
          iban: preference?.iban ?? null,
          iban_holder_name: preference?.iban_holder_name ?? null,
        });
      } catch (error) {
        console.error("Erreur fetchPaymentPreference :", error);

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
    const safeCurrency = (currency || "EUR").toUpperCase();

    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: safeCurrency,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${safeCurrency}`;
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

  const copyValue = async (value: string, field: "wero" | "iban") => {
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

  const handleDeclareReimbursement = async () => {
    if (!token) {
      toast.error("Session invalide. Merci de vous reconnecter.");
      return;
    }

    setIsDeclaring(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reimbursements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trip_id: tripId,
            to_user_id: participant.userId,
            amount: participant.amount,
            currency,
            payment_method: paymentPreference?.preferred_method || null,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Impossible de déclarer le remboursement.",
        );
      }

      toast.success(
        `${participant.firstname} doit maintenant confirmer la réception du remboursement.`,
      );

      await onReimbursementDeclared();
      onClose();
    } catch (error) {
      console.error("Erreur handleDeclareReimbursement :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de déclarer le remboursement.",
      );
    } finally {
      setIsDeclaring(false);
    }
  };

  const hasWero = Boolean(paymentPreference?.wero_phone);
  const hasBankTransfer = Boolean(paymentPreference?.iban);
  const hasPaymentMethod = hasWero || hasBankTransfer;

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
          aria-label="Fermer la fenêtre"
        >
          <X size={24} />
        </button>

        <header className="payment-modal-header">
          <div className="payment-modal-title-icon">
            <WalletCards size={31} />
          </div>

          <div>
            <h3 id="payment-details-title">
              Rembourser {participant.firstname}
            </h3>

            <p>Montant à rembourser</p>

            <strong className="payment-modal-amount">
              {formatCurrency(participant.amount)}
            </strong>
          </div>
        </header>

        <section className="payment-instructions">
          <Info size={28} />

          <div>
            <h4>Effectuer le remboursement</h4>

            <p className="payment-instructions-desktop">
              TripTogether calcule les sommes dues, mais ne réalise pas le
              transfert d’argent. Copiez les informations ci-dessous, puis
              effectuez le paiement depuis <strong>Wero</strong> ou votre{" "}
              <strong>application bancaire</strong>.
            </p>

            <p className="payment-instructions-mobile">
              Le remboursement s’effectue depuis <strong>Wero</strong> ou votre{" "}
              <strong>application bancaire</strong>. TripTogether vous aide à
              retrouver les coordonnées du bénéficiaire et à suivre le
              remboursement.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="payment-modal-loading">
            <p>Chargement des moyens de remboursement...</p>
          </div>
        ) : !hasPaymentMethod ? (
          <div className="payment-method-empty">
            <p>
              {participant.firstname} n’a pas encore renseigné de moyen de
              remboursement.
            </p>
          </div>
        ) : (
          <div className="payment-methods-list">
            {hasWero && (
              <section
                className={`payment-method-block ${
                  paymentPreference?.preferred_method === "wero"
                    ? "preferred"
                    : ""
                }`}
              >
                <div className="payment-method-top-row">
                  <div className="payment-method-title">
                    <Phone size={22} />

                    <div>
                      <div className="payment-method-label-row">
                        <h4>Wero</h4>

                        {paymentPreference?.preferred_method === "wero" && (
                          <span className="preferred-payment-badge">
                            Moyen préféré
                          </span>
                        )}
                      </div>

                      <p>Numéro associé au compte Wero</p>
                    </div>
                  </div>
                </div>

                <div className="payment-value-row">
                  <strong className="payment-wero-value">
                    {paymentPreference?.wero_phone}
                  </strong>

                  <button
                    type="button"
                    className="payment-copy-btn"
                    onClick={() =>
                      copyValue(paymentPreference?.wero_phone || "", "wero")
                    }
                  >
                    {copiedField === "wero" ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}

                    {copiedField === "wero" ? "Copié" : "Copier"}
                  </button>
                </div>
              </section>
            )}

            {hasWero && hasBankTransfer && (
              <div className="payment-method-divider">
                <span>ou</span>
              </div>
            )}

            {hasBankTransfer && (
              <section
                className={`payment-method-block ${
                  paymentPreference?.preferred_method === "bank_transfer"
                    ? "preferred"
                    : ""
                }`}
              >
                <div className="payment-method-title">
                  <CreditCard size={22} />

                  <div>
                    <div className="payment-method-label-row">
                      <h4>Virement bancaire</h4>

                      {paymentPreference?.preferred_method ===
                        "bank_transfer" && (
                        <span className="preferred-payment-badge">
                          Moyen préféré
                        </span>
                      )}
                    </div>

                    {paymentPreference?.iban_holder_name && (
                      <p>Titulaire : {paymentPreference.iban_holder_name}</p>
                    )}
                  </div>
                </div>

                <div className="payment-bank-details">
                  <div className="payment-bank-iban">
                    <span>IBAN</span>

                    <strong>
                      {showIban
                        ? paymentPreference?.iban
                        : maskIban(paymentPreference?.iban || "")}
                    </strong>
                  </div>

                  <div className="payment-value-actions">
                    <button
                      type="button"
                      className="payment-show-btn"
                      onClick={() =>
                        setShowIban((currentValue) => !currentValue)
                      }
                    >
                      {showIban ? <EyeOff size={18} /> : <Eye size={18} />}

                      {showIban ? "Masquer" : "Afficher"}
                    </button>

                    <button
                      type="button"
                      className="payment-copy-btn"
                      onClick={() =>
                        copyValue(paymentPreference?.iban || "", "iban")
                      }
                    >
                      {copiedField === "iban" ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}

                      {copiedField === "iban" ? "Copié" : "Copier"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <section className="payment-declaration-section">
              <div className="payment-declaration-text">
                <BadgeCheck size={27} />

                <div>
                  <h4>Le paiement est terminé ?</h4>

                  <p>
                    Déclarez votre remboursement afin que le bénéficiaire puisse
                    le confirmer.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="payment-declaration-btn"
                onClick={handleDeclareReimbursement}
                disabled={isDeclaring}
              >
                <Check size={21} />

                {isDeclaring
                  ? "Déclaration..."
                  : "J’ai effectué le remboursement"}
              </button>
            </section>

            <section className="payment-disclaimer">
              <ShieldCheck size={27} />

              <p>
                Cette action ne réalise aucun transfert d’argent. Elle informe
                simplement <strong>{participant.firstname}</strong> que vous
                déclarez avoir effectué le remboursement.{" "}
                {participant.firstname} devra ensuite confirmer la réception des
                fonds.
              </p>
            </section>
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
