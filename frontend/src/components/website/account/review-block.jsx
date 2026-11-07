"use client";
import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMediumDate } from "@/lib/clock";
import { reviewService } from "@/services";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";

function translateReviewError(msg) {
  if (!msg) return "Không thể gửi đánh giá. Vui lòng thử lại sau.";
  const text = String(msg);
  if (text.includes("already been reviewed") || text.includes("đã được đánh giá")) {
    return "Lịch hẹn này đã được đánh giá trước đó. Mỗi lịch hẹn chỉ có thể đánh giá một lần.";
  }
  if (text.includes("between 1 and 5") || text.includes("từ 1 đến 5")) {
    return "Vui lòng chọn số sao đánh giá từ 1 đến 5 sao.";
  }
  if (text.includes("Appointment ID is required")) {
    return "Mã lịch hẹn không hợp lệ hoặc bị thiếu.";
  }
  if (text.includes("Appointment not found")) {
    return "Không tìm thấy thông tin lịch hẹn này trên hệ thống.";
  }
  return text;
}

export function ReviewBlock({ appointmentId, customerId, artistName }) {
  const [existing, setExisting] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    reviewService
      .getByAppointmentId(appointmentId)
      .then((data) => {
        if (mounted && data && data.id) {
          setExisting({
            id: String(data.id),
            rating: data.rating,
            comment: data.comment || data.body || "",
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      })
      .catch(() => {
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  async function submit() {
    if (!rating) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await reviewService.create({
        appointmentId,
        customerId,
        rating,
        comment: body,
      });
      setExisting({
        id: String(res?.id || Date.now()),
        rating: res?.rating || rating,
        comment: res?.comment || body,
        createdAt: res?.createdAt || new Date().toISOString(),
      });
      setOpen(false);
    } catch (cause) {
      const rawMsg = cause?.response?.data?.message || cause?.message || "";
      setError(translateReviewError(rawMsg));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return null;
  }

  if (existing) {
    const dateFormatted = existing.createdAt
      ? formatMediumDate(existing.createdAt.slice(0, 10))
      : "";
    return (
      <div className="mt-4 border border-ink/10 bg-paper/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[0.75rem] uppercase tracking-wider text-ink/45">
              Đánh giá của bạn
            </span>
            <Stars value={existing.rating} />
            <span className="text-[0.8125rem] font-medium text-ink/75">
              {LABELS[existing.rating]}
            </span>
          </div>
          {dateFormatted && (
            <span className="text-[0.75rem] text-ink/40">{dateFormatted}</span>
          )}
        </div>

        {existing.comment ? (
          <p className="mt-2 text-[0.875rem] italic leading-relaxed text-ink/70">
            “{existing.comment}”
          </p>
        ) : (
          <p className="mt-2 text-[0.75rem] italic text-ink/35">
            (Không để lại nhận xét)
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-champagne underline underline-offset-4 transition-colors hover:text-ink"
        >
          <Star className="size-3.5 fill-champagne" />
          Đánh giá buổi hẹn này
        </button>
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <div className="mt-4 border border-ink/12 p-4">
      <p className="text-[0.8125rem] text-ink/55">
        Buổi hẹn với {artistName} thế nào?
      </p>

      <div
        role="radiogroup"
        aria-label="Số sao"
        className="mt-3 flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} sao`}
            onMouseEnter={() => setHover(value)}
            onFocus={() => setHover(value)}
            onClick={() => setRating(value)}
            className="p-1 transition-colors"
          >
            <Star
              className={cn(
                "size-5",
                value <= shown
                  ? "fill-champagne text-champagne"
                  : "text-ink/20",
              )}
            />
          </button>
        ))}
        {rating ? (
          <span className="ml-2 text-[0.75rem] text-ink/40">
            {LABELS[rating]}
          </span>
        ) : null}
      </div>

      <Field label="Nhận xét (không bắt buộc)" error={error} className="mt-4">
        <Textarea
          value={body}
          maxLength={600}
          rows={3}
          placeholder="Điều gì khiến bạn hài lòng, hoặc salon nên cải thiện gì?"
          onChange={(event) => setBody(event.target.value)}
        />
      </Field>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!rating || submitting}
          onClick={submit}
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
        >
          Để sau
        </Button>
      </div>

      <p className="mt-3 text-[0.75rem] leading-relaxed text-ink/35">
        Đánh giá hiển thị kèm tên rút gọn (ví dụ “Minh Anh N.”), không kèm số
        điện thoại hay email.
      </p>
    </div>
  );
}

const LABELS = {
  1: "Rất không hài lòng",
  2: "Chưa hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Rất hài lòng",
};

function Stars({ value }) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`${value} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "size-3.5",
            i <= value ? "fill-champagne text-champagne" : "text-ink/15",
          )}
        />
      ))}
    </span>
  );
}
