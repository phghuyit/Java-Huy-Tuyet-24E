"use client";
import * as React from "react";
import { BadgePercent, Check, X, Loader2 } from "lucide-react";
import { currency } from "@/lib/format";
import { TODAY } from "@/lib/clock";
import { couponService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function PromoField({ services = [], date, value, discount = 0, onChange }) {
  const [coupons, setCoupons] = React.useState([]);
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    couponService.getAll(true)
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setCoupons(data);
      })
      .catch((err) => {
        console.warn("Failed to load active coupons:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalAmount = React.useMemo(() => {
    return services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [services]);

  const applied = React.useMemo(() => {
    if (!value) return null;
    const match = coupons.find(c => c.code?.toUpperCase() === value.toUpperCase());
    const discountVal = Number(discount) > 0
      ? Number(discount)
      : (match ? Math.min(Number(match.discountValue || match.discount || 0), totalAmount) : 0);
    return {
      ok: true,
      promotion: {
        code: value,
        title: match?.name || match?.description || "Ưu đãi VELA",
      },
      discount: discountVal,
    };
  }, [value, discount, coupons, totalAmount]);

  async function apply(code) {
    const trimmed = (code || "").trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");

    try {
      const match = coupons.find(c => c.code?.toUpperCase() === trimmed);
      const res = await couponService.validate(trimmed, totalAmount);
      if (res && res.valid) {
        const discountVal = Number(res.discountAmount || 0);
        onChange(trimmed, discountVal, match?.id);
        setDraft("");
        setError("");
        return;
      } else if (res && !res.valid) {
        setError(res.message || `Mã "${trimmed}" không thể áp dụng.`);
        return;
      }
    } catch {
      const match = coupons.find(c => c.code?.toUpperCase() === trimmed);
      if (!match) {
        setError(`Mã "${trimmed}" không tồn tại.`);
        return;
      }
      if (match.active === false || match.status === "INACTIVE") {
        setError("Mã ưu đãi hiện đang bị vô hiệu hóa.");
        return;
      }

      const start = (match.startAt || match.startDate || "").slice(0, 10);
      const end = (match.endAt || match.endDate || "").slice(0, 10);
      if (start && TODAY < start) {
        setError("Mã giảm giá chưa đến ngày áp dụng.");
        return;
      }
      if (end && TODAY > end) {
        setError("Mã giảm giá đã hết hạn sử dụng.");
        return;
      }

      const minOrder = Number(match.minOrderValue || 0);
      if (minOrder > 0 && totalAmount < minOrder) {
        setError(`Đơn hàng tối thiểu ${currency(minOrder)} mới được áp dụng mã này.`);
        return;
      }

      const discountVal = Math.min(Number(match.discountValue || match.discount || 0), totalAmount);
      onChange(trimmed, discountVal, match?.id);
      setDraft("");
      setError("");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = React.useMemo(() => {
    return coupons
      .filter((c) => {
        if (c.active === false || c.status === "INACTIVE") return false;
        const start = (c.startAt || c.startDate || "").slice(0, 10);
        const end = (c.endAt || c.endDate || "").slice(0, 10);
        if (start && TODAY < start) return false;
        if (end && TODAY > end) return false;
        return true;
      })
      .slice(0, 4);
  }, [coupons]);

  if (applied?.ok && applied.discount > 0) {
    return (
      <div className="mt-7 border border-champagne/40 bg-champagne/[0.06] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[0.875rem]">
            <Check className="size-3.5 text-champagne" />
            Đã áp dụng mã{" "}
            <strong className="font-semibold text-ink">
              {applied.promotion.code}
            </strong>{" "}
            ·{" "}
            <span className="tabular font-medium text-champagne">
              − {currency(applied.discount)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange("", 0)}
            className="flex items-center gap-1 text-[0.75rem] text-ink/40 transition-colors hover:text-ink cursor-pointer"
          >
            <X className="size-3" />
            Bỏ mã
          </button>
        </div>
        {applied.promotion.title ? (
          <p className="mt-2 text-[0.8125rem] text-ink/60">
            {applied.promotion.title}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-7 border-t border-ink/12 pt-6">
      <Label htmlFor="promo-code">Mã ưu đãi (giảm tiền mặt)</Label>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <Input
          id="promo-code"
          value={draft}
          placeholder="Nhập mã ưu đãi..."
          autoCapitalize="characters"
          className="min-w-40 flex-1 uppercase"
          disabled={loading}
          onChange={(event) => {
            setDraft(event.target.value.toUpperCase());
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply(draft);
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!draft.trim() || loading}
          onClick={() => apply(draft)}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Áp dụng"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-2.5 text-[0.8125rem] text-signal-stop">
          {error}
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-[0.75rem] text-ink/45">
            <BadgePercent className="size-3 text-champagne" />
            Mã ưu đãi gợi ý cho bạn:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((promotion) => {
              const val = Number(promotion.discountValue || promotion.discount || 0);
              const minOrd = Number(promotion.minOrderValue || 0);
              return (
                <button
                  key={promotion.id || promotion.code}
                  type="button"
                  disabled={loading}
                  onClick={() => apply(promotion.code)}
                  className="border border-ink/15 px-3 py-1.5 text-left text-[0.75rem] transition-colors hover:border-ink cursor-pointer"
                >
                  <span className="block font-medium tabular text-ink">{promotion.code}</span>
                  <span className="block text-[0.7rem] text-champagne">
                    Giảm {currency(val)}
                    {minOrd > 0 ? ` · Đơn từ ${currency(minOrd)}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
