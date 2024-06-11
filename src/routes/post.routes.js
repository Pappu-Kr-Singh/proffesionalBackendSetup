import { Router } from "express";
import {
  getAllPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJWT);

router.get("/", getAllPost);
router.post("/", createPost);
router.route("/:postId").delete(deletePost).patch(updatePost);

// router.patch("/:postId", updatePost);
// router.delete("/:postId", deletePost);

export default router;
