const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

interface GooglePlacePhoto {
  name: string;
}

interface GooglePlaceDetailsResponse {
  photos?: GooglePlacePhoto[];
}

export const getPlacePhotoUrl = async (
  placeId: string,
  photoIndex = 0,
): Promise<string | null> => {
  if (!GOOGLE_API_KEY) {
    return null;
  }

  try {
    /* =====================================================
       RÉCUPÉRATION DES PHOTOS DU LIEU
    ====================================================== */

    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${GOOGLE_API_KEY}`;

    const response = await fetch(detailsUrl);

    if (!response.ok) {
      let googleError = "Erreur inconnue";

      try {
        const errorData = (await response.json()) as {
          error?: {
            message?: string;
          };
        };

        googleError = errorData.error?.message ?? "Aucun détail fourni";
      } catch {
        googleError = "Réponse Google illisible";
      }

      console.error("Google Places Details :", {
        status: response.status,
        message: googleError,
      });

      return null;
    }

    const data = (await response.json()) as GooglePlaceDetailsResponse;

    const photos = data.photos ?? [];

    if (photos.length === 0) {
      return null;
    }

    /* =====================================================
       INDEX DE PHOTO SÉCURISÉ
    ====================================================== */

    const safePhotoIndex =
      Number.isInteger(photoIndex) && photoIndex >= 0 ? photoIndex : 0;

    /* =====================================================
       SÉLECTION DE LA PHOTO
    ====================================================== */

    const selectedPhoto = photos[safePhotoIndex] ?? photos[0];

    if (!selectedPhoto?.name) {
      return null;
    }

    /* =====================================================
       URL DE LA PHOTO
    ====================================================== */

    return `https://places.googleapis.com/v1/${selectedPhoto.name}/media?maxWidthPx=1600&key=${GOOGLE_API_KEY}`;
  } catch (error) {
    console.error("Erreur Google Places Photo :", error);

    return null;
  }
};
