import { CalendarDays, Coins, MapPin, UsersRound, Vote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";

import type { invitationType } from "../types/invitationType";
import type { TheTrip } from "../types/tripType";

import "./styles/invitation.css";

/* =========================================================
   TYPE - INVITATION PUBLIQUE
========================================================= */

type PublicInvitation = {
  publicToken: string;

  status: "pending" | "accepted" | "refused";

  hasAccount: boolean;

  trip: {
    id: number;
    title?: string | null;
    city?: string | null;
    country?: string | null;
    startAt?: string | null;
    endAt?: string | null;
    placeId?: string | null;
  };

  organizer: {
    firstname?: string | null;
    lastname?: string | null;
    avatarUrl?: string | null;
  };
};

/* =========================================================
   COMPOSANT
========================================================= */

function Invitation() {
  const { token, id, invitationId } = useParams<{
    token?: string;
    id?: string;
    invitationId?: string;
  }>();

  const navigate = useNavigate();

  const { auth } = useAuth();

  /* =========================================================
     STATES
  ========================================================= */

  const [invitation, setInvitation] = useState<invitationType | null>(null);

  const [publicInvitation, setPublicInvitation] =
    useState<PublicInvitation | null>(null);

  const [myTrip, setMyTrip] = useState<TheTrip | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  /* =========================================================
     CHEMIN DE L'INVITATION
  ========================================================= */

  const getInvitationPath = useCallback(() => {
    /*
     * Nouveau parcours.
     */

    if (token) {
      return `/invitation/${token}`;
    }

    /*
     * Ancien parcours.
     */

    if (id && invitationId) {
      return `/trip/${id}/invitation/${invitationId}`;
    }

    return "/";
  }, [token, id, invitationId]);

  /* =========================================================
     REDIRECTION LOGIN
  ========================================================= */

  const redirectToLogin = useCallback(
    (message?: string) => {
      if (message) {
        toast.error(message);
      }

      const invitationPath = getInvitationPath();

      navigate(`/login?redirect=${encodeURIComponent(invitationPath)}`);
    },
    [getInvitationPath, navigate],
  );

  /* =========================================================
     REDIRECTION REGISTER
  ========================================================= */

  const redirectToRegister = useCallback(() => {
    const invitationPath = getInvitationPath();

    navigate(`/register?redirect=${encodeURIComponent(invitationPath)}`);
  }, [getInvitationPath, navigate]);

  /* =========================================================
     CHARGER UN VOYAGE
  ========================================================= */

  const loadTrip = useCallback(
    async (tripId: number, authToken: string) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        if (response.status === 401) {
          redirectToLogin("Votre session a expiré. Veuillez vous reconnecter.");

          return;
        }

        if (!response.ok) {
          throw new Error("Erreur chargement voyage");
        }

        const data = await response.json();

        setMyTrip(data);
      } catch (error) {
        console.error("Erreur chargement voyage :", error);

        toast.error("Impossible de charger le voyage.");
      }
    },
    [redirectToLogin],
  );

  /* =========================================================
     CHARGEMENT DE L'INVITATION
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadInvitation = async () => {
      setLoading(true);

      setInvitation(null);

      setPublicInvitation(null);

      /* ===================================================
           NOUVEAU PARCOURS
           /invitation/:token
        =================================================== */

      if (token) {
        try {
          /* ===============================================
               UTILISATEUR CONNECTÉ
               → ENDPOINT PRIVÉ
            =============================================== */

          if (auth?.token) {
            const response = await fetch(
              `${
                import.meta.env.VITE_API_URL
              }/api/invitation/access/${encodeURIComponent(token)}`,
              {
                headers: {
                  Authorization: `Bearer ${auth.token}`,
                },
              },
            );

            const data = await response.json().catch(() => null);

            if (cancelled) {
              return;
            }

            /* =============================================
                 SESSION EXPIRÉE
              ============================================= */

            if (response.status === 401) {
              redirectToLogin(
                "Votre session a expiré. Veuillez vous reconnecter.",
              );

              return;
            }

            /* =============================================
                 MAUVAIS COMPTE
              ============================================= */

            if (response.status === 403) {
              toast.error(
                data?.error ||
                  "Cette invitation appartient à un autre utilisateur.",
              );

              navigate("/");

              return;
            }

            /* =============================================
                 INTROUVABLE
              ============================================= */

            if (response.status === 404) {
              toast.error(
                data?.error || data?.message || "Invitation introuvable.",
              );

              navigate("/");

              return;
            }

            /* =============================================
                 DÉJÀ ACCEPTÉE
              ============================================= */

            if (response.status === 409) {
              toast.info(
                data?.message || "Cette invitation a déjà été acceptée.",
              );

              if (data?.trip_id) {
                navigate(`/trip/${data.trip_id}`);
              } else {
                navigate("/");
              }

              return;
            }

            /* =============================================
                 REFUSÉE / EXPIRÉE
              ============================================= */

            if (response.status === 410) {
              toast.error(
                data?.message ||
                  data?.error ||
                  "Cette invitation n'est plus disponible.",
              );

              navigate("/");

              return;
            }

            if (!response.ok) {
              throw new Error(
                data?.error ||
                  data?.message ||
                  "Impossible de charger l'invitation.",
              );
            }

            setInvitation(data);

            if (data?.trip_id) {
              await loadTrip(Number(data.trip_id), auth.token);
            }

            return;
          }

          /* ===============================================
               UTILISATEUR NON CONNECTÉ
               → ENDPOINT PUBLIC
            =============================================== */

          const response = await fetch(
            `${
              import.meta.env.VITE_API_URL
            }/api/invitation/public/${encodeURIComponent(token)}`,
          );

          const data = await response.json().catch(() => null);

          if (cancelled) {
            return;
          }

          if (response.status === 400) {
            toast.error(
              data?.error || data?.message || "Lien d'invitation invalide.",
            );

            navigate("/");

            return;
          }

          if (response.status === 404) {
            toast.error(
              data?.error || data?.message || "Invitation introuvable.",
            );

            navigate("/");

            return;
          }

          if (response.status === 409) {
            toast.info(
              data?.message || "Cette invitation a déjà été acceptée.",
            );

            navigate("/");

            return;
          }

          if (response.status === 410) {
            toast.error(
              data?.message ||
                data?.error ||
                "Cette invitation n'est plus disponible.",
            );

            navigate("/");

            return;
          }

          if (!response.ok) {
            throw new Error(
              data?.error ||
                data?.message ||
                "Impossible de charger l'invitation.",
            );
          }

          setPublicInvitation(data.invitation);

          return;
        } catch (error) {
          console.error("Erreur chargement invitation par token :", error);

          if (!cancelled) {
            toast.error("Impossible de charger cette invitation.");
          }

          return;
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      /* ===================================================
           ANCIEN PARCOURS
        =================================================== */

      if (id && invitationId) {
        if (!auth?.token) {
          setLoading(false);

          redirectToLogin();

          return;
        }

        try {
          await loadTrip(Number(id), auth.token);

          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`,
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            },
          );

          const data = await response.json().catch(() => null);

          if (cancelled) {
            return;
          }

          if (response.status === 401) {
            redirectToLogin(
              "Votre session a expiré. Veuillez vous reconnecter.",
            );

            return;
          }

          if (response.status === 403) {
            toast.error(
              data?.error ||
                "Vous n'êtes pas autorisé à consulter cette invitation.",
            );

            navigate("/");

            return;
          }

          if (response.status === 400) {
            toast.error(data?.error || data?.message || "Invitation invalide.");

            navigate("/");

            return;
          }

          if (response.status === 404) {
            toast.error(
              data?.error || data?.message || "Invitation introuvable.",
            );

            navigate("/");

            return;
          }

          if (response.status === 409) {
            toast.info(data?.message || "Invitation déjà acceptée.");

            if (data?.trip_id) {
              navigate(`/trip/${data.trip_id}`);
            } else {
              navigate("/");
            }

            return;
          }

          if (response.status === 410) {
            toast.error(data?.message || "Invitation déjà refusée.");

            navigate("/");

            return;
          }

          if (!response.ok) {
            throw new Error("Erreur chargement invitation");
          }

          setInvitation(data);
        } catch (error) {
          console.error("Erreur chargement ancienne invitation :", error);

          if (!cancelled) {
            toast.error(
              "Une erreur est survenue lors du chargement de l'invitation.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }

        return;
      }

      toast.error("Invitation invalide.");

      navigate("/");

      setLoading(false);
    };

    loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [
    token,
    id,
    invitationId,
    auth?.token,
    navigate,
    redirectToLogin,
    loadTrip,
  ]);

  /* =========================================================
     ACCEPTATION / REFUS
  ========================================================= */

  const invitationResponded = async (status: "accepted" | "refused") => {
    const currentInvitationId =
      invitation?.id ?? (invitationId ? Number(invitationId) : null);

    if (!currentInvitationId) {
      toast.error("Invitation invalide.");

      return;
    }

    if (!auth?.token) {
      redirectToLogin(
        "Veuillez vous connecter pour répondre à cette invitation.",
      );

      return;
    }

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invitation/${currentInvitationId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${auth.token}`,
          },

          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        redirectToLogin("Votre session a expiré. Veuillez vous reconnecter.");

        return;
      }

      if (response.status === 403) {
        toast.error(
          data?.error ||
            "Vous n'êtes pas autorisé à répondre à cette invitation.",
        );

        return;
      }

      if (response.status === 400) {
        toast.error(
          data?.error ||
            data?.message ||
            "Impossible de traiter cette invitation.",
        );

        return;
      }

      if (response.status === 404) {
        toast.error(data?.error || data?.message || "Invitation introuvable.");

        navigate("/");

        return;
      }

      if (response.status === 409) {
        toast.error(
          data?.error ||
            data?.message ||
            "Cette invitation a déjà été traitée.",
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || `HTTP ${response.status}`,
        );
      }

      if (status === "accepted") {
        toast.success("Invitation acceptée");

        const tripId = invitation?.trip_id ?? (id ? Number(id) : null);

        if (tripId) {
          navigate(`/trip/${tripId}`);
        } else {
          navigate("/");
        }

        return;
      }

      toast.info("Invitation refusée");

      navigate("/");
    } catch (error) {
      console.error("Erreur traitement invitation :", error);

      toast.error("Erreur lors du traitement de l'invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     FORMATAGE DATE
  ========================================================= */

  const formatDate = (value?: string | null): string => {
    if (!value) {
      return "";
    }

    const datePart = value.slice(0, 10);

    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) {
      return value;
    }

    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  /* =========================================================
     PHOTO DU VOYAGE
  ========================================================= */

  const getTripImageUrl = (placeId?: string | null) => {
    if (!placeId) {
      return null;
    }

    return `${
      import.meta.env.VITE_API_URL
    }/api/places/photo/${encodeURIComponent(placeId)}`;
  };

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  if (loading) {
    return (
      <main className="invitation-public-main">
        <section className="invitation-public-card">
          <p className="invitation-loading">
            Chargement de votre invitation...
          </p>
        </section>
      </main>
    );
  }

  /* =========================================================
     UTILISATEUR NON CONNECTÉ
  ========================================================= */

  if (token && !auth?.token && publicInvitation) {
    const organizerName = `${publicInvitation.organizer.firstname ?? ""} ${
      publicInvitation.organizer.lastname ?? ""
    }`.trim();

    const tripImageUrl = getTripImageUrl(publicInvitation.trip.placeId);

    /* =======================================================
       UTILISATEUR DÉJÀ INSCRIT
       → VERSION COURTE
    ======================================================= */

    if (publicInvitation.hasAccount) {
      return (
        <main className="invitation-public-main">
          <section className="invitation-public-card invitation-public-card-existing-user">
            <span className="invitation-public-badge">
              Invitation au voyage
            </span>

            <h1 className="invitation-public-title">
              Vous êtes invité(e) à rejoindre un voyage
            </h1>

            <p className="invitation-public-intro">
              {organizerName
                ? `${organizerName} vous invite à participer à ce voyage.`
                : "Vous avez reçu une invitation à rejoindre un voyage."}
            </p>

            <div className="invitation-public-trip">
              {tripImageUrl && (
                <img
                  src={tripImageUrl}
                  alt=""
                  className="invitation-public-trip-image"
                />
              )}

              <div className="invitation-public-trip-content">
                <span className="invitation-public-trip-label">Voyage</span>

                <h2>{publicInvitation.trip.title || "Voyage"}</h2>

                {(publicInvitation.trip.city ||
                  publicInvitation.trip.country) && (
                  <p>
                    <MapPin size={17} />

                    <span>
                      {[
                        publicInvitation.trip.city,
                        publicInvitation.trip.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </p>
                )}

                {publicInvitation.trip.startAt &&
                  publicInvitation.trip.endAt && (
                    <p>
                      <CalendarDays size={17} />

                      <span>
                        Du {formatDate(publicInvitation.trip.startAt)} au{" "}
                        {formatDate(publicInvitation.trip.endAt)}
                      </span>
                    </p>
                  )}
              </div>
            </div>

            <p className="invitation-public-account-text">
              Connectez-vous à votre compte TripTogether pour consulter et
              répondre à cette invitation.
            </p>

            <div className="invitation-public-actions">
              <button
                type="button"
                className="invitation-btn-primary"
                onClick={() => redirectToLogin()}
              >
                Me connecter
              </button>
            </div>

            <p className="invitation-public-return-info">
              Après votre connexion, vous reviendrez automatiquement sur cette
              invitation.
            </p>
          </section>
        </main>
      );
    }

    /* =======================================================
       NOUVEL UTILISATEUR
       → PAGE PUBLIQUE TRIPTOGETHER
    ======================================================= */

    return (
      <main className="invitation-public-main">
        <section className="invitation-public-card invitation-public-card-discovery">
          {/* ===============================================
              HERO
          =============================================== */}

          <header className="invitation-public-hero">
            <span className="invitation-public-badge">
              Invitation au voyage
            </span>

            <h1 className="invitation-public-title">
              Vous êtes invité(e) à rejoindre un voyage
            </h1>

            <p className="invitation-public-intro">
              {organizerName
                ? `${organizerName} vous invite à partager une nouvelle aventure.`
                : "Vous avez reçu une invitation à rejoindre un voyage sur TripTogether."}
            </p>
          </header>

          {/* ===============================================
              CARTE VOYAGE
          =============================================== */}

          <div className="invitation-public-trip invitation-public-trip-discovery">
            {tripImageUrl && (
              <img
                src={tripImageUrl}
                alt=""
                className="invitation-public-trip-image"
              />
            )}

            <div className="invitation-public-trip-content">
              <span className="invitation-public-trip-label">
                Votre prochain voyage
              </span>

              <h2>{publicInvitation.trip.title || "Voyage"}</h2>

              {(publicInvitation.trip.city ||
                publicInvitation.trip.country) && (
                <p>
                  <MapPin size={17} />

                  <span>
                    {[publicInvitation.trip.city, publicInvitation.trip.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </p>
              )}

              {publicInvitation.trip.startAt && publicInvitation.trip.endAt && (
                <p>
                  <CalendarDays size={17} />

                  <span>
                    Du {formatDate(publicInvitation.trip.startAt)} au{" "}
                    {formatDate(publicInvitation.trip.endAt)}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* ===============================================
              PRÉSENTATION
          =============================================== */}

          <div className="invitation-public-presentation">
            <h2>Découvrez TripTogether</h2>

            <p>
              L'application qui simplifie l'organisation des voyages à
              plusieurs.
            </p>
          </div>

          {/* ===============================================
              3 BÉNÉFICES
          =============================================== */}

          <div className="invitation-public-benefits">
            <article className="invitation-public-benefit">
              <span className="invitation-public-benefit-icon">
                <UsersRound size={22} />
              </span>

              <div>
                <h3>Organisez ensemble</h3>

                <p>
                  Retrouvez toutes les informations du voyage au même endroit.
                </p>
              </div>
            </article>

            <article className="invitation-public-benefit">
              <span className="invitation-public-benefit-icon">
                <Vote size={22} />
              </span>

              <div>
                <h3>Votez pour les étapes</h3>

                <p>Choisissez ensemble les destinations et les activités.</p>
              </div>
            </article>

            <article className="invitation-public-benefit">
              <span className="invitation-public-benefit-icon">
                <Coins size={22} />
              </span>

              <div>
                <h3>Partagez les dépenses</h3>

                <p>Suivez qui a payé quoi et simplifiez les remboursements.</p>
              </div>
            </article>
          </div>

          {/* ===============================================
              VIDÉO
          =============================================== */}

          <section className="invitation-public-video-section">
            <div className="invitation-public-video-copy">
              <span className="invitation-public-video-label">
                Découvrir TripTogether
              </span>

              <h2>TripTogether en quelques secondes</h2>

              <p>
                Découvrez comment organiser votre voyage, voter ensemble et
                gérer les dépenses partagées.
              </p>
            </div>

            <div className="invitation-public-video-layout">
              <div className="invitation-public-video-wrapper">
                <video
                  className="invitation-public-video"
                  controls
                  preload="metadata"
                  playsInline
                  muted
                >
                  <source
                    src="/videos/triptogether-presentation.mp4"
                    type="video/mp4"
                  />
                  Votre navigateur ne prend pas en charge la lecture de cette
                  vidéo.
                </video>
              </div>

              <aside
                className="invitation-public-video-note"
                aria-hidden="true"
              >
                <span>
                  Découvrez
                  <br />
                  l'application
                  <br />
                  en vidéo !
                </span>

                <svg
                  className="invitation-public-video-arrow"
                  viewBox="0 0 120 90"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="
      M108 13
      C88 10 72 14 62 25
      C52 36 55 48 46 56
      C41 61 35 64 27 65
    "
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="
      M27 65
      C34 59 39 53 42 48
    "
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="
      M27 65
      C35 66 42 69 47 73
    "
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </aside>
            </div>
          </section>

          {/* ===============================================
              CTA
          =============================================== */}

          <div className="invitation-public-actions invitation-public-actions-discovery">
            <button
              type="button"
              className="invitation-btn-primary"
              onClick={redirectToRegister}
            >
              Créer mon compte
            </button>

            <p className="invitation-public-login-help">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                className="invitation-public-login-link"
                onClick={() => redirectToLogin()}
              >
                Se connecter
              </button>
            </p>
          </div>

          <p className="invitation-public-return-info">
            Après votre inscription, vous reviendrez automatiquement sur cette
            invitation.
          </p>
        </section>
      </main>
    );
  }

  /* =========================================================
     INVITATION AUTHENTIFIÉE
  ========================================================= */

  if (invitation) {
    const creatorName = `${invitation.creator_firstname ?? ""} ${
      invitation.creator_lastname ?? ""
    }`.trim();

    return (
      <>
        {myTrip && (
          <TripInfos trip={myTrip} onTripUpdated={setMyTrip} canEdit={false} />
        )}

        <main className="invitation-main">
          <article id="invitation" className="invitation-card">
            <p className="invitation-text">
              {invitation.invited_firstname
                ? `${invitation.invited_firstname}, vous avez été invité(e) au voyage de`
                : "Vous avez été invité(e) au voyage de"}
            </p>

            <img
              src={invitation.creator_avatar_url || "/profile-pic-logo.png"}
              alt={creatorName || "Organisateur"}
              className="invitation-avatar"
            />

            <p className="invitation-inviter-name">{creatorName}</p>

            {invitation.message && (
              <p className="invitation-message">
                "{invitation.message.trim()}"
              </p>
            )}

            <div className="invitation-actions">
              <button
                type="button"
                className="invitation-btn-primary"
                disabled={submitting}
                onClick={() => invitationResponded("accepted")}
              >
                {submitting ? "Traitement..." : "Accepter"}
              </button>

              <button
                type="button"
                className="invitation-btn-outline"
                disabled={submitting}
                onClick={() => invitationResponded("refused")}
              >
                Refuser
              </button>
            </div>
          </article>
        </main>
      </>
    );
  }

  /* =========================================================
     FALLBACK
  ========================================================= */

  return (
    <main className="invitation-public-main">
      <section className="invitation-public-card">
        <h1>Invitation indisponible</h1>

        <p>Cette invitation ne peut pas être affichée.</p>
      </section>
    </main>
  );
}

export default Invitation;
