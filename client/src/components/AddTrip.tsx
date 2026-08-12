import { useJsApiLoader } from "@react-google-maps/api";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";

import { GOOGLE_MAPS_LIBRARIES } from "../constants/maps";
import { useAuth } from "../contexts/AuthContext";

import "../pages/styles/AddTrip.css";

interface AddStepProps {
  onStepAdded: () => void;
  tripStartAt: string;
  tripEndAt: string;
}

type PlaceAutocompleteElementType =
  HTMLElement & {
    value: string;
  };

type PlacePredictionType = {
  toPlace: () => google.maps.places.Place;
};

type PlacePredictionSelectEventType =
  Event & {
    placePrediction: PlacePredictionType;
  };

type PlacesLibraryWithAutocomplete =
  google.maps.PlacesLibrary & {
    PlaceAutocompleteElement: new () => PlaceAutocompleteElementType;
  };

export default function AddStep({
  onStepAdded,
  tripStartAt,
  tripEndAt,
}: AddStepProps) {
  const [city, setCity] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [placeId, setPlaceId] =
    useState("");

  const [startAt, setStartAt] =
    useState("");

  const [endAt, setEndAt] =
    useState("");

  const inputRef =
    useRef<HTMLDivElement>(
      null,
    );

  const placeAutocompleteRef =
    useRef<PlaceAutocompleteElementType | null>(
      null,
    );

  const { isLoaded } =
    useJsApiLoader({
      googleMapsApiKey:
        import.meta.env
          .VITE_APP_GOOGLE_MAPS_API_KEY ||
        "",

      libraries:
        GOOGLE_MAPS_LIBRARIES,
    });

  const { auth } =
    useAuth();

  const {
    tripId: routeTripId,
    id,
  } = useParams();

  const tripId =
    routeTripId || id;

  const minDate =
    tripStartAt.slice(
      0,
      10,
    );

  const maxDate =
    tripEndAt.slice(
      0,
      10,
    );

  /* =========================================================
     GOOGLE PLACES
  ========================================================= */

  useEffect(() => {
    if (
      !isLoaded ||
      !inputRef.current
    ) {
      return;
    }

    if (
      placeAutocompleteRef.current
    ) {
      inputRef.current.appendChild(
        placeAutocompleteRef.current,
      );

      return;
    }

    const initAutocomplete =
      async () => {
        try {
          const placesLibrary =
            (await google.maps.importLibrary(
              "places",
            )) as PlacesLibraryWithAutocomplete;

          const {
            PlaceAutocompleteElement,
          } = placesLibrary;

          const autocomplete =
            new PlaceAutocompleteElement();

          placeAutocompleteRef.current =
            autocomplete;

          if (
            !inputRef.current
          ) {
            return;
          }

          inputRef.current.innerHTML =
            "";

          inputRef.current.appendChild(
            autocomplete,
          );

          autocomplete.addEventListener(
            "gmp-select",
            async (
              event: Event,
            ) => {
              const selectEvent =
                event as PlacePredictionSelectEventType;

              const {
                placePrediction,
              } =
                selectEvent;

              if (
                !placePrediction
              ) {
                return;
              }

              const place =
                placePrediction.toPlace();

              await place.fetchFields({
                fields: [
                  "id",
                  "addressComponents",
                  "displayName",
                ],
              });

              const cityName =
                place.displayName ||
                "";

              const selectedPlaceId =
                place.id || "";

              const countryComponent =
                place.addressComponents?.find(
                  (
                    component,
                  ) =>
                    component.types.includes(
                      "country",
                    ),
                );

              const countryName =
                countryComponent?.longText ||
                "";

              setCity(
                cityName,
              );

              setPlaceId(
                selectedPlaceId,
              );

              setCountry(
                countryName,
              );
            },
          );
        } catch (error) {
          console.error(
            "Error loading Google Maps Places library:",
            error,
          );

          toast.error(
            "Impossible de charger la recherche de destination.",
          );
        }
      };

    void initAutocomplete();
  }, [isLoaded]);

  /* =========================================================
     AJOUT DE L'ÉTAPE
  ========================================================= */

  const handleAddStep =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      const token =
        localStorage.getItem(
          "token",
        ) ||
        auth?.token;

      if (!token) {
        toast.error(
          "Vous devez être connecté.",
        );

        return;
      }

      
      if (
        !city ||
        !country
      ) {
        toast.error(
          "Veuillez sélectionner une destination dans les suggestions.",
        );

        return;
      }

      if (
        !startAt ||
        !endAt
      ) {
        toast.error(
          "Veuillez renseigner les dates de l'étape.",
        );

        return;
      }

      if (
        endAt <
        startAt
      ) {
        toast.error(
          "La date de fin doit être postérieure ou égale à la date de début.",
        );

        return;
      }

      if (
        startAt <
          minDate ||
        endAt >
          maxDate
      ) {
        toast.error(
          "Les dates de l'étape doivent être comprises dans les dates du voyage.",
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps`,
            {
              method:
                "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    city,
                    country,

                    place_id:
                      placeId,

                    start_at:
                      startAt,

                    end_at:
                      endAt,
                  },
                ),
            },
          );

        const data =
          await response
            .json()
            .catch(
              () => null,
            );

        if (
          !response.ok
        ) {
          throw new Error(
            data?.error ||
              "Erreur lors de l'ajout de l'étape",
          );
        }

        setCity("");
        setCountry("");
        setPlaceId("");

        setStartAt("");
        setEndAt("");

        if (
          placeAutocompleteRef.current
        ) {
          placeAutocompleteRef.current.value =
            "";
        }

        toast.success(
          "Étape proposée avec succès.",
        );

        onStepAdded();
      } catch (error) {
        console.error(
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible d'ajouter l'étape.",
        );
      }
    };

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <div className="add-step-form-container">
      <form
        className="add-step-form"
        onSubmit={
          handleAddStep
        }
      >
        {/* =================================================
            DESTINATION
        ================================================== */}

        <div className="add-step-form-group">
          <label htmlFor="city">
            Lieu
          </label>

          <div
            id="city"
            className="input-container"
            ref={inputRef}
          />
        </div>

        {/* =================================================
            DATES
        ================================================== */}

        <div className="add-step-dates">
          <div className="add-step-form-group">
            <label htmlFor="step-start-date">
              Date de début
            </label>

            <input
              id="step-start-date"
              type="date"
              value={startAt}
              min={minDate}
              max={maxDate}
              onChange={(
                event,
              ) => {
                const value =
                  event.target
                    .value;

                setStartAt(
                  value,
                );

                if (
                  endAt &&
                  endAt <
                    value
                ) {
                  setEndAt(
                    "",
                  );
                }
              }}
              required
            />
          </div>

          <div className="add-step-form-group">
            <label htmlFor="step-end-date">
              Date de fin
            </label>

            <input
              id="step-end-date"
              type="date"
              value={endAt}
              min={
                startAt ||
                minDate
              }
              max={maxDate}
              onChange={(
                event,
              ) =>
                setEndAt(
                  event.target
                    .value,
                )
              }
              required
            />
          </div>
        </div>

        {/* =================================================
            BOUTON
        ================================================== */}

        <button
          type="submit"
          className="add-btn"
        >
          Ajouter cette étape
        </button>
      </form>
    </div>
  );
}