import { useJsApiLoader } from "@react-google-maps/api";
import {
  CalendarDays,
  ChevronRight,
  LoaderCircle,
  MapPin,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";

import { GOOGLE_MAPS_LIBRARIES } from "../constants/maps";
import { useAuth } from "../contexts/AuthContext";

import "../pages/styles/AddTrip.css";

/* =========================================================
   TYPES
========================================================= */

interface AddStepProps {
  onStepAdded: () => void;
  onClose: () => void;

  tripStartAt: string;
  tripEndAt: string;

  tripCity: string;
  tripCountry: string;
  tripCountryCode?: string;
  tripPlaceId?: string | null;
}

interface PlaceResult {
  id: string;
  city: string;
  country: string;
  placeId: string;

  formattedAddress?: string;
  distanceKm?: number;

  imageUrl?: string;
  photoAttribution?: string;

  location?: google.maps.LatLng;
}

interface GooglePlaceAutocompleteElement extends HTMLElement {
  value: string;
  includedRegionCodes?: string[];
}

interface GooglePlacePredictionLike {
  toPlace: () => google.maps.places.Place;
}

interface GooglePlaceSelectEvent extends Event {
  placePrediction?: GooglePlacePredictionLike;
}

interface PlacesLibraryWithAutocomplete
  extends google.maps.PlacesLibrary {
  PlaceAutocompleteElement: new () => GooglePlaceAutocompleteElement;
}

/* =========================================================
   CONSTANTES
========================================================= */

const DEFAULT_CITY_IMAGE =
  "/images/default-city.jpg";

const DEFAULT_VISIBLE_SUGGESTIONS =
  3;

/* =========================================================
   DISTANCE ENTRE DEUX COORDONNÉES
========================================================= */

function getDistanceInKm(
  first: google.maps.LatLng,
  second: google.maps.LatLng,
) {
  const earthRadius = 6371;

  const firstLatitude =
    (first.lat() * Math.PI) / 180;

  const secondLatitude =
    (second.lat() * Math.PI) / 180;

  const latitudeDifference =
    ((second.lat() - first.lat()) *
      Math.PI) /
    180;

  const longitudeDifference =
    ((second.lng() - first.lng()) *
      Math.PI) /
    180;

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadius * c;
}

/* =========================================================
   COMPOSANT
========================================================= */

export default function AddStep({
  onStepAdded,
  onClose,
  tripStartAt,
  tripEndAt,
  tripCity,
  tripCountry,
  tripCountryCode,
  tripPlaceId,
}: AddStepProps) {
  const { auth } =
    useAuth();

  const {
    tripId: routeTripId,
    id,
  } =
    useParams();

  const tripId =
    routeTripId || id;

  /* =======================================================
     DATES DU VOYAGE
  ======================================================= */

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

  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const [
    city,
    setCity,
  ] =
    useState("");

  const [
    country,
    setCountry,
  ] =
    useState("");

  const [
    placeId,
    setPlaceId,
  ] =
    useState("");

  const [
    startAt,
    setStartAt,
  ] =
    useState("");

  const [
    endAt,
    setEndAt,
  ] =
    useState("");

  const [
    selectedPlace,
    setSelectedPlace,
  ] =
    useState<PlaceResult | null>(
      null,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  /* =======================================================
     AUTOCOMPLÉTION GOOGLE
  ======================================================= */

  const placeInputRef =
    useRef<HTMLDivElement>(
      null,
    );

  const placeAutocompleteRef =
    useRef<GooglePlaceAutocompleteElement | null>(
      null,
    );

  /* =======================================================
     SUGGESTIONS
  ======================================================= */

  const [
    suggestions,
    setSuggestions,
  ] =
    useState<PlaceResult[]>(
      [],
    );

  const [
    suggestionsLoading,
    setSuggestionsLoading,
  ] =
    useState(false);

  const [
    showAllSuggestions,
    setShowAllSuggestions,
  ] =
    useState(false);

  const [
    suggestionOrigin,
    setSuggestionOrigin,
  ] =
    useState<google.maps.LatLng | null>(
      null,
    );

  /* =======================================================
     POSITION DE LA DESTINATION PRINCIPALE
  ======================================================= */

  const [
    tripOrigin,
    setTripOrigin,
  ] =
    useState<google.maps.LatLng | null>(
      null,
    );

  const tripOriginRef =
    useRef<google.maps.LatLng | null>(
      null,
    );

  /* =======================================================
     CODE PAYS
  ======================================================= */

  const [
    effectiveCountryCode,
    setEffectiveCountryCode,
  ] =
    useState(
      tripCountryCode
        ?.trim()
        .toLowerCase() ||
        "",
    );

  /* =======================================================
     GOOGLE MAPS
  ======================================================= */

  const {
    isLoaded,
  } =
    useJsApiLoader({
      googleMapsApiKey:
        import.meta.env
          .VITE_APP_GOOGLE_MAPS_API_KEY ||
        "",

      libraries:
        GOOGLE_MAPS_LIBRARIES,
    });

  /* =======================================================
     SYNCHRONISATION CODE PAYS
  ======================================================= */

  useEffect(() => {
    if (!tripCountryCode) {
      return;
    }

    setEffectiveCountryCode(
      tripCountryCode
        .trim()
        .toLowerCase(),
    );
  }, [
    tripCountryCode,
  ]);

  /* =======================================================
     POSITION + PAYS DU VOYAGE
  ======================================================= */

  useEffect(() => {
    if (
      !isLoaded ||
      !tripPlaceId
    ) {
      return;
    }

    const loadTripOrigin =
      async () => {
        try {
          const {
            Place,
          } =
            (await google.maps.importLibrary(
              "places",
            )) as google.maps.PlacesLibrary;

          const place =
            new Place({
              id: tripPlaceId,
            });

          await place.fetchFields({
            fields: [
              "location",
              "addressComponents",
            ],
          });

          if (place.location) {
            setTripOrigin(
              place.location,
            );

            tripOriginRef.current =
              place.location;

            setSuggestionOrigin(
              place.location,
            );
          }

          const countryComponent =
            place.addressComponents?.find(
              (component) =>
                component.types.includes(
                  "country",
                ),
            );

          const detectedCountryCode =
            countryComponent?.shortText ||
            tripCountryCode ||
            "";

          if (
            detectedCountryCode
          ) {
            setEffectiveCountryCode(
              detectedCountryCode
                .trim()
                .toLowerCase(),
            );
          }

          console.log(
            "Pays du voyage détecté :",
            {
              city: tripCity,
              country: tripCountry,
              countryCode:
                detectedCountryCode,
            },
          );
        } catch (error) {
          console.error(
            "Erreur récupération position/pays du voyage :",
            error,
          );
        }
      };

    void loadTripOrigin();
  }, [
    isLoaded,
    tripPlaceId,
    tripCountryCode,
    tripCountry,
    tripCity,
  ]);

  /* =======================================================
     TRANSFORMATION D'UN PLACE GOOGLE
  ======================================================= */

  const buildPlaceResult =
    useCallback(
      (
        place: google.maps.places.Place,
      ): PlaceResult | null => {
        const placeCity =
          place.displayName || "";

        if (
          !place.id ||
          !placeCity
        ) {
          return null;
        }

        const countryComponent =
          place.addressComponents?.find(
            (component) =>
              component.types.includes(
                "country",
              ),
          );

        const placeCountry =
          countryComponent?.longText ||
          tripCountry;

        let distanceKm:
          | number
          | undefined;

        if (
          tripOrigin &&
          place.location
        ) {
          distanceKm =
            getDistanceInKm(
              tripOrigin,
              place.location,
            );
        }

        const firstPhoto =
          place.photos?.[0];

        const imageUrl =
          firstPhoto?.getURI({
            maxWidth: 700,
            maxHeight: 420,
          });

        const photoAttribution =
          firstPhoto
            ?.authorAttributions?.[0]
            ?.displayName;

        return {
          id: place.id,
          city: placeCity,
          country: placeCountry,
          placeId: place.id,

          formattedAddress:
            place.formattedAddress ??
            undefined,

          distanceKm,

          imageUrl:
            imageUrl ||
            DEFAULT_CITY_IMAGE,

          photoAttribution,

          location:
            place.location ??
            undefined,
        };
      },
      [
        tripCountry,
        tripOrigin,
      ],
    );

  /* =======================================================
     AUTOCOMPLÉTION GOOGLE
     LIMITÉE AU PAYS DU VOYAGE
  ======================================================= */

  useEffect(() => {
    if (
      !isLoaded ||
      !placeInputRef.current
    ) {
      return;
    }

    if (
      tripPlaceId &&
      !effectiveCountryCode
    ) {
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
          } =
            placesLibrary;

          if (
            placeAutocompleteRef.current
          ) {
            placeAutocompleteRef.current.remove();

            placeAutocompleteRef.current =
              null;
          }

          const container =
            placeInputRef.current;

          if (!container) {
            return;
          }

          container.innerHTML =
            "";

          const autocomplete =
            new PlaceAutocompleteElement();

          if (
            effectiveCountryCode
          ) {
            autocomplete.includedRegionCodes =
              [
                effectiveCountryCode,
              ];
          }

          placeAutocompleteRef.current =
            autocomplete;

          container.appendChild(
            autocomplete,
          );

          /* ===============================================
             DESTINATION SÉLECTIONNÉE
          =============================================== */

          autocomplete.addEventListener(
            "gmp-select",
            async (
              rawEvent,
            ) => {
              try {
                const event =
                  rawEvent as GooglePlaceSelectEvent;

                const placePrediction =
                  event.placePrediction;

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
                    "formattedAddress",
                    "location",
                    "photos",
                  ],
                });

                const placeCity =
                  place.displayName || "";

                const countryComponent =
                  place.addressComponents?.find(
                    (component) =>
                      component.types.includes(
                        "country",
                      ),
                  );

                const placeCountry =
                  countryComponent?.longText ||
                  "";

                const selectedCountryCode =
                  countryComponent?.shortText
                    ?.trim()
                    .toLowerCase() ||
                  "";

                const selectedPlaceId =
                  place.id || "";

                if (
                  !placeCity ||
                  !placeCountry ||
                  !selectedPlaceId
                ) {
                  toast.error(
                    "Impossible de récupérer cette destination.",
                  );

                  return;
                }

                /* ===========================================
                   SÉCURITÉ PAYS
                =========================================== */

                if (
                  effectiveCountryCode &&
                  selectedCountryCode &&
                  selectedCountryCode !==
                    effectiveCountryCode
                ) {
                  toast.error(
                    `Veuillez sélectionner une destination située en ${tripCountry}.`,
                  );

                  return;
                }

                let distanceKm:
                  | number
                  | undefined;

                const currentOrigin =
                  tripOriginRef.current;

                if (
                  currentOrigin &&
                  place.location
                ) {
                  distanceKm =
                    getDistanceInKm(
                      currentOrigin,
                      place.location,
                    );
                }

                const firstPhoto =
                  place.photos?.[0];

                const imageUrl =
                  firstPhoto?.getURI({
                    maxWidth: 700,
                    maxHeight: 420,
                  });

                const photoAttribution =
                  firstPhoto
                    ?.authorAttributions?.[0]
                    ?.displayName;

                const result: PlaceResult =
                  {
                    id:
                      selectedPlaceId,

                    city:
                      placeCity,

                    country:
                      placeCountry,

                    placeId:
                      selectedPlaceId,

                    formattedAddress:
                      place.formattedAddress ??
                      undefined,

                    distanceKm,

                    imageUrl:
                      imageUrl ||
                      DEFAULT_CITY_IMAGE,

                    photoAttribution,

                    location:
                      place.location ??
                      undefined,
                  };

                setCity(
                  result.city,
                );

                setCountry(
                  result.country,
                );

                setPlaceId(
                  result.placeId,
                );

                setSelectedPlace(
                  result,
                );

                setShowAllSuggestions(
                  false,
                );

                if (
                  place.location
                ) {
                  setSuggestionOrigin(
                    place.location,
                  );
                }
              } catch (error) {
                console.error(
                  "Erreur sélection destination :",
                  error,
                );

                toast.error(
                  "Impossible de sélectionner cette destination.",
                );
              }
            },
          );

          /* ===============================================
             CHAMP VIDÉ
          =============================================== */

          autocomplete.addEventListener(
            "change",
            () => {
              if (
                autocomplete.value
                  .trim()
              ) {
                return;
              }

              setCity(
                "",
              );

              setCountry(
                "",
              );

              setPlaceId(
                "",
              );

              setSelectedPlace(
                null,
              );

              setShowAllSuggestions(
                false,
              );

              if (
                tripOriginRef.current
              ) {
                setSuggestionOrigin(
                  tripOriginRef.current,
                );
              }
            },
          );

          autocomplete.addEventListener(
            "gmp-error",
            () => {
              console.error(
                "Erreur Google Places Autocomplete",
              );
            },
          );
        } catch (error) {
          console.error(
            "Erreur chargement Google Places :",
            error,
          );

          toast.error(
            "Impossible de charger la recherche de destinations.",
          );
        }
      };

    void initAutocomplete();

    return () => {
      if (
        placeAutocompleteRef.current
      ) {
        placeAutocompleteRef.current.remove();

        placeAutocompleteRef.current =
          null;
      }
    };
  }, [
    isLoaded,
    effectiveCountryCode,
    tripPlaceId,
    tripCountry,
  ]);

  /* =======================================================
     SUGGESTIONS AUTOMATIQUES

     LOGIQUE SEARCHBYTEXT STABLE
  ======================================================= */

  useEffect(() => {
    if (
      !isLoaded ||
      !tripCity ||
      !tripCountry
    ) {
      return;
    }

    const loadSuggestions =
      async () => {
        setSuggestionsLoading(
          true,
        );

        try {
          const {
            Place,
          } =
            (await google.maps.importLibrary(
              "places",
            )) as google.maps.PlacesLibrary;

          const suggestionCity =
            selectedPlace?.city ||
            tripCity;

          const suggestionCountry =
            selectedPlace?.country ||
            tripCountry;

          const request: google.maps.places.SearchByTextRequest =
            {
              textQuery:
                `villes à visiter près de ${suggestionCity}, ${suggestionCountry}`,

              fields: [
                "id",
                "displayName",
                "formattedAddress",
                "addressComponents",
                "location",
                "photos",
                "types",
              ],

              language:
                "fr-FR",

              maxResultCount:
                8,

              ...(suggestionOrigin
                ? {
                    locationBias:
                      suggestionOrigin,
                  }
                : {}),
            };

          const {
            places,
          } =
            await Place.searchByText(
              request,
            );

          console.log(
            `Suggestions Google reçues autour de ${suggestionCity} :`,
            places.map(
              (place) => ({
                name:
                  place.displayName,

                types:
                  place.types,

                address:
                  place.formattedAddress,
              }),
            ),
          );

          /* ===============================================
             RETIRER LA DESTINATION CENTRALE
          =============================================== */

          const filteredPlaces =
            places.filter(
              (place) => {
                const name =
                  place.displayName
                    ?.toLocaleLowerCase(
                      "fr-FR",
                    );

                return (
                  Boolean(name) &&
                  name !==
                    suggestionCity.toLocaleLowerCase(
                      "fr-FR",
                    )
                );
              },
            );

          /* ===============================================
             TRANSFORMATION
          =============================================== */

          const results =
            filteredPlaces
              .slice(
                0,
                5,
              )
              .map(
                buildPlaceResult,
              )
              .filter(
                (
                  result,
                ): result is PlaceResult =>
                  Boolean(
                    result,
                  ),
              );

          /* ===============================================
             PRIORITÉ AU PAYS DU VOYAGE
          =============================================== */

          const sameCountryResults =
            results.filter(
              (result) =>
                result.country
                  .toLocaleLowerCase(
                    "fr-FR",
                  )
                  .includes(
                    tripCountry.toLocaleLowerCase(
                      "fr-FR",
                    ),
                  ),
            );

          /*
           * On conserve volontairement
           * le fallback de la version stable.
           */
          const finalSuggestions =
            sameCountryResults.length >=
            3
              ? sameCountryResults
              : results;

          /* ===============================================
             TRI PAR DISTANCE
          =============================================== */

          finalSuggestions.sort(
            (
              first,
              second,
            ) =>
              (first.distanceKm ??
                Number.POSITIVE_INFINITY) -
              (second.distanceKm ??
                Number.POSITIVE_INFINITY),
          );

          console.log(
            `Suggestions affichées autour de ${suggestionCity} :`,
            finalSuggestions,
          );

          /*
           * IMPORTANT :
           * On garde maintenant toutes les suggestions
           * retournées par notre logique.
           *
           * Le JSX décide ensuite d'en afficher
           * seulement 3 ou toutes.
           */
          setSuggestions(
            finalSuggestions,
          );

          setShowAllSuggestions(
            false,
          );
        } catch (error) {
          console.error(
            "Erreur suggestions Google Places :",
            error,
          );

          setSuggestions(
            [],
          );
        } finally {
          setSuggestionsLoading(
            false,
          );
        }
      };

    void loadSuggestions();
  }, [
    isLoaded,
    tripCity,
    tripCountry,
    suggestionOrigin,
    selectedPlace,
    buildPlaceResult,
  ]);

  /* =======================================================
     SUGGESTIONS VISIBLES
  ======================================================= */

  const visibleSuggestions =
    showAllSuggestions
      ? suggestions
      : suggestions.slice(
          0,
          DEFAULT_VISIBLE_SUGGESTIONS,
        );

  const hasMoreSuggestions =
    suggestions.length >
    DEFAULT_VISIBLE_SUGGESTIONS;

  /* =======================================================
     CLIC SUR UNE SUGGESTION
  ======================================================= */

  const handleSuggestionClick =
    (
      suggestion: PlaceResult,
    ) => {
      setCity(
        suggestion.city,
      );

      setCountry(
        suggestion.country,
      );

      setPlaceId(
        suggestion.placeId,
      );

      setSelectedPlace(
        suggestion,
      );

      setShowAllSuggestions(
        false,
      );

      if (
        suggestion.location
      ) {
        setSuggestionOrigin(
          suggestion.location,
        );
      }

      if (
        placeAutocompleteRef.current
      ) {
        placeAutocompleteRef.current.value =
          `${suggestion.city}, ${suggestion.country}`;
      }

      placeInputRef.current?.scrollIntoView(
        {
          behavior:
            "smooth",

          block:
            "center",
        },
      );
    };

  /* =======================================================
     RÉINITIALISATION
  ======================================================= */

  const resetForm =
    () => {
      setCity(
        "",
      );

      setCountry(
        "",
      );

      setPlaceId(
        "",
      );

      setStartAt(
        "",
      );

      setEndAt(
        "",
      );

      setSelectedPlace(
        null,
      );

      setShowAllSuggestions(
        false,
      );

      if (
        tripOriginRef.current
      ) {
        setSuggestionOrigin(
          tripOriginRef.current,
        );
      }

      if (
        placeAutocompleteRef.current
      ) {
        placeAutocompleteRef.current.value =
          "";
      }
    };

  /* =======================================================
     AJOUT DE L'ÉTAPE
  ======================================================= */

  const handleAddStep =
    async (
      event: React.FormEvent<HTMLFormElement>,
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

      if (!tripId) {
        toast.error(
          "Voyage introuvable.",
        );

        return;
      }

      if (
        !city ||
        !country ||
        !placeId
      ) {
        toast.error(
          "Veuillez sélectionner une destination dans les résultats proposés.",
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
        startAt <
          minDate ||
        startAt >
          maxDate ||
        endAt <
          minDate ||
        endAt >
          maxDate
      ) {
        toast.error(
          "Les dates de l'étape doivent être comprises dans les dates du voyage.",
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

      setIsSubmitting(
        true,
      );

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
                JSON.stringify({
                  city,
                  country,

                  place_id:
                    placeId,

                  start_at:
                    startAt,

                  end_at:
                    endAt,
                }),
            },
          );

        const data =
          await response
            .json()
            .catch(
              () =>
                null,
            );

        if (
          !response.ok
        ) {
          throw new Error(
            data?.error ||
              "Erreur lors de l'ajout de l'étape.",
          );
        }

        toast.success(
          "Étape proposée avec succès.",
        );

        resetForm();

        await onStepAdded();

        onClose();
      } catch (error) {
        console.error(
          "Erreur ajout étape :",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible d'ajouter l'étape.",
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    };

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <section className="add-step-panel">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="add-step-panel-header">
        <div className="add-step-title-wrapper">
          <div className="add-step-title-icon">
            <MapPin
              size={24}
              strokeWidth={2.3}
            />
          </div>

          <div>
            <h2>
              Ajouter une étape
            </h2>

            <p>
              Recherchez une destination, choisissez vos dates et
              ajoutez-la à votre itinéraire.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="add-step-close"
          onClick={
            onClose
          }
          aria-label="Fermer"
        >
          <X
            size={22}
          />
        </button>
      </header>

      {/* ===================================================
          FORMULAIRE
      =================================================== */}

      <form
        className="add-step-form"
        onSubmit={
          handleAddStep
        }
      >
        <div className="add-step-main-grid">
          {/* =================================================
              DESTINATION
          ================================================= */}

          <div className="add-step-destination-column">
            <span className="add-step-label">
              Où souhaitez-vous aller ?
            </span>

            <div
              ref={
                placeInputRef
              }
              className="step-place-autocomplete"
              aria-label="Rechercher une ville"
            />

            {selectedPlace && (
              <div className="selected-step-place">
                <div className="selected-step-place-icon">
                  <Sparkles
                    size={20}
                  />
                </div>

                <div>
                  <strong>
                    {
                      selectedPlace.city
                    }
                    ,{" "}
                    {
                      selectedPlace.country
                    }
                  </strong>

                  {selectedPlace.distanceKm !==
                    undefined && (
                    <span>
                      À environ{" "}
                      <strong>
                        {Math.round(
                          selectedPlace.distanceKm,
                        )}{" "}
                        km
                      </strong>{" "}
                      de{" "}
                      {
                        tripCity
                      }
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              DATES
          ================================================= */}

          <div className="add-step-date-column">
            <div className="add-step-form-group">
              <label
                className="add-step-label"
                htmlFor="step-start-date"
              >
                Date de début
              </label>

              <div className="step-date-input-wrapper">
                <CalendarDays
                  size={19}
                />

                <input
                  id="step-start-date"
                  type="date"
                  value={
                    startAt
                  }
                  min={
                    minDate
                  }
                  max={
                    maxDate
                  }
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
            </div>

            <div className="add-step-form-group">
              <label
                className="add-step-label"
                htmlFor="step-end-date"
              >
                Date de fin
              </label>

              <div className="step-date-input-wrapper">
                <CalendarDays
                  size={19}
                />

                <input
                  id="step-end-date"
                  type="date"
                  value={
                    endAt
                  }
                  min={
                    startAt ||
                    minDate
                  }
                  max={
                    maxDate
                  }
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

            <button
              type="submit"
              className="add-step-submit"
              disabled={
                isSubmitting ||
                !selectedPlace ||
                !startAt ||
                !endAt
              }
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="button-loader"
                  />

                  Ajout...
                </>
              ) : (
                <>
                  <Plus
                    size={20}
                  />

                  Ajouter cette étape
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* =====================================================
          SUGGESTIONS
      ====================================================== */}

      <section className="step-suggestions">
        <div className="step-suggestions-header">
          <div className="step-suggestions-title">
            <Sparkles
              size={20}
            />

            <h3>
              {selectedPlace
                ? `Suggestions près de ${selectedPlace.city}`
                : "Suggestions près de votre voyage"}
            </h3>
          </div>

          {hasMoreSuggestions && (
            <button
              type="button"
              className="step-suggestions-see-all"
              onClick={() =>
                setShowAllSuggestions(
                  (current) =>
                    !current,
                )
              }
            >
              <span>
                {showAllSuggestions
                  ? "Réduire"
                  : "Voir toutes les suggestions"}
              </span>

              <ChevronRight
                size={18}
                className={
                  showAllSuggestions
                    ? "is-open"
                    : ""
                }
              />
            </button>
          )}
        </div>

        {suggestionsLoading && (
          <div className="step-suggestions-loading">
            <LoaderCircle
              size={22}
              className="button-loader"
            />

            <span>
              Recherche de destinations...
            </span>
          </div>
        )}

        {!suggestionsLoading &&
          visibleSuggestions.length >
            0 && (
            <div
              className={`step-suggestions-grid ${
                showAllSuggestions
                  ? "is-expanded"
                  : ""
              }`}
            >
              {visibleSuggestions.map(
                (
                  suggestion,
                ) => (
                  <button
                    key={
                      suggestion.placeId
                    }
                    type="button"
                    className="step-suggestion-card"
                    onClick={() =>
                      handleSuggestionClick(
                        suggestion,
                      )
                    }
                  >
                    <div className="step-suggestion-image-wrapper">
                      <img
                        src={
                          suggestion.imageUrl ||
                          DEFAULT_CITY_IMAGE
                        }
                        alt={`Vue de ${suggestion.city}`}
                        className="step-suggestion-image"
                        onError={(
                          event,
                        ) => {
                          if (
                            event.currentTarget.src.endsWith(
                              DEFAULT_CITY_IMAGE,
                            )
                          ) {
                            return;
                          }

                          event.currentTarget.src =
                            DEFAULT_CITY_IMAGE;
                        }}
                      />

                      {suggestion.photoAttribution && (
                        <span className="step-photo-attribution">
                          Photo :{" "}
                          {
                            suggestion.photoAttribution
                          }
                        </span>
                      )}
                    </div>

                    <div className="step-suggestion-content">
                      <div>
                        <strong>
                          {
                            suggestion.city
                          }
                        </strong>

                        {suggestion.distanceKm !==
                          undefined && (
                          <span>
                            À{" "}
                            {Math.round(
                              suggestion.distanceKm,
                            )}{" "}
                            km de{" "}
                            {
                              tripCity
                            }
                          </span>
                        )}

                        <small>
                          Découverte
                        </small>
                      </div>

                      <ChevronRight
                        size={21}
                      />
                    </div>
                  </button>
                ),
              )}
            </div>
          )}

        {!suggestionsLoading &&
          suggestions.length ===
            0 && (
            <p className="step-suggestions-empty">
              Aucune suggestion disponible pour le moment.
            </p>
          )}
      </section>
    </section>
  );
}