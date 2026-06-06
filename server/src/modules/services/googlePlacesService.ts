const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

interface GooglePlaceDetailsResponse {
  photos?: {
    name: string;
  }[];
}

export const getPlacePhotoUrl = async (
  placeId: string,
): Promise<string | null> => {
  if (!GOOGLE_API_KEY) return null;

  try {
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${GOOGLE_API_KEY}`;

    const response = await fetch(detailsUrl);

    if (!response.ok) {
      console.error("Erreur Google Places Details:", response.status);
      return null;
    }

    const data = (await response.json()) as GooglePlaceDetailsResponse;

    const photoName = data.photos?.[0]?.name;

    if (!photoName) return null;

    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&key=${GOOGLE_API_KEY}`;
  } catch (error) {
    console.error("Erreur Google Places Photo:", error);
    return null;
  }
};