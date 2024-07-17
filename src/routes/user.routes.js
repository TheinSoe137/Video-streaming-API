import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/registerUser.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 10 },
    { name: "coverImage", maxCount: 10 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
export default router;
