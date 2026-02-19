import { useEffect, useState } from "react";
import "./styles/MyTrips.css";
import "./styles/StepCard.css";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

interface TheTrip {
  id: number;
  title: string;
  description: string;
  image_url: string;
  start_at: string;
  city: string;
  country: string;
  end_at: string;
}

export default function MyTrips() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "futur" | "current" | "past" | "all"
  >("all");

  const [trips, setTrips] = useState<TheTrip[]>([]);
  const handleDeleteTrip = async (e: React.MouseEvent, tripId: number) => {
    e.preventDefault(); // Empêche le clic sur le lien vers le voyage
    if (!window.confirm("Voulez-vous vraiment supprimer ce voyage ?")) return;
    try {
      const token = localStorage.getItem("token") || auth?.token;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
        toast.success("Voyage supprimé");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token") || auth?.token;
    if (!token) {
      toast.error("Vous devez être connecté pour voir vos voyages");
      navigate("/login");
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/users/my-trips?status=${activeTab}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la récupération");
        return res.json();
      })
      .then((data) => setTrips(data))
      .catch((err) => console.error("Error fetching trips:", err));
  }, [activeTab, auth?.token, navigate]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateStart = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div className="mytripsheader">
        <h1>Mes voyages</h1>
      </div>

      <div className="tripstate">
        <button
          type="button"
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          Tous mes voyages
        </button>
        <button
          type="button"
          className={activeTab === "current" ? "active" : ""}
          onClick={() => setActiveTab("current")}
        >
          En cours
        </button>
        <button
          type="button"
          className={activeTab === "futur" ? "active" : ""}
          onClick={() => setActiveTab("futur")}
        >
          À venir
        </button>
        <button
          type="button"
          className={activeTab === "past" ? "active" : ""}
          onClick={() => setActiveTab("past")}
        >
          Passés
        </button>
      </div>

      <div className="tripcards">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <Link
              to={`/trip/${trip.id}`}
              key={trip.id}
              className="tripcard-link"
            >
              <div className="tripcard">
                <div
                  className="tripcard-image"
                  style={{ position: "relative" }}
                >
                  <img
                    src={trip.image_url || "/images/default-city.jpg"}
                    alt={trip.title}
                    className="trip-bg-img"
                  />
                  <h2>{trip.title}</h2>
                  <button
                    type="button"
                    className="delete-trip-btn"
                    onClick={(e) => handleDeleteTrip(e, trip.id)}
                    title="Supprimer ce voyage"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <title>Poubelle</title>
                      <path
                        fillRule="evenodd"
                        d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.536 4.569a.75.75 0 0 0-1.44.32l.5 10a.75.75 0 0 0 1.498-.06l-.558-10.26Zm4.5 0a.75.75 0 0 0-1.5 0v10.26a.75.75 0 0 0 1.5 0v-10.26Zm3.536.26a.75.75 0 0 0-1.44-.32l-.558 10.26a.75.75 0 0 0 1.498.06l.5-10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <div className="trip-info">
                    <p>
                      <img src="/images/location-icon.png" alt="" />
                      {trip.city}, {trip.country}
                    </p>
                    <p>
                      <img src="/images/calendar-icon.png" alt="" />
                      {formatDateStart(trip.start_at)} -{" "}
                      {formatDate(trip.end_at)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="no-trips">Aucun voyage trouvé pour cette catégorie.</p>
        )}
      </div>
    </>
  );
}
