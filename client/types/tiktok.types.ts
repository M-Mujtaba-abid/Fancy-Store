/**
 * ==========================================
 * 🎯 TIKTOK PIXEL TYPESCRIPT TYPES
 * ==========================================
 * Add this to your global type definitions
 */

export interface TikTokContent {
  content_id: string;
  content_type: "product" | "product_group";
  content_name: string;
  price?: number;
  content_category?: string;
  content_url?: string;
  quantity?: number;
}

export interface TikTokEventData {
  contents?: TikTokContent[];
  value?: number;
  currency?: string;
  description?: string;
  status?: string;
  external_id?: string;
  external_convert_id?: string;
  order_id?: string;
  search_string?: string;
  email?: string;
  phone_number?: string;
  [key: string]: any;
}

export interface TikTokPixelApi {
  track: (eventName: string, eventData?: TikTokEventData) => void;
  page: () => void;
  identify: (userData: any) => void;
  load: (pixelId: string, config?: any) => void;
  methods: string[];
  instance: (instanceId: string) => TikTokPixelApi;
  setAndDefer: (object: any, method: string) => void;
  _i?: Record<string, any>;
  _t?: Record<string, number>;
  _o?: Record<string, any>;
}

declare global {
  interface Window {
    ttq: TikTokPixelApi;
    TiktokAnalyticsObject: string;
  }
}

export {};
