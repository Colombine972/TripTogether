import {
  Building2,
  CreditCard,
  Phone,
  Save,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/Account.css";

type PaymentMethod = "wero" | "bank_transfer" | "";

type PaymentPreferences = {
  preferred_method: PaymentMethod;
  wero_phone: string;
  iban: string;
  iban_holder_name: string;
};

type PaymentPreferencesApiResponse = {
  preferred_method: "wero" | "bank_transfer" | null;
  wero_phone: string | null;
  iban: string | null;
  iban_holder_name: string | null;
};

const INITIAL_PAYMENT_PREFERENCES: PaymentPreferences = {
  preferred_method: "",
  wero_phone: "",
  iban: "",
  iban_holder_name: "",
};

export default function PaymentPreferencesCard() {
  const { auth } = useAuth();

  const [paymentPreferences, setPaymentPreferences] =
    useState<PaymentPreferences>(INITIAL_PAYMENT_PREFERENCES);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPaymentPreferences = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/payment-preferences`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          },
        );

        const data: PaymentPreferencesApiResponse | { error?: string } =
          await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Erreur lors du chargement des moyens de remboursement.",
          );
        }

        const preferences = data as PaymentPreferencesApiResponse;

        setPaymentPreferences({
          preferred_method: preferences.preferred_method ?? "",
          wero_phone: preferences.wero_phone ?? "",
          iban: preferences.iban ?? "",
          iban_holder_name: preferences.iban_holder_name ?? "",
        });
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des moyens de remboursement.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchPaymentPreferences();
    } else {
      setLoading(false);
    }
  }, [auth?.token]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setPaymentPreferences((currentPreferences) => ({
      ...currentPreferences,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (
      paymentPreferences.preferred_method === "wero" &&
      !paymentPreferences.wero_phone.trim()
    ) {
      return "Renseigne le numéro de téléphone associé à Wero.";
    }

    if (
      paymentPreferences.preferred_method === "bank_transfer" &&
      !paymentPreferences.iban.trim()
    ) {
      return "Renseigne ton IBAN pour utiliser le virement bancaire.";
    }

    if (
      paymentPreferences.preferred_method === "bank_transfer" &&
      !paymentPreferences.iban_holder_name.trim()
    ) {
      return "Renseigne le nom du titulaire du compte bancaire.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!auth?.token) {
      toast.error("Tu dois être connectée pour enregistrer ces informations.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/payment-preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            preferred_method:
              paymentPreferences.preferred_method || null,
            wero_phone:
              paymentPreferences.wero_phone.trim() || null,
            iban: paymentPreferences.iban.trim() || null,
            iban_holder_name:
              paymentPreferences.iban_holder_name.trim() || null,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Erreur lors de l’enregistrement des moyens de remboursement.",
        );
      }

      const savedPreferences:
        | PaymentPreferencesApiResponse
        | undefined = data?.paymentPreference;

      if (savedPreferences) {
        setPaymentPreferences({
          preferred_method:
            savedPreferences.preferred_method ?? "",
          wero_phone: savedPreferences.wero_phone ?? "",
          iban: savedPreferences.iban ?? "",
          iban_holder_name:
            savedPreferences.iban_holder_name ?? "",
        });
      }

      toast.success("Moyens de remboursement enregistrés.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l’enregistrement des moyens de remboursement.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <form
      className="payment-preferences-form"
      onSubmit={handleSubmit}
    >
      <p className="payment-preferences-description">
        Ces informations permettront aux autres participants de te
        rembourser plus facilement.
      </p>

      <div className="payment-form-group">
        <label htmlFor="preferred_method">
          <span className="payment-label-icon">
            <WalletCards size={20} />
          </span>

          Moyen de remboursement préféré
        </label>

        <select
          id="preferred_method"
          name="preferred_method"
          value={paymentPreferences.preferred_method}
          onChange={handleChange}
          className="payment-preference-input"
        >
          <option value="">Aucun moyen préféré</option>
          <option value="wero">Wero</option>
          <option value="bank_transfer">
            Virement bancaire
          </option>
        </select>
      </div>

      <div className="payment-form-group">
        <label htmlFor="wero_phone">
          <span className="payment-label-icon">
            <Phone size={20} />
          </span>

          Numéro associé à Wero
        </label>

        <input
          id="wero_phone"
          name="wero_phone"
          type="tel"
          value={paymentPreferences.wero_phone}
          onChange={handleChange}
          placeholder="Ex. : 06 12 34 56 78"
          autoComplete="tel"
          className="payment-preference-input"
        />

        <p className="payment-field-help">
          Le numéro utilisé pour recevoir un remboursement avec Wero.
        </p>
      </div>

      <div className="payment-form-group">
        <label htmlFor="iban">
          <span className="payment-label-icon">
            <CreditCard size={20} />
          </span>

          IBAN
        </label>

        <input
          id="iban"
          name="iban"
          type="text"
          value={paymentPreferences.iban}
          onChange={handleChange}
          placeholder="Ex. : FR76 1234 5678 9012 3456 7890 123"
          autoComplete="off"
          spellCheck={false}
          className="payment-preference-input payment-iban-input"
        />

        <p className="payment-field-help">
          L’IBAN sera utilisé pour proposer un remboursement par
          virement.
        </p>
      </div>

      <div className="payment-form-group">
        <label htmlFor="iban_holder_name">
          <span className="payment-label-icon">
            <UserRound size={20} />
          </span>

          Nom du titulaire
        </label>

        <input
          id="iban_holder_name"
          name="iban_holder_name"
          type="text"
          value={paymentPreferences.iban_holder_name}
          onChange={handleChange}
          placeholder="Ex. : Cindy Colombine"
          autoComplete="name"
          className="payment-preference-input"
        />
      </div>

      <div className="payment-security-note">
        <Building2 size={20} />

        <p>
          Ces informations ne seront affichées qu’aux participants
          concernés par un remboursement.
        </p>
      </div>

      <button
        type="submit"
        className="payment-preference-save-btn"
        disabled={saving}
      >
        <Save size={20} />

        {saving
          ? "Enregistrement..."
          : "Enregistrer mes moyens de remboursement"}
      </button>
    </form>
  );
}