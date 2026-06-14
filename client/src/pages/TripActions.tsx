import { useJsApiLoader } from "@react-google-maps/api";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { GOOGLE_MAPS_LIBRARIES } from "../constants/maps";
import { useAuth } from "../contexts/AuthContext";
import { COUNTRY_CURRENCY_MAP } from "../constants/currencies";
import type { TheTrip } from "../types/tripType";
import "../pages/styles/TripActions.css";

type TripActionsProps = {
  trip: TheTrip;
  onClose: () => void;
  onTripUpdated: (updatedTrip: TheTrip) => void;
};

function TripActions({ trip, onClose, onTripUpdated }: TripActionsProps) {
  const { auth } = useAuth();

  const inputRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Google Places web component
  const placeAutocompleteRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    title: trip.title || "",
    description: trip.description || "",
    city: trip.city || "",
    country: trip.country || "",
    country_code: trip.country_code || "",
    start_at: trip.start_at?.slice(0, 10) || "",
    end_at: trip.end_at?.slice(0, 10) || "",
    place_id: trip.place_id || "",
    local_currency: trip.local_currency || "",
    base_currency: trip.base_currency || "EUR",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // @ts-ignore
        const { PlaceAutocompleteElement } = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        // @ts-ignore
        const autocomplete = new PlaceAutocompleteElement();

        (autocomplete as HTMLElement & { value: string }).value =
          `${trip.city}, ${trip.country}`;

        placeAutocompleteRef.current = autocomplete;

        let hasClearedDestination = false;

        autocomplete.addEventListener("click", () => {
          if (hasClearedDestination) return;

          hasClearedDestination = true;

          (autocomplete as HTMLElement & { value: string }).value = "";
        });

        const container = inputRef.current;

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(autocomplete);

        autocomplete.addEventListener(
          "gmp-select",
          // biome-ignore lint/suspicious/noExplicitAny: Google Maps event type
          async (event: any) => {
            const placePrediction = event.placePrediction;
            if (!placePrediction) return;

            const place = placePrediction.toPlace();

            await place.fetchFields({
              fields: ["id", "addressComponents", "displayName"],
            });

            const cityName = place.displayName || "";

            // biome-ignore lint/suspicious/noExplicitAny: Google address component
            const countryComp = place.addressComponents?.find((comp: any) =>
              comp.types.includes("country"),
            );

            const countryName = countryComp?.longText || "";
            const countryCode = countryComp?.shortText || "";
            const selectedPlaceId = place.id || "";

            const currencyCode = countryCode
              ? getCurrencyByCountryCode(countryCode)
              : formData.local_currency;

            setFormData((previous) => ({
              ...previous,
              city: cityName,
              country: countryName,
              country_code: countryCode,
              local_currency: currencyCode,
              place_id: selectedPlaceId,
            }));
          },
        );

        autocomplete.addEventListener("change", () => {
          const value = (autocomplete as HTMLElement & { value: string }).value;

          setFormData((previous) => ({
            ...previous,
            city: value,
          }));
        });
      } catch (error) {
        console.error("Error loading Google Maps Places library:", error);
      }
    };

    initAutocomplete();
  }, [isLoaded, trip.city, trip.country, formData.local_currency]);

  const getCurrencyByCountryCode = (countryCode: string) => {
    return COUNTRY_CURRENCY_MAP[countryCode] || formData.local_currency || "";
  };

  const capitalize = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token") || auth?.token;

      const updatedTrip = {
        ...formData,
        title: capitalize(formData.title),
        description: capitalize(formData.description),
        city: capitalize(formData.city),
        country: capitalize(formData.country),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${trip.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTrip),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la modification");
      }
      
      toast.success("Voyage modifié ✅");
      onTripUpdated(data);
      onClose();
      
    } catch (error) {
      toast.error("Impossible de modifier le voyage");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="trip-actions">
      <header className="trip-actions-header">
        <h2>Modifier le voyage</h2>
        <p>
          Mets à jour les informations principales de ton voyage : 
          <br />
          Titre, description, dates et destination.
        </p>
      </header>

      <form className="trip-actions-form" onSubmit={handleSubmit}>
        <label>
          Titre du voyage
          <div className="trip-actions-input-icon">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <Pencil size={18} />
          </div>
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Décris rapidement le voyage..."
          />
        </label>

        <div className="trip-actions-dates">
          <label>
            Date de départ
            <input
              type="date"
              name="start_at"
              value={formData.start_at}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Date de fin
            <input
              type="date"
              name="end_at"
              value={formData.end_at}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="trip-actions-field">
          <span className="trip-actions-label">Destination</span>
          <div
            ref={inputRef}
            className="trip-actions-place-input"
            aria-label="Destination"
          />
        </div>

        {formData.local_currency && (
          <p className="currency-info">
            Devise locale détectée : <strong>{formData.local_currency}</strong>
          </p>
        )}

        <div className="trip-actions-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Annuler
          </button>

          <button type="submit" className="btn-send" disabled={isSubmitting}>
            {isSubmitting ? "Modification..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default TripActions;
