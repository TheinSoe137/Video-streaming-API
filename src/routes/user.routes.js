import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchedHistory,
} from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/currnet-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails); // patch for only updating change detail
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-coverimg")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchedHistory);
export default router;
