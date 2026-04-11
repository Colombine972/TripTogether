import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "./styles/CreateTrip.css";
import "./styles/mobile.css";
import { useJsApiLoader } from "@react-google-maps/api";
// import backArrowLogo from "../assets/images/back-arrow-logo.png";
import { GOOGLE_MAPS_LIBRARIES } from "../constants/maps";
import { useAuth } from "../contexts/AuthContext";

export default function CreateTrip() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || auth?.token;

  useEffect(() => {
    const isAuthenticated = token || auth?.token;
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour créer un voyage");
      navigate("/login");
    }
  }, [token, auth?.token, navigate]);

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [photoReference, setPhotoReference] = useState("");
  const [endOfTrip, setEndOfTrip] = useState({ end_at: "" });
  const [startDate, setStartDate] = useState("");

  const inputRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const placeAutocompleteRef = useRef<any>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const startAtRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = today.toLocaleDateString("fr-CA");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    if (placeAutocompleteRef.current) {
      inputRef.current.appendChild(placeAutocompleteRef.current);
      return;
    }

    const initAutocomplete = async () => {
      try {
        // Importation dynamique de la librairie "places"
        // @ts-ignore
        const { PlaceAutocompleteElement } = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        // @ts-ignore
        const autocomplete = new PlaceAutocompleteElement();
        placeAutocompleteRef.current = autocomplete;

        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        inputRef.current!.innerHTML = "";
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        inputRef.current!.appendChild(autocomplete);

        autocomplete.addEventListener(
          "gmp-select",
          // biome-ignore lint/suspicious/noExplicitAny: Google Maps event type
          async (event: any) => {
            const placePrediction = event.placePrediction;
            if (!placePrediction) return;

            const place = placePrediction.toPlace();

            await place.fetchFields({
              fields: ["addressComponents", "displayName", "photos"],
            });

            const cityName = place.displayName || "";
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const countryComp = place.addressComponents?.find((comp: any) =>
              comp.types.includes("country"),
            );
            const countryName = countryComp?.longText;
            const photoUrl = place.photos?.[0]?.getURI({ maxHeight: 400 }) || "";

            setCity(cityName);
            if (countryName) setCountry(countryName);
            setPhotoReference(photoUrl);
          },
        );

        autocomplete.addEventListener("change", () => {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          setCity((autocomplete as any).value);
        });
      } catch (error) {
        console.error("Error loading Google Maps Places library:", error);
      }
    };

    initAutocomplete();
  }, [isLoaded]);

  const capitalize = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const submitCreateTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token") || auth?.token;

    if (!token) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (!titleRef.current || !descriptionRef.current || !startAtRef.current) {
      toast.error("Formulaire incomplet");
      return;
    }

    let currentCity = city;
    if (!currentCity && placeAutocompleteRef.current) {
      currentCity = (
        placeAutocompleteRef.current as HTMLElement & { value: string }
      ).value;
    }

    let currentCountry = country;
    if (!currentCountry && currentCity && currentCity.includes(",")) {
      const parts = currentCity.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        currentCountry = parts[parts.length - 1]; // "Germany" dans "Berlin, Germany"
        currentCity = parts.slice(0, -1).join(", "); // "Berlin"
      }
    }

    const departureDate = new Date(startAtRef.current.value);
    const returnDate = new Date(endOfTrip.end_at);

    if (departureDate < today) {
      toast.error("La date de départ ne peut pas être dans le passé");
      return;
    }

    if (returnDate <= departureDate) {
      toast.error("La date de retour doit être après la date de départ");
      return;
    }

    if (!currentCity || !currentCountry || !endOfTrip.end_at) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      console.log("Champs manquants:", {
        currentCity,
        country: currentCountry,
        endOfTrip: endOfTrip.end_at,
      });
      return;
    }

    const newTrip = {
      title: capitalize(titleRef.current.value),
      description: capitalize(descriptionRef.current.value),
      start_at: startAtRef.current.value,
      end_at: endOfTrip.end_at,
      city: capitalize(currentCity),
      country: capitalize(currentCountry),
      photo_reference: photoReference,
    };

    console.log("Données du voyage à envoyer:", newTrip);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTrip),
        },
      );

      if (response.ok) {
        const result = await response.json();
        navigate(`/trip/${result.insertId}`);
        toast.success("Voyage créé avec succès !");
      } else {
        const result = await response.json();
        toast.error(result.error || "Erreur lors de la création");
        console.error("Erreur serveur:", result);
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible de créer le voyage.");
    }
  };

  return (
    <div className="create-trip-page">
      {/*<button
        type="button"
        className="button-back-arrow"
        onClick={() => navigate(-1)}
        aria-label="Retour"
      >
        <img className="back-arrow" src={backArrowLogo} alt="" />
      </button>*/}
      <img src="/logos/logo-airplane.png" alt="logo-avion" />
      <h1>
        Créer un nouveau <span>voyage</span>
      </h1>
      <p>Commencez par définir les bases de votre aventure</p>

      <form className="create-trip-form" onSubmit={submitCreateTrip}>
        <div className="form-group">
          <label htmlFor="trip-name">Nom du voyage *</label>
          <input
            type="text"
            id="trip-name"
            ref={titleRef}
            placeholder="Entrez le nom du voyage"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <input
            type="text"
            id="description"
            ref={descriptionRef}
            placeholder="Entrez la description"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">Lieu *</label>
          {/* Conteneur pour le composant Google Places */}
          <div ref={inputRef} style={{ width: "100%" }} />
        </div>

        <div className="date-container">
          <div className="form-group">
            <label htmlFor="start-date">Date de début *</label>
            <input
              type="date"
              id="start-date"
              ref={startAtRef}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={todayString}
              required
              className={!endOfTrip.end_at ? "date-empty" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end-date">Date de fin *</label>
            <input
              type="date"
              id="end-date"
              value={endOfTrip.end_at}
              onChange={(e) => setEndOfTrip({ end_at: e.target.value })}
              min={startDate || todayString}
              required
              className={!endOfTrip.end_at ? "date-empty" : ""}
            />
          </div>
        </div>
        <div>
          <p className="astuces-container">
            💡 Vous pourrez inviter des membres et ajouter des destinations une
            fois le voyage créé. Un voyage nécessite au minimum 2 participants.
          </p>
        </div>

        <div className="button-container">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
          <button type="submit" className="create-trip-button">
            Créer le voyage
          </button>
        </div>
      </form>
    </div>
  );
}
