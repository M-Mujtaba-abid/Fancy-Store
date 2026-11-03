import { settingsService } from "@/service/settingsService/settings.service";
import type { StoreSettings, StoreSettingsInput } from "@/types/settings.type";
import { SHIPPING_FEE } from "@/constants/shipping.constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const SETTINGS_QUERY_KEY = ["storeSettings"];

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message || fallback;

/**
 * Delivery charge aur sale popup ki settings (admin: /dashboard/settings).
 *
 * Har page par strip aur popup isay parhte hain, react-query ek hi request
 * share karata hai. Backend down ho to `data` undefined rehta hai aur har
 * jagah purana default (SHIPPING_FEE, sale band) chalta hai.
 */
export const useStoreSettings = () =>
  useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: settingsService.get,
    staleTime: 60 * 1000,
    retry: 1,
  });

/**
 * Cart aur checkout ka fallback delivery charge. Asal charge hamesha server ke
 * cart/order response se aata hai; ye sirf us waqt ke liye hai jab wo abhi
 * aaya na ho (guest cart, Buy Now).
 */
export const useShippingFee = () => {
  const { data } = useStoreSettings();
  return data?.shippingFee ?? SHIPPING_FEE;
};

/** Mutations (useCart) hook nahi chala saktin, wo cache se parhti hain. */
export const shippingFeeFromCache = (
  queryClient: ReturnType<typeof useQueryClient>
) =>
  queryClient.getQueryData<StoreSettings>(SETTINGS_QUERY_KEY)?.shippingFee ??
  SHIPPING_FEE;

/** Sale abhi chal rahi hai? (on hai aur end time guzra nahi) */
export const isSaleLive = (settings?: StoreSettings, now = Date.now()) =>
  Boolean(
    settings?.sale?.enabled &&
      new Date(settings.sale.endsAt).getTime() > now
  );

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreSettingsInput) => settingsService.update(payload),
    onSuccess: (data) => {
      // Server ka jawab hi naya sach hai. Refetch nahi karte kyunke GET
      // browser mein 60 second cache hota hai aur purani value dikha deta.
      qc.setQueryData(SETTINGS_QUERY_KEY, data);
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Settings saved");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save settings")),
  });
};
