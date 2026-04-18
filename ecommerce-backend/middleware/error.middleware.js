import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error(err); // (optional) debugging ke liye console me dikhao

  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, null, err.message));
  }

  // agar koi aur error hua (unexpected), usko bhi handle karo
  return res
    .status(500)
    .json(new ApiResponse(500, null, err.message || "Internal Server Error"));
};

export default errorHandler;
