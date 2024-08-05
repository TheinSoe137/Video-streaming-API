import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!(name && description))
    throw new ApiError(
      400,
      null,
      "Please fill the information to create Playlist"
    );
  try {
    const playlist = await Playlist.create({
      name,
      description,
    });
    return res
      .status(201)
      .json(new ApiResponse(200, playlist, "Playlist Created!"));
  } catch (error) {
    throw new ApiError(500, error.message, "Error while Creating Playlist");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const userPlaylists = await Playlist.aggregate([
      {
        $match: {
          owner: userId,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          videoDetails: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userPlaylists,
          "User playlists fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to fetch user playlists");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  try {
    const playlist = await Playlist.findById(playlistId);
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist fetched successfully!"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "Error while getting Playlist by id"
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId) throw new ApiError(400, "Playlist Id not given");
  if (!videoId) throw new ApiError(400, "Video Id not given");
  try {
    const addVideo = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: { videos: videoId },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, addVideo, "new video added to playlist"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "Error while adding video to the Playlist "
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId) throw new ApiError(400, "Playlist Id not given");
  if (!videoId) throw new ApiError(400, "Video Id not given");
  try {
    const addVideo = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: { videos: videoId },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, addVideo, "Video removed from playlist"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "Error while removing video from the Playlist "
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    await Playlist.findByIdAndDelete(playlistId);
    return res
      .status(200)
      .json(new ApiResponse(200, addVideo, "Playlist Deleted"));
  } catch (error) {
    throw new ApiError(500, error.message, "Failed to delete the Playlist ");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!(name && description))
    throw new ApiError(
      400,

      "Please fill the information to create Playlist"
    );
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: {
          name,
          description,
        },
      },
      {
        new: true,
      }
    );
    return res
      .status(201)
      .json(new ApiResponse(200, playlist, "Playlist Detail Updated!"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message,
      "Error while Updating Playlist Details"
    );
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
