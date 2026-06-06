import type { RequestHandler } from "express";
import { getPlacePhotoUrl } from "../services/googlePlacesService";

const getPhotoByPlaceId: RequestHandler = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId || Array.isArray(placeId)) {
      res.status(400).json({
        error: "placeId invalide",
      });
      return;
    }

    const photoUrl = await getPlacePhotoUrl(placeId);

    if (!photoUrl) {
      res.status(404).json({
        error: "Photo introuvable",
      });
      return;
    }

    res.redirect(photoUrl);
  } catch (err) {
    next(err);
  }
};

export default {
  getPhotoByPlaceId,
};