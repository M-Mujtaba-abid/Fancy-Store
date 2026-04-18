// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//   try {
//     // Read token from cookie
//     const token = req.cookies.token; // assuming you set cookie name as "token"
//     if (!token) {
//       return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
//     req.user = decoded; // attach user info to req
//     next(); // allow access
//   } catch (error) {
//     res.status(401).json({ message: "Token is not valid", error: error.message });
//   }
// };

// export default authMiddleware;


import jwt from "jsonwebtoken";
import  ApiError  from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    // Read token from cookie
    const token = req.cookies.token; // assuming you set cookie name as "token"

    if (!token) {
      throw new ApiError(401, "No token, authorization denied");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded; // attach user info to req

    next(); // allow access
  } catch (error) {
    throw new ApiError(401, "Token is not valid: " + error.message);
  }
});

export default authMiddleware;

