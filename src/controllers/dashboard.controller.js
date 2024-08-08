import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    // Total video views
    const totalViewsResult = await Video.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = totalViewsResult[0]?.totalViews || 0;

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
      channel: userId,
    });

    // Total videos
    const totalVideos = await Video.countDocuments({ owner: userId });

    // Total likes
    const totalLikesResult = await Like.aggregate([
      { $match: { video: { $exists: true } } },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      { $unwind: "$videoDetails" },
      { $match: { "videoDetails.owner": new mongoose.Types.ObjectId(userId) } },
      { $count: "totalLikes" },
    ]);
    const totalLikes = totalLikesResult[0]?.totalLikes || 0;

    const stats = {
      totalViews,
      totalSubscribers,
      totalVideos,
      totalLikes,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to fetch channel stats");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const videoList = await Video.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      { $unwind: "$ownerDetails" },
      {
        $project: {
          _id: 1,
          videofile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          isPublished: 1,
          createdAt: 1,
          updatedAt: 1,
          "ownerDetails._id": 1,
          "ownerDetails.username": 1,
          "ownerDetails.fullname": 1,
          "ownerDetails.avatar": 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, videoList, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to fetch channel videos");
  }
});

export { getChannelStats, getChannelVideos };
