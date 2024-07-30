import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!videoId) throw new ApiError(400, "videoId is required");
    const comments = await Comment.aggregatePaginate(
      Comment.aggregate([
        {
          $match: { $expr: { videoId } },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  fullname: 1,
                  username: 1,
                  avatar: 1,
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
      ]),
      {
        page: page,
        limit: limit,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Cannot Fetch comments");
  }
});
const addComment = asyncHandler(async (req, res) => {
  const videoId = req.param.videoId;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim() === "")
    throw new ApiError(400, "Please add a comment");
  try {
    const commentData = await Comment.create({
      content,
      video: videoId,
      owner: userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, commentData, "Comment added successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Cannot add comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { editComment } = req.body;
  const commentId = req.params.commentId;
  const userId = req.user._id; // todo match owner to verify comment edit
  if (!editComment || editComment.trim() === "") {
    throw new ApiError(400, "Edit comment not found");
  }

  if (editComment === commentId.content) {
    throw new ApiError(400, "Edit comment not found");
  }
  try {
    const editedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content: editComment,
        },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, editedComment, "Comment edit successfully"));
  } catch (error) {
    throw new ApiError(500, error.message, "Server Error in updating Comment ");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  try {
    const deleteComment = await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(200, deleteComment, "Comment Deleted");
  } catch (error) {
    throw new ApiError(500, error.message, "Server error in deleting comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
