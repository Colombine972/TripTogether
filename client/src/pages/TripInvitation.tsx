import {
  CalendarDays,
  CircleDollarSign,
  Mail,
  MapPin,
  Plus,
  Send,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import "./styles/TripInvitation.css";

type InvitationForm = {
  email: string;
  message: string;
};

type TripInvitationProps = {
  tripId: number;
  title: string;
  city: string;
  country: string;
  countryCode?: string;
  placeId?: string | null;
  currency?: string;
  startAt: string;
  endAt: string;
  participants?: number;
  onClose?: (e: React.MouseEvent) => void;
};

function TripInvitation({
  tripId,
  title,
  city,
  country,
  countryCode,
  placeId,
  currency = "EUR",
  startAt,
  endAt,
  participants,
  onClose,
}: TripInvitationProps) {
  const [invitationForm, setInvitationForm] = useState<InvitationForm>({
    email: "",
    message: "",
  });

  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* =======================================================
     FORMAT DATE
  ======================================================= */

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

  /* =======================================================
     DEVISE
  ======================================================= */

  const getCurrencyName = (currencyCode: string) => {
    try {
      const displayNames = new Intl.DisplayNames(["fr-FR"], {
        type: "currency",
      });

      return displayNames.of(currencyCode) ?? currencyCode;
    } catch {
      return currencyCode;
    }
  };

  /* =======================================================
     PHOTO GOOGLE PLACES
  ======================================================= */

  const tripPhotoUrl = placeId
    ? `${import.meta.env.VITE_API_URL}/api/places/photo/${placeId}`
    : null;

  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const updateInvitationForm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setInvitationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     AJOUTER UN EMAIL
  ======================================================= */

  const addEmail = () => {
    const email = invitationForm.email.trim().toLowerCase();

    if (!email) {
      toast.error("Veuillez renseigner une adresse email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Veuillez renseigner une adresse email valide");
      return;
    }

    if (emails.includes(email)) {
      toast.warning("Cette adresse email a déjà été ajoutée");
      return;
    }

    setEmails((prev) => [...prev, email]);

    setInvitationForm((prev) => ({
      ...prev,
      email: "",
    }));
  };

  /* =======================================================
     ENTRÉE CLAVIER
  ======================================================= */

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  /* =======================================================
     SUPPRIMER UN EMAIL
  ======================================================= */

  const removeEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  /* =======================================================
     ANNULER
  ======================================================= */

  const cancelInvitation = (e: React.MouseEvent) => {
    setInvitationForm({
      email: "",
      message: "",
    });

    setEmails([]);

    if (onClose) {
      onClose(e);
    }
  };


  /* =======================================================
     COPIER LIEN
  ======================================================= */

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error(
        "Impossible de copier automatiquement le lien d'invitation",
      );
    }
  };

  /* =======================================================
     ENVOYER LES INVITATIONS
  ======================================================= */

  const sendInvitations = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emails.length === 0) {
      toast.error("Ajoutez au moins une adresse email");
      return;
    }

    const message = invitationForm.message.trim();

    setLoading(true);

    try {
      /*
       * Pour rester compatible avec ton endpoint actuel,
       * on envoie une requête par adresse email.
       *
       * On pourra ensuite optimiser le backend avec
       * un véritable endpoint multi-invitations.
       */

      const results = await Promise.allSettled(
        emails.map(async (email) => {
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
            throw new Error(
              data.error || `Erreur lors de l'invitation de ${email}`,
            );
          }

          if (data.invitationLink) {
            await copyToClipboard(data.invitationLink);
          }

          return {
            email,
            emailSent: data.emailSent,
          };
        }),
      );

      const successfulInvitations = results.filter(
        (result) => result.status === "fulfilled",
      ).length;

      const failedInvitations = results.length - successfulInvitations;

      if (successfulInvitations > 0) {
        toast.success(
          successfulInvitations > 1
            ? `${successfulInvitations} invitations envoyées ✈️`
            : "Invitation envoyée par email ✈️",
        );
      }

      if (failedInvitations > 0) {
        toast.warning(
          `${failedInvitations} invitation${
            failedInvitations > 1 ? "s" : ""
          } n'ont pas pu être envoyée${failedInvitations > 1 ? "s" : ""}`,
        );
      }

      if (failedInvitations === 0) {
        setEmails([]);

        setInvitationForm({
          email: "",
          message: "",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi des invitations";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tripinvitation-overlay">
      <article className="tripinvitation-modal">
        {/* =================================================
            HEADER
        ================================================== */}

        <header className="tripinvitation-header">
          <div className="tripinvitation-header-content">
            <div className="tripinvitation-header-icon">
              <UserRoundPlus size={22} />
            </div>

            <div>
              <h2>Inviter des voyageurs</h2>

              <p>
                Ajoutez des personnes à votre voyage. Elles recevront une
                invitation par email.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              className="tripinvitation-close"
              onClick={onClose}
              aria-label="Fermer la fenêtre"
              disabled={loading}
            >
              <X size={20} />
            </button>
          )}
        </header>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="tripinvitation-content">
          {/* ===============================================
              COLONNE GAUCHE
          ================================================ */}

          <aside className="tripinvitation-trip-column">
            <div className="tripinvitation-image">
              {tripPhotoUrl ? (
                <img
                  src={tripPhotoUrl}
                  alt={`${city}, ${country}`}
                  className="tripinvitation-image-photo"
                />
              ) : (
                <div className="tripinvitation-image-placeholder">
                  <MapPin size={30} />
                </div>
              )}

              <div className="tripinvitation-image-overlay" />

              <div className="tripinvitation-location-badge">
                <MapPin size={15} />

                <span>
                  {city}, {country}
                </span>
              </div>
            </div>

            <div className="tripinvitation-trip-heading">
              <div className="tripinvitation-title-row">
                <h3>{title}</h3>

                {countryCode && (
                  <img
                    src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
                    alt={`Drapeau ${country}`}
                    title={country}
                    className="tripinvitation-country-flag"
                  />
                )}
              </div>
            </div>

            <div className="tripinvitation-trip-details">
              <div className="tripinvitation-detail">
                <div className="tripinvitation-detail-icon">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <span className="tripinvitation-detail-label">
                    Dates du voyage
                  </span>

                  <span className="tripinvitation-detail-value">
                    {formatDate(startAt)}

                    <span className="tripinvitation-date-separator">→</span>

                    {formatDate(endAt)}
                  </span>
                </div>
              </div>

              <div className="tripinvitation-detail">
                <div className="tripinvitation-detail-icon">
                  <Users size={18} />
                </div>

                <div>
                  <span className="tripinvitation-detail-label">
                    Participants
                  </span>

                  <span className="tripinvitation-detail-value">
                    {participants ?? 0}{" "}
                    {(participants ?? 0) > 1 ? "participants" : "participant"}
                  </span>
                </div>
              </div>

              <div className="tripinvitation-detail">
                <div className="tripinvitation-detail-icon">
                  <CircleDollarSign size={18} />
                </div>

                <div>
                  <span className="tripinvitation-detail-label">Devise</span>

                  <span className="tripinvitation-detail-value">
                    {getCurrencyName(currency)} ({currency})
                  </span>
                </div>
              </div>
            </div>

            <div className="tripinvitation-info-box">
              <UserRoundPlus size={18} />

              <p>
                Vos invités pourront rejoindre le voyage, proposer des étapes,
                participer aux votes et ajouter des dépenses.
              </p>
            </div>
          </aside>

          {/* ===============================================
              COLONNE DROITE
          ================================================ */}

          <form onSubmit={sendInvitations} className="tripinvitation-form">
            {/* =============================================
                AJOUT EMAIL
            ============================================== */}

            <section className="tripinvitation-email-section">
              <div className="tripinvitation-section-heading">
                <h3>Inviter par email</h3>

                <p>
                  Ajoutez les personnes que vous souhaitez inviter au voyage.
                </p>
              </div>

              <div className="tripinvitation-add-email-row">
                <div className="tripinvitation-input-wrapper">
                  <Mail size={19} />

                  <input
                    type="email"
                    name="email"
                    value={invitationForm.email}
                    onChange={updateInvitationForm}
                    onKeyDown={handleEmailKeyDown}
                    autoComplete="email"
                    placeholder="nom@exemple.com"
                    disabled={loading}
                  />
                </div>

                <button
                  type="button"
                  className="tripinvitation-add-email-button"
                  onClick={addEmail}
                  disabled={loading}
                  aria-label="Ajouter l'adresse email"
                >
                  <Plus size={24} />
                </button>
              </div>
            </section>

            {/* =============================================
                INVITÉS À ENVOYER
            ============================================== */}

            <section className="tripinvitation-guests-section">
              <div className="tripinvitation-guests-heading">
                <h3>
                  Invités à envoyer
                  <span>({emails.length})</span>
                </h3>
              </div>

              <div
                className={`tripinvitation-guests-box ${
                  emails.length === 0 ? "tripinvitation-guests-box-empty" : ""
                }`}
              >
                {emails.length === 0 ? (
                  <div className="tripinvitation-guests-empty">
                    <div className="tripinvitation-guests-empty-icon">
                      <Users size={26} />
                    </div>

                    <strong>Aucun invité pour le moment</strong>

                    <p>
                      Ajoutez une adresse email pour préparer une invitation.
                    </p>
                  </div>
                ) : (
                  <div className="tripinvitation-email-list">
                    {emails.map((email) => (
                      <div className="tripinvitation-email-item" key={email}>
                        <div className="tripinvitation-email-item-content">
                          <div className="tripinvitation-email-item-icon">
                            <Mail size={16} />
                          </div>

                          <span>{email}</span>
                        </div>

                        <button
                          type="button"
                          className="tripinvitation-remove-email"
                          onClick={() => removeEmail(email)}
                          disabled={loading}
                          aria-label={`Retirer ${email}`}
                        >
                          <X size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* =============================================
                MESSAGE
            ============================================== */}

            <section className="tripinvitation-message-section">
              <div className="tripinvitation-message-heading">
                <div>
                  <h3>Petit message</h3>

                  <p>Ce message sera envoyé à tous les invités.</p>
                </div>

                <span className="tripinvitation-optional">Facultatif</span>
              </div>

              <div className="tripinvitation-textarea-wrapper">
                <textarea
                  name="message"
                  value={invitationForm.message}
                  onChange={updateInvitationForm}
                  maxLength={500}
                  rows={4}
                  placeholder="Ça serait super que tu viennes avec nous !"
                  disabled={loading}
                />

                <span className="tripinvitation-counter">
                  {invitationForm.message.length}/500
                </span>
              </div>
            </section>

            {/* =============================================
                ACTIONS
            ============================================== */}

            <div className="tripinvitation-actions">
              <button
                type="button"
                className="tripinvitation-btn-cancel"
                onClick={cancelInvitation}
                disabled={loading}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="tripinvitation-btn-send"
                disabled={loading || emails.length === 0}
              >
                <Send size={18} />

                {loading
                  ? "Envoi en cours..."
                  : emails.length > 1
                    ? "Envoyer les invitations"
                    : "Envoyer l'invitation"}
              </button>
            </div>
          </form>
        </div>
      </article>
    </section>
  );
}

export default TripInvitation;
