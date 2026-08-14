import type { RequestHandler } from "express";
import { getPlacePhotoUrl } from "../services/googlePlacesService";

const getPhotoByPlaceId: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { placeId } =
      req.params;

    if (
      !placeId ||
      Array.isArray(
        placeId,
      )
    ) {
      res.status(400).json({
        error:
          "placeId invalide",
      });

      return;
    }

    /* =====================================================
       INDEX DE LA PHOTO
    ====================================================== */

    const rawPhotoIndex =
      req.query.photoIndex;

    const photoIndex =
      typeof rawPhotoIndex ===
      "string"
        ? Number(
            rawPhotoIndex,
          )
        : 0;

    const safePhotoIndex =
      Number.isInteger(
        photoIndex,
      ) &&
      photoIndex >= 0
        ? photoIndex
        : 0;

    /* =====================================================
       RÉCUPÉRATION DE LA PHOTO
    ====================================================== */

    const photoUrl =
      await getPlacePhotoUrl(
        placeId,
        safePhotoIndex,
      );

    if (!photoUrl) {
      res.status(404).json({
        error:
          "Photo introuvable",
      });

      return;
    }

    res.redirect(
      photoUrl,
    );
  } catch (err) {
    next(err);
  }
};

export default {
  getPhotoByPlaceId,
};