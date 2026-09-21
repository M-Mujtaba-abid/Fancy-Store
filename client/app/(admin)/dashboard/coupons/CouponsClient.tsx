"use client";

import React, { useMemo, useState } from "react";
import {
  useCoupons,
  useCouponReport,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useReleaseRedemption,
} from "@/hooks/useCoupons";
import type {
  CouponMutationInput,
  CouponWithStats,
  DiscountType,
} from "@/types/coupon.type";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  BarChart3,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Ticket,
} from "lucide-react";
import { toast } from "react-hot-toast";

const rs = (value: number) => `Rs. ${Math.round(Number(value) || 0).toLocaleString()}`;

/** Random, guess na hone wala code. Leak ho jaye to usage limit bachati hai. */
const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // I/O/0/1 hata diye, confusion se bachne ke liye
  let out = "";
  for (let i = 0; i < 4; i += 1) out += Math.floor(Math.random() * 10);
  for (let i = 0; i < 4; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `${out}00`;
};

const emptyForm = (): CouponMutationInput => ({
  code: generateCode(),
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  discountType: "percent",
  discountValue: 10,
  maxDiscount: 300,
  minOrderAmount: 1500,
  usageLimit: 200,
  usageLimitPerCustomer: 1,
  restrictToPhone: "",
  restrictToEmail: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
  commissionPercent: 5,
  notes: "",
});

// datetime-local input ko ISO string chahiye hoti hai "YYYY-MM-DDTHH:mm" shakal mein
const toLocalInput = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function CouponsClient() {
  const { data: coupons = [], isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [editing, setEditing] = useState<CouponWithStats | null>(null);
  const [form, setForm] = useState<CouponMutationInput | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [copied, setCopied] = useState<string>("");

  const totals = useMemo(
    () => ({
      sales: coupons.reduce((sum, c) => sum + Number(c.sales || 0), 0),
      discount: coupons.reduce((sum, c) => sum + Number(c.totalDiscount || 0), 0),
      commission: coupons.reduce((sum, c) => sum + Number(c.commissionDue || 0), 0),
      orders: coupons.reduce((sum, c) => sum + Number(c.orders || 0), 0),
    }),
    [coupons]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const openEdit = (coupon: CouponWithStats) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      ownerName: coupon.ownerName,
      ownerPhone: coupon.ownerPhone || "",
      ownerEmail: coupon.ownerEmail || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount ?? "",
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit ?? "",
      usageLimitPerCustomer: coupon.usageLimitPerCustomer,
      restrictToPhone: coupon.restrictToPhone || "",
      restrictToEmail: coupon.restrictToEmail || "",
      startsAt: toLocalInput(coupon.startsAt),
      expiresAt: toLocalInput(coupon.expiresAt),
      isActive: coupon.isActive,
      commissionPercent: coupon.commissionPercent,
      notes: coupon.notes || "",
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const payload: CouponMutationInput = {
      ...form,
      // Khali strings ko null bhejte hain, warna backend "" ko date parse
      // karne ki koshish karta hai.
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
      maxDiscount: form.maxDiscount === "" ? null : form.maxDiscount,
      usageLimit: form.usageLimit === "" ? null : form.usageLimit,
    };

    if (editing) {
      updateCoupon.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setForm(null) }
      );
    } else {
      createCoupon.mutate(payload, { onSuccess: () => setForm(null) });
    }
  };

  const copyLink = (code: string) => {
    // Promoter ko yehi link dena hota hai: is se aane wale customer ka coupon
    // khud bhar jata hai aur code type karna bhool jane wala masla khatam.
    const link = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard.writeText(link).then(
      () => {
        setCopied(code);
        toast.success("Promoter link copied");
        setTimeout(() => setCopied(""), 2000);
      },
      () => toast.error("Could not copy")
    );
  };

  const field =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted";

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text-main">
            <Ticket size={24} className="text-primary" />
            Coupons
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Har promoter ka apna code. Har customer ek hi baar istemal kar sakta hai.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> New coupon
        </button>
      </div>

      {/* Khulasa */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Orders", value: totals.orders.toLocaleString() },
          { label: "Sales", value: rs(totals.sales) },
          { label: "Discount given", value: rs(totals.discount) },
          { label: "Commission due", value: rs(totals.commission) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-text-main">{card.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center text-text-muted">
          <p className="font-medium">Abhi koi coupon nahi hai.</p>
          <p className="mt-1 text-sm">
            Promoter ka naam aur discount daal kar pehla coupon banayein.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-card text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Promoter</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-text-main">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => copyLink(coupon.code)}
                        title="Copy promoter link"
                        className="rounded p-1 text-text-muted transition-colors hover:text-primary"
                      >
                        {copied === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-main">{coupon.ownerName}</td>
                  <td className="px-4 py-3">
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}%`
                      : rs(coupon.discountValue)}
                    {coupon.maxDiscount ? (
                      <span className="text-text-muted"> (max {rs(coupon.maxDiscount)})</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">{rs(coupon.sales)}</td>
                  <td className="px-4 py-3">{rs(coupon.commissionDue)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        updateCoupon.mutate({
                          id: coupon.id,
                          payload: { isActive: !coupon.isActive },
                        })
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80 ${
                        coupon.isActive
                          ? "bg-green-500/15 text-green-600"
                          : "bg-gray-400/15 text-gray-500"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setReportId(coupon.id)}
                        title="Report"
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(coupon)}
                        title="Edit"
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          // Istemal shuda coupon backend khud rok deta hai aur
                          // wajah batata hai, yahan sirf ghalti se click hone
                          // se bachate hain.
                          if (confirm(`Delete coupon ${coupon.code}?`)) {
                            deleteCoupon.mutate(coupon.id);
                          }
                        }}
                        title="Delete"
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <CouponForm
          form={form}
          setForm={setForm}
          editing={Boolean(editing)}
          onSubmit={submit}
          onClose={() => setForm(null)}
          isSaving={createCoupon.isPending || updateCoupon.isPending}
          fieldClass={field}
          labelClass={label}
          onRegenerate={() => setForm({ ...form, code: generateCode() })}
        />
      )}

      {reportId && <CouponReportModal id={reportId} onClose={() => setReportId(null)} />}
    </div>
  );
}

// ============================================================
// FORM
// ============================================================

function CouponForm({
  form,
  setForm,
  editing,
  onSubmit,
  onClose,
  isSaving,
  fieldClass,
  labelClass,
  onRegenerate,
}: {
  form: CouponMutationInput;
  setForm: (f: CouponMutationInput) => void;
  editing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSaving: boolean;
  fieldClass: string;
  labelClass: string;
  onRegenerate: () => void;
}) {
  const set = <K extends keyof CouponMutationInput>(key: K, value: CouponMutationInput[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-background p-5 sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main">
            {editing ? "Edit coupon" : "New coupon"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-card">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Code *</label>
            <div className="flex gap-2">
              <input
                className={`${fieldClass} font-mono uppercase`}
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                required
              />
              <button
                type="button"
                onClick={onRegenerate}
                title="Generate a new random code"
                className="flex-shrink-0 rounded-lg border border-border px-3 text-text-muted transition-colors hover:border-primary hover:text-primary"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Promoter name *</label>
            <input
              className={fieldClass}
              value={form.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              placeholder="Ali Khan"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Promoter phone</label>
            <input
              className={fieldClass}
              value={form.ownerPhone || ""}
              onChange={(e) => set("ownerPhone", e.target.value)}
              placeholder="03001234567"
            />
          </div>

          <div>
            <label className={labelClass}>Promoter email</label>
            <input
              className={fieldClass}
              value={form.ownerEmail || ""}
              onChange={(e) => set("ownerEmail", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Discount type *</label>
            <select
              className={fieldClass}
              value={form.discountType}
              onChange={(e) => set("discountType", e.target.value as DiscountType)}
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (Rs.)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {form.discountType === "percent" ? "Percent off *" : "Amount off (Rs.) *"}
            </label>
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={form.discountValue}
              onChange={(e) => set("discountValue", Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Max discount (Rs.)</label>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.maxDiscount ?? ""}
              onChange={(e) => set("maxDiscount", e.target.value)}
              placeholder="khali = koi cap nahi"
            />
            <p className="mt-1 text-[11px] leading-snug text-text-muted">
              Percent coupons par zaroori. 10% ka matlab Rs 10,000 ke order par Rs 1,000.
            </p>
          </div>

          <div>
            <label className={labelClass}>Minimum order (Rs.)</label>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.minOrderAmount ?? 0}
              onChange={(e) => set("minOrderAmount", Number(e.target.value))}
            />
          </div>

          <div>
            <label className={labelClass}>Total usage limit</label>
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={form.usageLimit ?? ""}
              onChange={(e) => set("usageLimit", e.target.value)}
              placeholder="khali = unlimited"
            />
          </div>

          <div>
            <label className={labelClass}>Per customer limit</label>
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={form.usageLimitPerCustomer ?? 1}
              onChange={(e) => set("usageLimitPerCustomer", Number(e.target.value))}
            />
            <p className="mt-1 text-[11px] leading-snug text-text-muted">
              Phone aur email dono par ginti hoti hai.
            </p>
          </div>

          <div>
            <label className={labelClass}>Starts at</label>
            <input
              type="datetime-local"
              className={fieldClass}
              value={form.startsAt || ""}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Expires at</label>
            <input
              type="datetime-local"
              className={fieldClass}
              value={form.expiresAt || ""}
              onChange={(e) => set("expiresAt", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Commission %</label>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.commissionPercent ?? 0}
              onChange={(e) => set("commissionPercent", Number(e.target.value))}
            />
            <p className="mt-1 text-[11px] leading-snug text-text-muted">
              Sirf report ke liye. Order ke total par asar nahi.
            </p>
          </div>

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium text-text-main">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => set("isActive", e.target.checked)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              Active
            </label>
          </div>
        </div>

        {/* Personal coupon */}
        <div className="mt-5 rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Sirf ek customer ke liye (optional)
          </p>
          <p className="mt-1 text-[11px] leading-snug text-text-muted">
            Khali chhor dein to coupon sab ke liye khula rahega. Bharne par sirf yehi
            phone ya email istemal kar sakega.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              className={fieldClass}
              value={form.restrictToPhone || ""}
              onChange={(e) => set("restrictToPhone", e.target.value)}
              placeholder="Phone"
            />
            <input
              className={fieldClass}
              value={form.restrictToEmail || ""}
              onChange={(e) => set("restrictToEmail", e.target.value)}
              placeholder="Email"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Notes</label>
          <textarea
            className={`${fieldClass} min-h-20`}
            value={form.notes || ""}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            {editing ? "Save changes" : "Create coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// REPORT
// ============================================================

function CouponReportModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data, isLoading } = useCouponReport(id);
  const release = useReleaseRedemption();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-border bg-background p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main">
            {data ? `${data.coupon.ownerName} — ${data.coupon.code}` : "Report"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-card">
            <X size={18} />
          </button>
        </div>

        {isLoading || !data ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={26} />
          </div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Orders", value: data.summary.orders.toLocaleString() },
                { label: "Sales", value: rs(data.summary.sales) },
                { label: "Discount given", value: rs(data.summary.totalDiscount) },
                { label: "Commission due", value: rs(data.summary.commissionDue) },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-border/60 bg-card p-3">
                  <p className="text-[11px] uppercase tracking-wide text-text-muted">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-text-main">{card.value}</p>
                </div>
              ))}
            </div>

            {data.redemptions.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-muted">
                Abhi kisi ne ye coupon istemal nahi kiya.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-card text-left text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th className="px-3 py-2.5">Customer</th>
                      <th className="px-3 py-2.5">Order</th>
                      <th className="px-3 py-2.5">Discount</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.redemptions.map((r) => (
                      <tr key={r.id} className="border-t border-border/50">
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-text-main">{r.phone || "-"}</p>
                          <p className="text-xs text-text-muted">{r.email || "-"}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          {r.order ? (
                            <>
                              <p className="text-text-main">#{r.order.id}</p>
                              <p className="text-xs capitalize text-text-muted">
                                {r.order.status}
                              </p>
                            </>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">{rs(r.discountAmount)}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              r.status === "consumed"
                                ? "bg-primary/15 text-primary"
                                : "bg-gray-400/15 text-gray-500"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {r.status === "consumed" && (
                            <button
                              onClick={() => release.mutate({ id: r.id })}
                              title="Is customer ko dobara istemal karne do"
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                            >
                              Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
