/**
 * ==========================================
 * 🎯 META (FACEBOOK) PIXEL TYPESCRIPT TYPES
 * ==========================================
 */

export interface MetaEventOptions {
  content_name?: string;
  content_category?: string;
  content_ids?: (string | number)[];
  content_type?: string;
  contents?: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  value?: number;
  currency?: string;
  search_string?: string;
  num_items?: number;
  status?: string;
  [key: string]: any;
}

export type FbqFunction = {
  (command: "init", pixelId: string, userData?: Record<string, any>): void;
  (command: "track", eventName: string, options?: MetaEventOptions): void;
  (command: "trackCustom", eventName: string, options?: Record<string, any>): void;
  callMethod?: (...args: any[]) => void;
  queue?: any[];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq: FbqFunction;
    _fbq: FbqFunction;
  }
}

export {};
