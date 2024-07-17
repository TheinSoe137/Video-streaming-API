import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const userAccessTk = user.generateAccessToken();
    const userRefreshTk = user.generateRefershToken();
    user.refreshToken = userRefreshTk;
    await user.save({ validateBeforeSave: false });
    return { userAccessTk, userRefreshTk };
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
  if (!username || !email) {
    throw new ApiError(400, "Please enter username or email to login");
  }
  const loginUser = await User.findOne({ $or: [{ username }, { email }] });
  if (!loginUser) throw new ApiError(404, "You have to register first");

  const correctPassword = await loginUser.isPasswordCorrect(password);
  if (!correctPassword) throw new ApiError(401, "Password incorrect");

  const { userAccessTk, userRefreshTk } =
    await generateAccessTokenandRefreshToken(loginUser._id);

  const loggedInUser = await User.findById(loginUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: ture,
    secure: ture,
  };

  return res
    .status(200)
    .cookie("AccessToken", userAccessTk, options)
    .cookie("Refresh token", userRefreshTk, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          userAccessTk,
          userRefreshTk,
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
    httpOnly: ture,
    secure: ture,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});
export { registerUser, loginUser, logoutUser };
