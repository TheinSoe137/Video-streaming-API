import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(200, "OK"));
  } catch (error) {
    throw new ApiError(404, error.message, "Error");
  }
});

export { healthcheck };
