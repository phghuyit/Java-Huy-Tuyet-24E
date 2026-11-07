"use client";
import * as React from "react";
import { toast } from "sonner";
import { Copy, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/clock";
import {
  CHANNEL_LABEL,
  NOTICE_META,
  outbox,
  outboxSummary,
} from "@/lib/notices";
import { initialSalonData } from "@/data";
import { appointmentService, userService, staffService } from "@/services";
import { AdminPage } from "./layout-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TODAY } from "@/lib/clock";
export function NoticesWorkspace() {
  const [appointments, setAppointments] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [kind, setKind] = React.useState("all");

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      appointmentService.getAll().catch(() => []),
      userService.getAll().catch(() => []),
      staffService.getAll().catch(() => []),
    ]).then(([appts, users, st]) => {
      if (!mounted) return;
      if (Array.isArray(appts)) setAppointments(appts);
      if (Array.isArray(users)) {
        setCustomers(
          users.map((u) => ({
            id: String(u.id),
            name: u.fullName || u.username || "Khách hàng",
            phone: u.phone || "",
            email: u.email || "",
          }))
        );
      }
      if (Array.isArray(st)) setStaff(st);
    });
    return () => { mounted = false; };
  }, []);

  const data = React.useMemo(() => {
    return {
      ...initialSalonData,
      customers: customers.length > 0 ? customers : initialSalonData.customers,
      staff: staff.length > 0 ? staff : initialSalonData.staff,
      appointments,
    };
  }, [appointments, customers, staff]);

  const all = outbox(data);
  const counts = outboxSummary(all);
  const rows =
    kind === "all" ? all : all.filter((notice) => notice.kind === kind);
  return (
    <AdminPage
      eyebrow="VELA · Liên lạc khách hàng"
      title="Thông báo cần gửi"
      description="Hàng đợi thông báo tự động cho khách hàng về lịch hẹn và trạng thái dịch vụ."
    >
      <p className="mb-8 border-l border-champagne pl-4 text-sm leading-relaxed text-paper/70">
        {all.length
          ? `${all.length} tin cần gửi, tính theo tình trạng lịch hẹn lúc ${formatLongDate(TODAY)}.`
          : "Không có tin nào cần gửi."}
        <span className="mt-1 block text-xs text-paper/45">
          Danh sách tự động cập nhật theo trạng thái xử lý lịch hẹn và thanh
          toán.
        </span>
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        <Chip active={kind === "all"} onClick={() => setKind("all")}>
          Tất cả · {all.length}
        </Chip>
        {Object.keys(NOTICE_META)
          .filter((key) => counts[key])
          .map((key) => (
            <Chip key={key} active={kind === key} onClick={() => setKind(key)}>
              {NOTICE_META[key].label} · {counts[key]}
            </Chip>
          ))}
      </div>

      <div className="divide-y divide-paper/10 border-y border-paper/10">
        {rows.map((notice) => (
          <NoticeRow key={notice.id} notice={notice} />
        ))}
      </div>

      {!rows.length ? (
        <p
          role="status"
          className="border-y border-paper/10 py-12 text-center text-sm text-paper/50"
        >
          Không có tin nào trong nhóm này.
        </p>
      ) : null}
    </AdminPage>
  );
}
function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-3 py-2 text-xs transition-colors",
        active
          ? "border-champagne bg-champagne/10 text-champagne"
          : "border-paper/15 text-paper/55 hover:border-paper/40 hover:text-paper",
      )}
    >
      {children}
    </button>
  );
}
function NoticeRow({ notice }) {
  const meta = NOTICE_META[notice.kind];
  const Icon = notice.channel === "email" ? Mail : MessageSquare;
  async function copy() {
    try {
      await navigator.clipboard.writeText(notice.body);
      toast.success(`Đã sao chép tin cho ${notice.to}`);
    } catch {
      toast.error("Trình duyệt không cho sao chép. Hãy bôi đen và copy tay.");
    }
  }
  return (
    <article className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm">{notice.to}</h2>
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span className="flex items-center gap-1.5 text-xs text-paper/40">
              <Icon className="size-3" />
              {CHANNEL_LABEL[notice.channel]}
            </span>
          </div>

          <p className="mt-2.5 text-xs text-paper/40">
            {notice.channel === "email" ? notice.email : notice.phone} ·{" "}
            {notice.reason}
          </p>

          <p className="mt-3.5 max-w-[72ch] border-l border-paper/15 pl-4 text-sm leading-relaxed text-paper/75">
            {notice.body}
          </p>
        </div>

        <Button size="sm" variant="ghostLight" onClick={copy}>
          <Copy className="size-3" />
          Sao chép
        </Button>
      </div>
    </article>
  );
}
