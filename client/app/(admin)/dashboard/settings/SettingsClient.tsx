"use client";

import React, { useState } from "react";
import { Loader2, Settings, Truck, PartyPopper } from "lucide-react";
import { isSaleLive, useStoreSettings, useUpdateSettings } from "@/hooks/useSettings";
import type { StoreSettings } from "@/types/settings.type";

/**
 * Admin: delivery charge aur 11.11 sale popup.
 *
 * Dono alag alag save hote hain, taake delivery charge badalte waqt galti se
 * sale ki settings (ya ulta) na badal jayen.
 */

/** ISO (UTC) -> <input type="datetime-local"> ki value, admin ke local time mein. */
const toLocalInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const field =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted";
const card = "rounded-xl border border-border/60 bg-card p-5";
const saveButton =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50";

export default function SettingsClient() {
  const { data: settings, isLoading } = useStoreSettings();

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center py-20 text-text-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // key: har save ke baad server ki nayi value se form dobara shuru ho.
  return <SettingsForm key={JSON.stringify(settings)} settings={settings} />;
}

function SettingsForm({ settings }: { settings: StoreSettings }) {
  const updateSettings = useUpdateSettings();

  const [fee, setFee] = useState(String(settings.shippingFee));
  const [sale, setSale] = useState(settings.sale);
  const [endsAtLocal, setEndsAtLocal] = useState(toLocalInput(settings.sale.endsAt));

  const currentFee = settings.shippingFee;
  const live = isSaleLive(settings);
  const saving = updateSettings.isPending;

  const saveFee = (value: number) => updateSettings.mutate({ shippingFee: value });

  const saveSale = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      sale: {
        enabled: sale.enabled,
        headline: sale.headline,
        couponCode: sale.couponCode,
        endsAt: endsAtLocal ? new Date(endsAtLocal).toISOString() : sale.endsAt,
      },
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-main">
          <Settings size={24} className="text-primary" />
          Store Settings
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Changes apply immediately: the next cart and the next order use the new values.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------------- Delivery charge ---------------- */}
        <section className={card}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Truck size={20} className="text-primary" />
              Delivery Charge
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                currentFee === 0
                  ? "bg-green-500/15 text-green-600"
                  : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {currentFee === 0 ? "FREE DELIVERY ON" : `Rs. ${currentFee.toLocaleString()} per order`}
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveFee(Number(fee));
            }}
          >
            <label className={label} htmlFor="shipping-fee">
              Charge per order (Rs.)
            </label>
            <input
              id="shipping-fee"
              type="number"
              min={0}
              max={5000}
              step={1}
              required
              className={field}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-text-muted">Set to 0 for free delivery.</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className={saveButton}>
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save charge
              </button>
              {currentFee !== 0 ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveFee(0)}
                  className="rounded-xl border border-green-600/40 px-4 py-2.5 text-sm font-semibold text-green-600 transition-colors hover:bg-green-500/10 disabled:opacity-50"
                >
                  Make delivery free
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveFee(299)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background disabled:opacity-50"
                >
                  Reset to Rs. 299
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ---------------- 11.11 sale ---------------- */}
        <section className={card}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <PartyPopper size={20} className="text-primary" />
              Sale Popup &amp; Strip
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                live ? "bg-green-500/15 text-green-600" : "bg-slate-500/15 text-text-muted"
              }`}
            >
              {live ? "LIVE ON WEBSITE" : sale.enabled ? "ENDED" : "OFF"}
            </span>
          </div>

          <form onSubmit={saveSale} className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <span className="text-sm font-semibold">Show 11.11 sale on the website</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-(--primary-color)"
                checked={sale.enabled}
                onChange={(e) => setSale({ ...sale, enabled: e.target.checked })}
              />
            </label>

            <div>
              <label className={label} htmlFor="sale-headline">
                Headline
              </label>
              <input
                id="sale-headline"
                className={field}
                maxLength={40}
                required
                value={sale.headline}
                onChange={(e) => setSale({ ...sale, headline: e.target.value })}
                placeholder="Up to 40% OFF"
              />
              <p className="mt-1.5 text-xs text-text-muted">
                Only claim the discount products actually have, so customers can trust it.
              </p>
            </div>

            <div>
              <label className={label} htmlFor="sale-ends">
                Sale ends (your time zone)
              </label>
              <input
                id="sale-ends"
                type="datetime-local"
                required
                className={field}
                value={endsAtLocal}
                onChange={(e) => setEndsAtLocal(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-text-muted">
                The popup and strip turn off automatically after this time.
              </p>
            </div>

            <div>
              <label className={label} htmlFor="sale-coupon">
                Coupon code (optional)
              </label>
              <input
                id="sale-coupon"
                className={`${field} font-mono uppercase`}
                value={sale.couponCode}
                onChange={(e) => setSale({ ...sale, couponCode: e.target.value.toUpperCase() })}
                placeholder="Leave empty, or enter a coupon code"
              />
              <p className="mt-1.5 text-xs text-text-muted">
                The code must already exist and be active on the Coupons page.
              </p>
            </div>

            <button type="submit" disabled={saving} className={saveButton}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              Save sale
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
