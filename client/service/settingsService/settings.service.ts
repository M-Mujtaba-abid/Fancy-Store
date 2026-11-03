import type { ApiResponse } from "@/types/product.type";
import type { StoreSettings, StoreSettingsInput } from "@/types/settings.type";
import api from "../api";

export const settingsService = {
  get: async (): Promise<StoreSettings> => {
    const res = await api.get<ApiResponse<StoreSettings>>("/settings");
    return res.data.data;
  },

  // --- Admin ---
  update: async (payload: StoreSettingsInput): Promise<StoreSettings> => {
    const res = await api.patch<ApiResponse<StoreSettings>>("/settings", payload);
    return res.data.data;
  },
};
