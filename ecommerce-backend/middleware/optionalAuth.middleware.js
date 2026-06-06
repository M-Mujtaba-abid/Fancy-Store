import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";

const optionalAuthMiddleware = asyncHandler(async (req, _res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded;
  } catch {
    req.user = null;
  }

  next();
});

export default optionalAuthMiddleware;
