import { Router } from "express";

import {
  addProperty,
  getAllproperty,
  getProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.get("/", getAllproperty);
router.post("/", addProperty);
router.get("/:id", getProperty);
router.route("/:productId").delete(deleteProperty).patch(updateProperty);

export default router;
