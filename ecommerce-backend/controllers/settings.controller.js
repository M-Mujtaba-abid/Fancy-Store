import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { getSettingsService, updateSettingsService } from "../services/settings.service.js";

// GET /api/settings — public (delivery charge + sale popup)
//
// Browser 60 second tak cache rakhta hai: har page par popup aur strip ye
// call karte hain. CDN cache (s-maxage) jaan bujh kar nahi, kyunke CORS ka
// Allow-Origin header origin ke hisaab se badalta hai aur CDN usay mila deta.
export const getSettings = asyncHandler(async (req, res) => {
  const data = await getSettingsService();
  res.set("Cache-Control", "public, max-age=60");
  res.status(200).json(new ApiResponse(200, data, "Settings fetched"));
});

// PATCH /api/settings — admin
export const updateSettings = asyncHandler(async (req, res) => {
  const data = await updateSettingsService(req.body);
  res.status(200).json(new ApiResponse(200, data, "Settings updated"));
});
