/** Backend: services/settings.service.js */
export interface SaleSettings {
  enabled: boolean;
  headline: string;
  /** ISO, UTC */
  endsAt: string;
  /** Khali = popup mein koi code nahi */
  couponCode: string;
}

export interface StoreSettings {
  /** 0 = free delivery */
  shippingFee: number;
  sale: SaleSettings;
}

export interface StoreSettingsInput {
  shippingFee?: number;
  sale?: Partial<SaleSettings>;
}
