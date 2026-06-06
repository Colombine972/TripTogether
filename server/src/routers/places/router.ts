import { Router } from "express";
import placesActions from "../../modules/places/placesActions";

const router = Router();

router.get(
  "/photo/:placeId",
  placesActions.getPhotoByPlaceId,
);

export default router;