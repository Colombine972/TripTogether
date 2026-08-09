import { useState } from "react";
import { toast } from "react-toastify";

import "./styles/Invitation.css";
import "./styles/TripInvitation.css";

type InvitationForm = {
  email: string;
  message: string;
};

type TripInvitationProps = {
  tripId: number;
  title: string;
  description?: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  participants?: number;
  onClose?: (e: React.MouseEvent) => void;
};

function TripInvitation({
  tripId,
  title,
  description,
  city,
  country,
  startAt,
  endAt,
  participants,
  onClose,
}: TripInvitationProps) {
  const [invitationForm, setInvitationForm] = useState<InvitationForm>({
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "";
    }

    const datePart = dateString.slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) {
      return dateString;
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  };

  const updateInvitationForm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setInvitationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cancelInvitation = (e: React.MouseEvent) => {
    setInvitationForm({
      email: "",
      message: "",
    });

    if (onClose) {
      onClose(e);
    }
  };

  const closeModalOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose(e);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error(
        "Impossible de copier automatiquement le lien d'invitation",
      );
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = invitationForm.email.trim();
    const message = invitationForm.message.trim();

    if (!email) {
      toast.error("Veuillez renseigner une adresse email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            message: message || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi de l'invitation");
      }

      if (data.invitationLink) {
        await copyToClipboard(data.invitationLink);
      }

      if (data.emailSent) {
        toast.success("Invitation envoyée par email ✈️");
      } else {
        toast.warning("Invitation créée, mais l'email n'a pas pu être envoyé");
      }

      setInvitationForm({
        email: "",
        message: "",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'invitation";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="tripinvitation-invitation-form"
      onClick={closeModalOverlay}
      tabIndex={-1}
      onKeyDown={() => {}}
    >
      <article className="tripinvitation-head">
        <p>
          <img src="/letter-picture.png" alt="" width={50} />
          Invitez une personne à rejoindre ce voyage par email
        </p>
      </article>

      <article className="tripinvitation-bg-image" />

      <article className="tripinvitation-trip-infos">
        <p className="tripcard-location">
          {city}, {country}
        </p>

        <h2>{title}</h2>

        {description && (
          <p className="tripinvitation-description">{description}</p>
        )}

        <p className="tripcard-dates">
          {formatDate(startAt)} - {formatDate(endAt)}
        </p>

        <p className="tripcard-participants">
          {participants ?? 0} participant(s)
        </p>
      </article>

      <form onSubmit={sendInvitation} className="tripinvitation-form-inputs">
        <label className="tripinvitation-email-form">
          Adresse email*
          <input
            type="email"
            name="email"
            value={invitationForm.email}
            onChange={updateInvitationForm}
            required
            autoComplete="email"
            placeholder="exemple@email.com"
          />
        </label>

        <label className="tripinvitation-message-form">
          Petit message
          <textarea
            name="message"
            value={invitationForm.message}
            onChange={updateInvitationForm}
            maxLength={500}
            rows={4}
            placeholder="Ça serait super que tu viennes avec nous !"
          />
          <small>{invitationForm.message.length}/500</small>
        </label>

        <button
          type="submit"
          className="tripinvitation-btn-send-invitation"
          disabled={loading}
        >
          {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
        </button>

        <button
          type="button"
          className="tripinvitation-btn-cancel-invitation"
          onClick={cancelInvitation}
          disabled={loading}
        >
          Annuler
        </button>
      </form>
    </section>
  );
}

export default TripInvitation;
