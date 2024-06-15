import { Router } from "express";

import {
  getAllProducts,
  deleteProduct,
  updateProduct,
  createProduct,
} from "../controllers/product.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.get("/", getAllProducts);
router.post("/", createProduct);
router.route("/:productId").delete(deleteProduct).patch(updateProduct);

export default router;
