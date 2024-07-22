import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloud } from "../utils/fileUpload&Delete.js";
import { User } from "../models/user.model.js";

//upload video
//delete video
//update video details
//toggle publish status
//get current video
//get all videos
const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const matchQuery = {};
    if (query) {
      matchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }
    if (userId) {
      matchQuery.owner = new mongoose.Types.ObjectId(userId);
    }
    const videos = await Video.find().aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ["owner", 0] },
        },
      },
      {
        $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
      },
    ]);
    const options = {
      page,
      limit,
    };
    const result = await Video.aggregatePaginate(videos, options);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "All Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Cannot Fetch Videos");
  }
});
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  try {
    const videoLocalPath = req.files?.videofile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    const videoFile = await uploadOnCloud(videoLocalPath);
    const thumbnail = await uploadOnCloud(thumbnailLocalPath);
    const owner = await User.findOne(req.user._id).select(
      "-password -refreshToken"
    );
    const video = await Video.create({
      title,
      description,
      videofile: videoFile.url,
      thumbnail: thumbnail?.url,
      duration: videoFile.duration,
      owner: owner,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video uploaded successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "something went wrong while uploading video"
    );
  }
});
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params; //669e11f90fc8c7efe212f275
  try {
    const video = await Video.findById(videoId);
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Successfully fetched video by ID"));
  } catch (error) {
    throw new ApiError(500, error.message, "Cannot fetch the video by id");
  }
});
const updateVideo = asyncHandler(async (req, res) => {});
const deleteVideo = asyncHandler(async (req, res) => {});
const togglePublishStatus = asyncHandler(async (req, res) => {});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
