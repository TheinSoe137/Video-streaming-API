import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloud, deleteFromCloud } from "../utils/fileUpload&Delete.js";
import { User } from "../models/user.model.js";

//upload video
//delete video
//update video details
//toggle publish status
//get current video
//get all videos

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      query = "",
      sortBy = "createdAt",
      sortType = "desc",
      userId,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 };

    // Building the match query
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

    // Aggregation pipeline
    const aggregateQuery = Video.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                email: 1,
                fullname: 1,
                avatar: 1,
                coverImage: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ["$owner", 0] },
        },
      },

      { $sort: sortOptions },
    ]);

    // Pagination options
    const options = {
      page: pageNumber,
      limit: limitNumber,
    };

    const result = await Video.aggregatePaginate(aggregateQuery, options);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Cannot fetch videos");
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
const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      throw new ApiError(400, "Please enter all fields");
    }
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description, //es6 syntax (email:email)
        },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video Detail Updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed updating video detail");
  }
});
const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const deleteVideo = await Video.findByIdAndDelete(videoId);

    try {
      function extractPublicId(url) {
        const regex = /\/v\d+\/([^/]+)\./;
        const match = url.match(regex);

        if (match) {
          return match[1];
        } else {
          throw new Error("No match found");
        }
      }
      const videoPublicId = extractPublicId(deleteVideo.videofile);
      const thumbnailPublicId = extractPublicId(deleteVideo.thumbnail);

      await deleteFromCloud(videoPublicId, "video");
      await deleteFromCloud(thumbnailPublicId);
    } catch (error) {
      throw new ApiError(500, error.message, "fail to delete from cloud");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, deleteVideo, "Video Deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Delete Task Failed!!!");
  }
});
const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { isPublished } = req.body;
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished,
        },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Status change successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Status change Task Failed!!!");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
