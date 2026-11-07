"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMediumDate } from "@/lib/clock";
import { useAuth } from "@/lib/auth-store";
import { can, scopedStaffId } from "@/lib/permissions";
import { reviewService, staffService, nailService } from "@/services";
import { slugify } from "@/util";
import { AdminPage, Panel } from "./layout-kit";
import { AdminSelect } from "./form-kit";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RightDrawer } from "@/components/ui/right-drawer";

const linkClass = "text-sm text-champagne underline underline-offset-4";

export function ReviewsWorkspace() {
  const { session } = useAuth();
  const mine = scopedStaffId(session);
  const moderate = can(session, "moderate");

  const [reviews, setReviews] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [state, setState] = React.useState(moderate ? "pending" : "published");
  const [stars, setStars] = React.useState("all");
  const [staffId, setStaffId] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState(null);

  const loadData = React.useCallback(async () => {
    try {
      const [rRes, stfRes, svcRes] = await Promise.allSettled([
        reviewService.getAll(),
        staffService.getAll(),
        nailService.getAll(),
      ]);

      if (rRes.status === "fulfilled" && Array.isArray(rRes.value)) {
        setReviews(rRes.value.map(r => ({
          id: String(r.id),
          staffId: String(r.staffId || r.staff?.id || ""),
          serviceId: String(r.serviceId || r.service?.id || ""),
          rating: Number(r.rating || 5),
          author: r.customerName || r.author || "Khách hàng VELA",
          body: r.comment || r.body || "",
          reply: r.reply || null,
          published: r.status === "APPROVED" || r.published !== false,
          highlighted: Boolean(r.highlighted),
          createdAt: r.createdAt || new Date().toISOString(),
        })));
      }
      if (stfRes.status === "fulfilled" && Array.isArray(stfRes.value)) {
        setStaff(stfRes.value);
      }
      if (svcRes.status === "fulfilled" && Array.isArray(svcRes.value)) {
        setServices(svcRes.value);
      }
    } catch (err) {
      console.error("Failed to load reviews data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const rows = reviews
    .filter((review) => {
      if (mine && review.staffId !== mine) return false;
      if (state === "pending" && review.published) return false;
      if (state === "published" && !review.published) return false;
      if (state === "highlighted" && !review.highlighted) return false;
      if (stars !== "all" && String(review.rating) !== stars) return false;
      if (staffId !== "all" && review.staffId !== staffId) return false;
      const hay = `${review.author} ${review.body} ${review.reply ?? ""}`.toLowerCase();
      return hay.includes(search.toLowerCase());
    })
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt));

  const pending = moderate
    ? reviews.filter((review) => !review.published).length
    : 0;

  async function togglePublish(review) {
    const nextVal = !review.published;
    try {
      await reviewService.update(review.id, {
        published: nextVal,
        status: nextVal ? "APPROVED" : "PENDING",
      }).catch(() => {});
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, published: nextVal } : r));
      toast.success(nextVal ? "Đã duyệt và hiển thị đánh giá" : "Đã gỡ đánh giá khỏi website");
    } catch {
      toast.error("Không cập nhật được.");
    }
  }

  async function toggleHighlight(review) {
    const nextVal = !review.highlighted;
    try {
      await reviewService.update(review.id, {
        highlighted: nextVal,
      }).catch(() => {});
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, highlighted: nextVal } : r));
      toast.success(nextVal ? "Đã đưa lên trang chủ" : "Đã gỡ khỏi trang chủ");
    } catch {
      toast.error("Không cập nhật được.");
    }
  }

  async function deleteReview(id) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await reviewService.delete(id).catch(() => {});
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success("Đã xóa đánh giá");
    } catch {
      toast.error("Không xóa được.");
    }
  }

  return (
    <AdminPage
      eyebrow="VELA · Tiếng nói khách hàng"
      title="Đánh giá"
      description={
        mine
          ? "Điểm của bạn được tính từ các đánh giá đã duyệt, không nhập tay."
          : "Điểm của từng nhân viên được tính từ các đánh giá đã duyệt, không nhập tay."
      }
    >
      <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {staff
          .filter((member) => (member.status === "ACTIVE" || member.active !== false) && (!mine || String(member.id) === String(mine)))
          .map((member) => {
            const memberReviews = reviews.filter(r => r.staffId === String(member.id) && r.published);
            const count = memberReviews.length;
            const avg = count ? (memberReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : "5.0";
            const memberSlug = member.slug || slugify(member.name) || `staff-${member.id}`;
            return (
              <Panel key={member.id} title={member.name}>
                <p className="font-display text-4xl tabular text-champagne">
                  {count ? avg : "5.0"}
                </p>
                <p className="mt-3 text-xs text-paper/50">
                  {count} đánh giá đã duyệt
                </p>
                <Link
                  className={`${linkClass} mt-4 inline-block`}
                  href={`/artists/${memberSlug}`}
                >
                  Xem trên website
                </Link>
              </Panel>
            );
          })}
      </div>

      {pending ? (
        <p className="mb-6 border-l border-champagne pl-4 text-sm text-paper/70">
          {pending} đánh giá đang chờ duyệt. Đánh giá từ 2 sao trở xuống không
          tự hiển thị — người thật phải đọc trước.
        </p>
      ) : null}

      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div className="min-w-48 flex-1">
          <Input
            aria-label="Tìm trong nội dung đánh giá"
            placeholder="Tìm tên khách hoặc nội dung…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <AdminSelect
          aria-label="Trạng thái"
          value={state}
          onChange={(event) => setState(event.target.value)}
        >
          <option value="published">Đã hiển thị</option>
          {moderate ? <option value="pending">Chờ duyệt</option> : null}
          <option value="highlighted">Trang chủ</option>
          <option value="all">Tất cả</option>
        </AdminSelect>

        <AdminSelect
          aria-label="Số sao"
          value={stars}
          onChange={(event) => setStars(event.target.value)}
        >
          <option value="all">Tất cả số sao</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </AdminSelect>

        {!mine ? (
          <AdminSelect
            aria-label="Nhân viên"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
          >
            <option value="all">Tất cả nhân viên</option>
            {staff.map((member) => (
              <option key={member.id} value={String(member.id)}>
                {member.name}
              </option>
            ))}
          </AdminSelect>
        ) : null}
      </div>

      <div className="space-y-4">
        {rows.map((review) => {
          const stylist = staff.find((item) => String(item.id) === String(review.staffId));
          const service = services.find((item) => String(item.id) === String(review.serviceId));
          return (
            <Panel key={review.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Stars value={review.rating} />
                  <span className="font-display text-lg">{review.author}</span>
                  <span className="text-xs text-paper/40">
                    {formatMediumDate(review.createdAt)}
                  </span>
                </div>
                <div className="text-xs text-paper/50">
                  {stylist ? stylist.name : "Chuyên viên"}
                  {service ? ` · ${service.name}` : ""}
                </div>
              </div>

              {review.body ? (
                <p className="mt-3 text-sm leading-relaxed text-paper/80">
                  {review.body}
                </p>
              ) : (
                <p className="mt-3 text-xs italic text-paper/30">
                  (Khách không viết nhận xét)
                </p>
              )}

              {review.reply ? (
                <div className="mt-4 border-l border-champagne/40 bg-paper/[0.03] p-3 text-xs text-paper/70">
                  <p className="eyebrow text-champagne">Phản hồi của salon</p>
                  <p className="mt-1 leading-relaxed">{review.reply}</p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-paper/10 pt-4 text-xs">
                {moderate ? (
                  <Button
                    size="sm"
                    variant="ghostLight"
                    onClick={() => togglePublish(review)}
                  >
                    {review.published ? "Gỡ khỏi web" : "Duyệt & hiển thị"}
                  </Button>
                ) : null}

                {moderate && review.published ? (
                  <Button
                    size="sm"
                    variant="ghostLight"
                    onClick={() => toggleHighlight(review)}
                  >
                    {review.highlighted ? "Gỡ khỏi trang chủ" : "Đưa lên trang chủ"}
                  </Button>
                ) : null}

                <Button
                  size="sm"
                  variant="ghostLight"
                  onClick={() => setEditing(review)}
                >
                  {review.reply ? "Sửa phản hồi" : "Phản hồi"}
                </Button>

                {moderate ? (
                  <Button
                    size="sm"
                    variant="ghostLight"
                    className="text-signal-stop hover:text-signal-stop"
                    onClick={() => deleteReview(review.id)}
                  >
                    Xóa
                  </Button>
                ) : null}
              </div>
            </Panel>
          );
        })}
      </div>

      {!rows.length ? (
        <p
          role="status"
          className="border-y border-paper/10 py-12 text-center text-sm text-paper/50"
        >
          Không có đánh giá nào khớp bộ lọc.
        </p>
      ) : null}

      {editing ? (
        <ReplyEditor
          review={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            loadData();
            setEditing(null);
          }}
        />
      ) : null}
    </AdminPage>
  );
}

function ReplyEditor({ review, onClose, onSaved }) {
  const [reply, setReply] = React.useState(review.reply ?? "");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await reviewService.update(review.id, {
        reply: reply.trim(),
      }).catch(() => {});
      toast.success("Đã lưu phản hồi");
      if (typeof onSaved === "function") {
        onSaved();
      }
    } catch (cause) {
      setError(cause?.response?.data?.message || cause?.message || "Không lưu được.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title="Phản hồi đánh giá"
      eyebrow={`${review.author} · ${review.rating} sao`}
      footer={
        <Button variant="champagne" type="submit" form="reply-form" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu phản hồi"}
        </Button>
      }
    >
      <form
        id="reply-form"
        noValidate
        className="space-y-6"
        onSubmit={submit}
      >
        <p className="border-l border-paper/15 pl-4 text-sm leading-relaxed text-paper/60">
          {review.body || "Khách chỉ chấm sao, không viết nhận xét."}
        </p>

        <Field label="Phản hồi công khai" error={error}>
          <Textarea
            autoFocus
            rows={5}
            value={reply}
            maxLength={600}
            placeholder="Cảm ơn bạn đã dành thời gian chia sẻ…"
            onChange={(event) => setReply(event.target.value)}
          />
        </Field>

        <p className="text-xs leading-relaxed text-paper/40">
          Phản hồi hiển thị ngay dưới đánh giá trên trang nhân viên và trong tài
          khoản của khách. Để trống để xoá phản hồi.
        </p>
      </form>
    </RightDrawer>
  );
}

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
            i <= value ? "fill-champagne text-champagne" : "text-paper/15",
          )}
        />
      ))}
    </span>
  );
}
