import type { Guest } from "../types/invitationType";
import "../pages/styles/Guests.css";

type GuestsProps =
  | {
      title: string;
      invited: Guest[];
      type: "attendees";
      delete?: (invitation: Guest) => void;
    }
  | {
      title: string;
      invited: Guest[];
      type: "others";
      delete?: (invitation: Guest) => void;
    };

function Guests(props: GuestsProps) {
  const { title, invited } = props;

  return (
    <article className="guests-card">
      {/* =====================================================
          TITRE
          ===================================================== */}

      <h3 className="guests-title">
        {title} ({invited.length})
      </h3>

      {/* =====================================================
          LISTE DES MEMBRES
          ===================================================== */}

      <ul>
        {invited.map((invitation) => (
          <li
            key={invitation.id}
            className="guest-row"
            data-notification-ref={`participant-${invitation.id}`}
          >
            {/* =================================================
                PARTIE GAUCHE
                ================================================= */}

            <div className="guest-left-side">
              <div className="guest-avatar">
                <img
                  src={invitation.avatarUrl || "/images/utilisateur.png"}
                  alt={`Avatar de ${invitation.name}`}
                  onError={(event) => {
                    event.currentTarget.src = "/images/utilisateur.png";
                  }}
                />
              </div>

              <div className="guest-infos">
                <p className="guest-name">{invitation.name}</p>

                {invitation.addedAt && (
                  <p className="guest-date">
                    Ajouté le{" "}
                    {new Date(invitation.addedAt).toLocaleDateString("fr-FR")}
                  </p>
                )}

                {invitation.lastReminderAt && (
                  <p className="guest-date guest-date-small">
                    Relancé le{" "}
                    {new Date(invitation.lastReminderAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* =================================================
                PARTIE DROITE
                ================================================= */}

            <div className="guest-right-side">
              {props.type === "attendees" ? (
                invitation.role === "organisateur" ? (
                  <span className="guest-badge guest-badge-organisateur">
                    Organisateur
                  </span>
                ) : (
                  <button
                    type="button"
                    className="guest-badge guest-badge-accepted"
                    onClick={() => props.delete?.(invitation)}
                  >
                    Retirer
                  </button>
                )
              ) : invitation.inviteState === "refuse" ? (
                <span className="guest-badge guest-badge-refuse">Refusé</span>
              ) : (
                <span className="guest-badge guest-badge-pending">
                  En attente
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default Guests;
