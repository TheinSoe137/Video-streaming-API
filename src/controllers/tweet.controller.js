import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { tweetContent } = req.body;
  const userId = req.user._id;
  if (!tweetContent) throw new ApiError(400, "Please enter tweet content");
  try {
    const tweet = await Tweet.create({
      content: tweetContent,
      owner: userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, tweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to create tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const tweets = await Tweet.find({ owner: userId })
      .populate("owner", "username avatar")
      .sort({ createdAt: -1 });
    if (!tweets.length) {
      throw new ApiError(404, "No tweets found for this user");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to fetch user tweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { updateTweetContent } = req.body;
  const { tweetId } = req.params;

  if (!updateTweetContent)
    throw new ApiError(400, "Please enter tweet content");
  try {
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content: updateTweetContent,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(201)
      .json(new ApiResponse(201, tweet, "Tweet updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to update tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  try {
    await Tweet.findByIdAndDelete(tweetId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet Deleted Successfully!"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to delete tweet");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
