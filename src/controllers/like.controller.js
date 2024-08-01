import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  try {
    const likeDoc = await Like.findOne({ video: videoId });

    if (likeDoc) {
      const userIndex = likeDoc.likedBy.indexOf(userId);
      if (userIndex > -1) {
        await Like.updateOne(
          { video: videoId },
          { $pull: { likedBy: userId } }
        );
        return res.status(200).json(new ApiResponse(200, "Video Unliked"));
      } else {
        await Like.updateOne(
          { video: videoId },
          { $addToSet: { likedBy: userId } }
        );
        return res.status(200).json(new ApiResponse(200, "Video Liked"));
      }
    } else {
      const newLike = await Like.create({
        video: videoId,
        likedBy: [userId],
      });
      return res.status(200).json(new ApiResponse(200, newLike, "Video Liked"));
    }
  } catch (error) {
    throw new ApiError(500, error.message, "Server error like toggle in video");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invaild comment Id");
  }
  try {
    const likeDoc = await Like.findOne({ comment: commentId });

    if (likeDoc) {
      const userIndex = likeDoc.likedBy.indexOf(userId);
      if (userIndex > -1) {
        await Like.updateOne(
          { comment: commentId },
          { $pull: { likedBy: userId } }
        );
        return res.status(200).json(new ApiResponse(200, "Comment Unliked"));
      } else {
        await Like.updateOne(
          { comment: commentId },
          { $addToSet: { likedBy: userId } }
        );
        return res.status(200).json(new ApiResponse(200, "Comment Liked"));
      }
    } else {
      const newLike = await Like.create({
        comment: commentId,
        likedBy: [userId],
      });
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Comment Liked"));
    }
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "server error like toggle in comment "
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invaild tweet Id");
  }
  try {
    const likeDoc = await Like.findOne({
      tweet: tweetId,
    });
    if (likeDoc) {
      const userIndex = likeDoc.likedBy.indexOf(userId);
      if (userIndex > -1) {
        await Like.updateOne(
          {
            tweet: tweetId,
          },
          { $pull: { likedBy: userId } }
        );
        return res.status(200).json(new ApiResponse(200, "tweet Unliked"));
      } else {
        await Like.updateOne(
          { tweet: tweetId },
          { $addToSet: { likedBy: userId } }
        );
        return res.status(200).json(new ApiResponse(200, "tweet liked"));
      }
    } else {
      const newLike = await Like.create({
        tweet: tweetId,
        likedBy: [userId],
      });
      return res.status(200).json(new ApiResponse(200, newLike, "tweet Liked"));
    }
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "server error  like toggle in tweet"
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    console.log("User ID:", userId);

    const userLikes = await Like.find({
      likedBy: userId,
      video: { $exists: true },
    });

    if (userLikes.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No liked videos found"));
    }

    const likedVideosPipeline = [
      {
        $match: {
          likedBy: userId,
          video: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$videoDetails",
      },
    ];

    const likedVideos = await Like.aggregate(likedVideosPipeline);

    if (likedVideos.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No liked videos found"));
    }

    const videos = likedVideos.map((like) => like.videoDetails);

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    throw new ApiError(500, error.message, "Failed to fetch liked videos");
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
