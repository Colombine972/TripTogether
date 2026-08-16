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

  discoveryLabel?: string;
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

const MAX_FINAL_SUGGESTIONS =
  10;

const MAX_RESULTS_PER_SEARCH =
  20;

const MIN_DESIRED_SUGGESTIONS =
  6;

const DISCOVERY_RADIUS_LEVELS = [
  50,
  100,
  150,
] as const;

const MAX_DISCOVERY_RADIUS_KM =
  DISCOVERY_RADIUS_LEVELS[
    DISCOVERY_RADIUS_LEVELS.length - 1
  ];

/* =========================================================
   DISTANCE ENTRE DEUX COORDONNÉES
========================================================= */

function getDistanceInKm(
  first: google.maps.LatLng,
  second: google.maps.LatLng,
) {
  const earthRadius =
    6371;

  const firstLatitude =
    (first.lat() * Math.PI) /
    180;

  const secondLatitude =
    (second.lat() * Math.PI) /
    180;

  const latitudeDifference =
    ((second.lat() -
      first.lat()) *
      Math.PI) /
    180;

  const longitudeDifference =
    ((second.lng() -
      first.lng()) *
      Math.PI) /
    180;

  const a =
    Math.sin(
      latitudeDifference / 2,
    ) **
      2 +
    Math.cos(firstLatitude) *
      Math.cos(
        secondLatitude,
      ) *
      Math.sin(
        longitudeDifference / 2,
      ) **
        2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return (
    earthRadius *
    c
  );
}

/* =========================================================
   NORMALISATION TEXTE
========================================================= */

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .split("")
    .filter(
      (
        character,
      ) => {
        const code =
          character.charCodeAt(
            0,
          );

        return (
          code <
            0x0300 ||
          code >
            0x036f
        );
      },
    )
    .join("")
    .trim()
    .toLocaleLowerCase(
      "fr-FR",
    );
}

/* =========================================================
   DÉDUPLICATION
========================================================= */

function removeDuplicatePlaces(
  places: PlaceResult[],
) {
  const seenIds =
    new Set<string>();

  const seenNames =
    new Set<string>();

  return places.filter(
    (
      place,
    ) => {
      const normalizedName =
        normalizeText(
          `${place.city}-${place.country}`,
        );

      if (
        seenIds.has(
          place.placeId,
        ) ||
        seenNames.has(
          normalizedName,
        )
      ) {
        return false;
      }

      seenIds.add(
        place.placeId,
      );

      seenNames.add(
        normalizedName,
      );

      return true;
    },
  );
}

/* =========================================================
   TYPES POUR LA RECHERCHE PRINCIPALE
========================================================= */

function isPrimaryDestinationPlace(
  place: google.maps.places.Place,
) {
  const types =
    place.types ?? [];

  const acceptedTypes = [
    "locality",
    "postal_town",

    "administrative_area_level_2",
    "administrative_area_level_3",
    "administrative_area_level_4",
  ];

  return acceptedTypes.some(
    (
      type,
    ) =>
      types.includes(
        type,
      ),
  );
}

/* =========================================================
   TYPES POUR LE FALLBACK HYBRIDE
========================================================= */

function isFallbackDestinationPlace(
  place: google.maps.places.Place,
) {
  const types =
    place.types ?? [];

  const acceptedTypes = [
    "locality",
    "postal_town",

    "sublocality",
    "sublocality_level_1",
    "sublocality_level_2",
    "sublocality_level_3",
    "sublocality_level_4",
    "sublocality_level_5",

    "neighborhood",

    "administrative_area_level_2",
    "administrative_area_level_3",
    "administrative_area_level_4",
  ];

  return acceptedTypes.some(
    (
      type,
    ) =>
      types.includes(
        type,
      ),
  );
}

/* =========================================================
   DIVERSIFICATION DES DISTANCES
========================================================= */

function diversifySuggestions(
  places: PlaceResult[],
  maximumRadius: number,
) {
  const nearbyLimit =
    Math.min(
      20,
      maximumRadius,
    );

  const mediumLimit =
    Math.min(
      60,
      maximumRadius,
    );

  const nearby =
    places
      .filter(
        (
          place,
        ) =>
          place.distanceKm !==
            undefined &&
          place.distanceKm <=
            nearbyLimit,
      )
      .sort(
        (
          first,
          second,
        ) =>
          (first.distanceKm ??
            0) -
          (second.distanceKm ??
            0),
      );

  const medium =
    places
      .filter(
        (
          place,
        ) =>
          place.distanceKm !==
            undefined &&
          place.distanceKm >
            nearbyLimit &&
          place.distanceKm <=
            mediumLimit,
      )
      .sort(
        (
          first,
          second,
        ) =>
          (first.distanceKm ??
            0) -
          (second.distanceKm ??
            0),
      );

  const far =
    places
      .filter(
        (
          place,
        ) =>
          place.distanceKm !==
            undefined &&
          place.distanceKm >
            mediumLimit &&
          place.distanceKm <=
            maximumRadius,
      )
      .sort(
        (
          first,
          second,
        ) =>
          (first.distanceKm ??
            0) -
          (second.distanceKm ??
            0),
      );

  const diversified:
    PlaceResult[] =
      [];

  /*
   * On limite volontairement
   * les destinations très proches.
   */

  diversified.push(
    ...nearby.slice(
      0,
      3,
    ),
  );

  diversified.push(
    ...medium.slice(
      0,
      4,
    ),
  );

  diversified.push(
    ...far.slice(
      0,
      3,
    ),
  );

  /*
   * Complément éventuel.
   */

  const selectedIds =
    new Set(
      diversified.map(
        (
          place,
        ) =>
          place.placeId,
      ),
    );

  const remaining =
    places
      .filter(
        (
          place,
        ) =>
          !selectedIds.has(
            place.placeId,
          ),
      )
      .sort(
        (
          first,
          second,
        ) =>
          (first.distanceKm ??
            Number.POSITIVE_INFINITY) -
          (second.distanceKm ??
            Number.POSITIVE_INFINITY),
      );

  diversified.push(
    ...remaining,
  );

  return diversified;
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
  const {
    auth,
  } =
    useAuth();

  const {
    tripId:
      routeTripId,
    id,
  } =
    useParams();

  const tripId =
    routeTripId ||
    id;

  /* =======================================================
     DATES
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
     AUTOCOMPLETE MANUEL
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
    activeDiscoveryRadius,
    setActiveDiscoveryRadius,
  ] =
    useState<number>(
      DISCOVERY_RADIUS_LEVELS[0],
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
     CODE PAYS
  ======================================================= */

  useEffect(() => {
    if (
      !tripCountryCode
    ) {
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
     POSITION PRINCIPALE
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
              id:
                tripPlaceId,
            });

          await place.fetchFields({
            fields: [
              "location",
              "addressComponents",
            ],
          });

          if (
            place.location
          ) {
            setTripOrigin(
              place.location,
            );

            tripOriginRef.current =
              place.location;
          }

          const countryComponent =
            place.addressComponents?.find(
              (
                component,
              ) =>
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
        } catch (error) {
          console.error(
            "Erreur récupération position du voyage :",
            error,
          );
        }
      };

    void loadTripOrigin();
  }, [
    isLoaded,
    tripPlaceId,
    tripCountryCode,
  ]);

  /* =======================================================
     PLACE → RESULT
  ======================================================= */

  const buildPlaceResult =
    useCallback(
      (
        place:
          google.maps.places.Place,
      ): PlaceResult | null => {
        const placeCity =
          place.displayName
            ?.trim() ||
          "";

        if (
          !place.id ||
          !placeCity
        ) {
          return null;
        }

        const countryComponent =
          place.addressComponents?.find(
            (
              component,
            ) =>
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
            maxWidth:
              700,

            maxHeight:
              420,
          });

        const photoAttribution =
          firstPhoto
            ?.authorAttributions?.[0]
            ?.displayName;

        return {
          id:
            place.id,

          city:
            placeCity,

          country:
            placeCountry,

          placeId:
            place.id,

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

          discoveryLabel:
            "Destination à découvrir",
        };
      },
      [
        tripCountry,
        tripOrigin,
      ],
    );

  /* =======================================================
     AUTOCOMPLETE MANUEL
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

          if (
            !container
          ) {
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
             SÉLECTION
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
                    "types",
                  ],
                });

                const placeCity =
                  place.displayName ||
                  "";

                const countryComponent =
                  place.addressComponents?.find(
                    (
                      component,
                    ) =>
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
                  place.id ||
                  "";

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
                    maxWidth:
                      700,

                    maxHeight:
                      420,
                  });

                const photoAttribution =
                  firstPhoto
                    ?.authorAttributions?.[0]
                    ?.displayName;

                const result:
                  PlaceResult =
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

                      discoveryLabel:
                        "Destination sélectionnée",
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
                autocomplete.value.trim()
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
     RECHERCHE GOOGLE GÉNÉRIQUE
  ======================================================= */

  const runTextSearch =
    useCallback(
      async (
        queries: string[],
        radiusKm: number,
        fallbackMode = false,
      ): Promise<PlaceResult[]> => {
        if (
          !tripOrigin
        ) {
          return [];
        }

        const {
          Place,
        } =
          (await google.maps.importLibrary(
            "places",
          )) as google.maps.PlacesLibrary;

        const locationBias:
          google.maps.CircleLiteral =
            {
              center: {
                lat:
                  tripOrigin.lat(),

                lng:
                  tripOrigin.lng(),
              },

              radius:
                radiusKm *
                1000,
            };

        const searchResults =
          await Promise.allSettled(
            queries.map(
              async (
                textQuery,
              ) => {
                const request:
                  google.maps.places.SearchByTextRequest =
                    {
                      textQuery,

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

                      region:
                        effectiveCountryCode ||
                        undefined,

                      locationBias,

                      maxResultCount:
                        MAX_RESULTS_PER_SEARCH,
                    };

                const {
                  places,
                } =
                  await Place.searchByText(
                    request,
                  );

                return places;
              },
            ),
          );

        const googlePlaces =
          searchResults.flatMap(
            (
              result,
            ) =>
              result.status ===
              "fulfilled"
                ? result.value
                : [],
          );

        /* ===============================================
           FILTRE SELON LE MODE
        =============================================== */

        const geographicPlaces =
          googlePlaces.filter(
            fallbackMode
              ? isFallbackDestinationPlace
              : isPrimaryDestinationPlace,
          );

        /* ===============================================
           TRANSFORMATION
        =============================================== */

        const transformed =
          geographicPlaces
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
           RETIRER LA DESTINATION PRINCIPALE
        =============================================== */

        const withoutOrigin =
          transformed.filter(
            (
              result,
            ) =>
              normalizeText(
                result.city,
              ) !==
              normalizeText(
                tripCity,
              ),
          );

        /* ===============================================
           LIMITER AU PAYS
        =============================================== */

        const sameCountry =
          withoutOrigin.filter(
            (
              result,
            ) => {
              const destinationCountry =
                normalizeText(
                  result.country,
                );

              const currentCountry =
                normalizeText(
                  tripCountry,
                );

              return (
                destinationCountry.includes(
                  currentCountry,
                ) ||
                currentCountry.includes(
                  destinationCountry,
                )
              );
            },
          );

        const countryResults =
          sameCountry.length >
          0
            ? sameCountry
            : withoutOrigin;

        /* ===============================================
           DISTANCE RÉELLE
        =============================================== */

        const withinRadius =
          countryResults.filter(
            (
              result,
            ) => {
              if (
                result.distanceKm ===
                undefined
              ) {
                return false;
              }

              return (
                result.distanceKm >
                  0.5 &&
                result.distanceKm <=
                  radiusKm
              );
            },
          );

        return removeDuplicatePlaces(
          withinRadius,
        );
      },
      [
        tripOrigin,
        tripCity,
        tripCountry,
        effectiveCountryCode,
        buildPlaceResult,
      ],
    );

  /* =======================================================
     SUGGESTIONS HYBRIDES
     50 → 100 → 150 KM
  ======================================================= */

  useEffect(() => {
    if (
      !isLoaded ||
      !tripCity ||
      !tripCountry ||
      !tripOrigin
    ) {
      return;
    }

    const loadSuggestions =
      async () => {
        setSuggestionsLoading(
          true,
        );

        setSuggestions(
          [],
        );

        setShowAllSuggestions(
          false,
        );

        try {
          let accumulatedResults:
            PlaceResult[] =
              [];

          let finalRadius:
            number =
              DISCOVERY_RADIUS_LEVELS[0];

          /* =============================================
             REQUÊTES PRINCIPALES

             Elles fonctionnent très bien pour des
             destinations comme la Martinique ou Melbourne.
          ============================================= */

          const primaryQueries = [
            `villes autour de ${tripCity}, ${tripCountry}`,

            `communes autour de ${tripCity}, ${tripCountry}`,

            `villes de ${tripCountry}`,

            `communes de ${tripCountry}`,

            `municipalités de ${tripCountry}`,
          ];

          /* =============================================
             FALLBACK

             Utilisé uniquement si les villes / communes
             ne suffisent pas.

             C'est particulièrement utile pour :
             - Paris ;
             - New York ;
             - grandes métropoles ;
             - destinations où Google indexe les lieux
               sous forme de quartiers / sublocalités.
          ============================================= */

          const fallbackQueries = [
            `quartiers de ${tripCity}, ${tripCountry}`,

            `arrondissements de ${tripCity}, ${tripCountry}`,

            `districts de ${tripCity}, ${tripCountry}`,

            `quartiers autour de ${tripCity}, ${tripCountry}`,

            `villes proches de ${tripCity}, ${tripCountry}`,

            `communes proches de ${tripCity}, ${tripCountry}`,

            `villages autour de ${tripCity}, ${tripCountry}`,
          ];

          /* =============================================
             RAYONS SUCCESSIFS
          ============================================= */

          for (
            const radius
            of DISCOVERY_RADIUS_LEVELS
          ) {
            finalRadius =
              radius;

            /* ===========================================
               1. VILLES / COMMUNES
            =========================================== */

            const primaryResults =
              await runTextSearch(
                primaryQueries,
                radius,
                false,
              );

            accumulatedResults =
              removeDuplicatePlaces(
                [
                  ...accumulatedResults,

                  ...primaryResults,
                ],
              );

            /*
             * Si la recherche principale suffit,
             * aucun fallback n'est nécessaire.
             */

            if (
              accumulatedResults.length >=
              MIN_DESIRED_SUGGESTIONS
            ) {
              break;
            }

            /* ===========================================
               2. FALLBACK QUARTIERS / SUBLOCALITÉS
            =========================================== */

            const fallbackResults =
              await runTextSearch(
                fallbackQueries,
                radius,
                true,
              );

            accumulatedResults =
              removeDuplicatePlaces(
                [
                  ...accumulatedResults,

                  ...fallbackResults,
                ],
              );

            /*
             * Après fallback, si on a nos 6 suggestions,
             * on arrête ici.
             */

            if (
              accumulatedResults.length >=
              MIN_DESIRED_SUGGESTIONS
            ) {
              break;
            }
          }

          /* =============================================
             DIVERSIFICATION
          ============================================= */

          const diversified =
            diversifySuggestions(
              accumulatedResults,
              finalRadius,
            );

          /* =============================================
             RÉSULTAT FINAL
          ============================================= */

          const finalSuggestions =
            diversified.slice(
              0,
              MAX_FINAL_SUGGESTIONS,
            );

          console.log(
            "Suggestions finales TripTogether :",
            {
              destination:
                tripCity,

              radius:
                finalRadius,

              total:
                finalSuggestions.length,

              suggestions:
                finalSuggestions.map(
                  (
                    suggestion,
                  ) => ({
                    name:
                      suggestion.city,

                    distanceKm:
                      suggestion.distanceKm,
                  }),
                ),
            },
          );

          setActiveDiscoveryRadius(
            finalRadius,
          );

          setSuggestions(
            finalSuggestions,
          );
        } catch (error) {
          console.error(
            "Erreur suggestions Google Places :",
            error,
          );

          setSuggestions(
            [],
          );

          setActiveDiscoveryRadius(
            DISCOVERY_RADIUS_LEVELS[0],
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
    tripOrigin,
    runTextSearch,
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
     CLIC SUR SUGGESTION
  ======================================================= */

  const handleSuggestionClick =
    (
      suggestion:
        PlaceResult,
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
     RESET
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
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const token =
        localStorage.getItem(
          "token",
        ) ||
        auth?.token;

      if (
        !token
      ) {
        toast.error(
          "Vous devez être connecté.",
        );

        return;
      }

      if (
        !tripId
      ) {
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
              Recherchez une destination ou découvrez des idées d'étapes autour
              de votre voyage.
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

            <div>
              <h3>
                Idées d'étapes autour de {tripCity}
              </h3>

              <p>
                Découvrez d'autres destinations dans un rayon allant jusqu'à{" "}
                {activeDiscoveryRadius} km.
              </p>
            </div>
          </div>

          {hasMoreSuggestions && (
            <button
              type="button"
              className="step-suggestions-see-all"
              onClick={() =>
                setShowAllSuggestions(
                  (
                    current,
                  ) =>
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
              Recherche de destinations à découvrir...
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
                    className={`step-suggestion-card ${
                      selectedPlace?.placeId ===
                      suggestion.placeId
                        ? "is-selected"
                        : ""
                    }`}
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
                          {
                            suggestion.discoveryLabel
                          }
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
              Aucune autre destination n'a été trouvée dans un rayon de{" "}
              {MAX_DISCOVERY_RADIUS_KM} km. Vous pouvez toujours rechercher une
              destination manuellement ci-dessus.
            </p>
          )}
      </section>
    </section>
  );
}