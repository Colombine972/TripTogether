import type { RequestHandler } from "express";
import { getPlacePhotoUrl } from "../services/googlePlacesService";

const getPhotoByPlaceId: RequestHandler = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (typeof placeId !== "string" || !placeId.trim()) {
      res.status(400).json({
        error: "placeId invalide",
      });

      return;
    }

    const rawPhotoIndex = req.query.photoIndex;

    const photoIndex =
      typeof rawPhotoIndex === "string" ? Number(rawPhotoIndex) : 0;

    const safePhotoIndex =
      Number.isInteger(photoIndex) && photoIndex >= 0 ? photoIndex : 0;

    const photoUrl = await getPlacePhotoUrl(placeId, safePhotoIndex);

    if (!photoUrl) {
      res.status(404).json({
        error: "Photo introuvable",
      });

      return;
    }

    // Télécharger la photo côté serveur :
    // la clé Google ne sera pas envoyée au navigateur.
    const photoResponse = await fetch(photoUrl, {
      signal: AbortSignal.timeout(15_000),
    });

    if (!photoResponse.ok) {
      console.error("Google Places Photo :", {
        status: photoResponse.status,
      });

      res.status(502).json({
        error: "Impossible de récupérer la photo",
      });

      return;
    }

    const contentType = photoResponse.headers.get("content-type");

    if (!contentType?.startsWith("image/")) {
      res.status(502).json({
        error: "Format de photo invalide",
      });

      return;
    }

    const imageBuffer = Buffer.from(await photoResponse.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(imageBuffer);
  } catch (err) {
    // Ne pas transmettre une erreur fetch susceptible de contenir
    // l'URL Google et sa clé.
    console.error("Récupération photo :", {
      name: err instanceof Error ? err.name : "UnknownError",
    });

    next(new Error("Impossible de récupérer la photo du lieu"));
  }
};

export default {
  getPhotoByPlaceId,
};