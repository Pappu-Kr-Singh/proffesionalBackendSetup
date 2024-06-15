import { Router } from "express";

import {
  createOrder,
  myOrder,
  cancelOrder,
  updateOrder,
} from "../controllers/order.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.get("/", myOrder);
router.post("/", createOrder);
router.route("/:productId").patch(cancelOrder).patch(updateOrder);

export default router;
