const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

interface GooglePlacesResponse {
  candidates?: {
    photos?: {
      photo_reference: string;
    }[];
  }[];
  status: string;
}

export const getCityImage = async (
  city: string,
  country: string,
): Promise<string | null> => {
  if (!GOOGLE_API_KEY) return null;
  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      `${city} ${country}`,
    )}&inputtype=textquery&fields=photos&key=${GOOGLE_API_KEY}`;

    const response = await fetch(searchUrl);

    const data = (await response.json()) as GooglePlacesResponse;

    const photoReference = data.candidates?.[0]?.photos?.[0]?.photo_reference;

    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
    }

    return null;
  } catch (error) {
    console.error("Erreur Google Places:", error);
    return null;
  }
};
