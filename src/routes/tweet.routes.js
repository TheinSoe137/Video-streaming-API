import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(verifyJWT);
router.route("/createTweet").post(createTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);
router.route("/t/:userId").get(getUserTweets);
export default router;
