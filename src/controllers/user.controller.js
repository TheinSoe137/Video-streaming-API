import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { deleteFromCloud, uploadOnCloud } from "../utils/fileUpload&Delete.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(501, "Error in Server, generating Token");
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //user data from frontend
  const { fullname, email, username, password } = req.body;

  //validation of user data !empty
  if (
    [fullname, email, username, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //check if user already exist (username or email or both)
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with same username or email aready exist");
  }

  //check for images
  // check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  // upload them to cloud, avatar check
  const avatar = await uploadOnCloud(avatarLocalPath);
  const coverImageUrl = await uploadOnCloud(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  //create user object - create entry in db
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImageUrl?.url || "",
    email,
    password,
    username: username,
  });

  //remove psw and refresh token from field
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //get username or email
  //find the user in db
  //pw check
  //create access, refresh tokens
  //send them to user through cookies
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Please enter username or email to login");
  }
  const loginUserData = await User.findOne({ $or: [{ username }, { email }] });
  if (!loginUserData) throw new ApiError(404, "You have to register first");

  const correctPassword = await loginUserData.isPasswordCorrect(password);
  if (!correctPassword) throw new ApiError(401, "Password incorrect");
  console.log(loginUserData._id);

  const { accessToken, refreshToken } = await generateTokens(loginUserData._id);

  console.log({ accessToken, refreshToken });
  const loggedInUser = await User.findById(loginUserData._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User is logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "unauthorized access");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(402, "Invaild user");

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(403, "Refresh token expired or used ");
    }

    const { accessToken, newRefreshToken } = await generateTokens(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refresh Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Something went wrong in refreshing access token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const correctPassword = await user.isPasswordCorrect(oldPassword);

  if (!correctPassword) throw new ApiError(401, "old Password incorrect");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "Please enter all fields");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email, //es6 syntax (email:email)
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalpath = req.file?.path; //file get from multer
  if (!avatarLocalpath) throw new ApiError(400, "Avatar file is missing");

  const avatar = await uploadOnCloud(avatarLocalpath);
  if (!avatar.url) throw new ApiError(500, "Error while uploding avatar file");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverLocalpath = req.file?.path; //file get from multer
  if (!coverLocalpath) throw new ApiError(400, "Cover file is missing");

  const coverImage = await uploadOnCloud(coverLocalpath);
  if (!coverImage.url)
    throw new ApiError(500, "Error while uploding Cover file");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage Updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localFiled: "_id",
        foreignField: "channel",
        as: "subscribers", //givin own field (this is for subscribers count)
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localFiled: "_id",
        foreignField: "subscriber",
        as: "subscribedTo", // givin own field (where the user is sub to/channels)
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers", //prefix $ because it is a field
        },
        channelSubscribeToCount: {
          $size: "$subscribedTo", //prefix $ because it is a field,how many channel user have sub to
        },
        isSubscribed: {
          $cond: {
            //$cond = condition
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
              then: true,
              else: false,
            },
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribeToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(501, "channel does not exist");
  }
  console.log(channel);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchedHistory = asyncHandler(async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
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
                owner: { $first: "$owner" },
              },
            },
          ],
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user[0].watchHistory,
          "watch history fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error, "Cannot fetch history ");
  }
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchedHistory,
};
