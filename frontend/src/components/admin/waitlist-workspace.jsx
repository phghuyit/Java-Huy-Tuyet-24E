"use client";
import * as React from "react";
import { toast } from "sonner";
import Link from "next/link";
import { CalendarClock, Check, Hourglass, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMediumDate } from "@/lib/clock";
import { waitlistOpenings, waitlistRows, windowLabel } from "@/lib/waitlist";
import { initialSalonData } from "@/data";
import { appointmentService, nailService, staffService, waitlistService } from "@/services";
import { AdminPage } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { TODAY } from "@/lib/clock";
function generateWaitlistCode() {
  return `VELA-${Date.now().toString().slice(-6)}`;
}

export function WaitlistWorkspace() {
  const [appointments, setAppointments] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [waitlistList, setWaitlistList] = React.useState([]);

  const loadWaitlist = React.useCallback(async () => {
    let localItems = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vela_waitlist");
        if (raw) localItems = JSON.parse(raw);
        if (!Array.isArray(localItems)) localItems = [];
      } catch (_) {}
    }

    let backendItems = [];
    try {
      const res = await waitlistService.getAll();
      if (Array.isArray(res)) {
        backendItems = res.map((item) => ({
          id: String(item.id),
          customerId: item.customerId ? String(item.customerId) : null,
          name: item.name,
          phone: item.phone,
          email: item.email || "",
          serviceId: item.serviceId ? String(item.serviceId) : null,
          staffId: item.staffId ? String(item.staffId) : "any",
          date: item.desiredDate ? String(item.desiredDate).slice(0, 10) : TODAY,
          fromTime: item.fromTime ? String(item.fromTime).slice(0, 5) : null,
          toTime: item.toTime ? String(item.toTime).slice(0, 5) : null,
          note: item.note || "",
          status: item.status || "WAITING",
          createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Could not load waitlist from backend:", err);
    }

    const combined = [...backendItems];
    localItems.forEach((local) => {
      const targetDate = local.date || local.desiredDate || TODAY;
      const exists = combined.some(
        (b) => String(b.id) === String(local.id) || (b.phone === local.phone && b.date === targetDate)
      );
      if (!exists) {
        combined.push({
          id: String(local.id),
          customerId: local.customerId ? String(local.customerId) : null,
          name: local.name,
          phone: local.phone,
          email: local.email || "",
          serviceId: local.serviceId ? String(local.serviceId) : null,
          staffId: local.staffId ? String(local.staffId) : "any",
          date: targetDate,
          fromTime: local.fromTime ? String(local.fromTime).slice(0, 5) : null,
          toTime: local.toTime ? String(local.toTime).slice(0, 5) : null,
          note: local.note || "",
          status: local.status || "WAITING",
          createdAt: local.createdAt ? String(local.createdAt) : new Date().toISOString(),
        });
      }
    });

    setWaitlistList(combined);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      appointmentService.getAll().catch(() => []),
      nailService.getAll().catch(() => []),
      staffService.getAll().catch(() => []),
    ]).then(([appts, svcs, st]) => {
      if (!mounted) return;
      if (Array.isArray(appts)) setAppointments(appts);
      if (Array.isArray(svcs)) {
        const mappedSvcs = svcs.map((s) => ({
          ...s,
          id: String(s.id),
          name: s.name,
          durationMin: s.durationMinutes || s.durationMin || 45,
          active: s.status !== "INACTIVE",
        }));
        setServices(mappedSvcs);
      }
      if (Array.isArray(st)) {
        const mappedStaff = st.map((member) => ({
          ...member,
          id: String(member.id),
          name: member.fullName || member.name || "Chuyên viên VELA",
          active: member.status !== "INACTIVE",
        }));
        setStaff(mappedStaff);
      }
    });
    loadWaitlist();

    const handleStorageChange = () => {
      if (mounted) loadWaitlist();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vela:waitlist_updated", handleStorageChange);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vela:waitlist_updated", handleStorageChange);
    };
  }, [loadWaitlist]);

  const handleBookSuccess = async (entryId) => {
    try {
      await waitlistService.delete(entryId);
    } catch (_) {}
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vela_waitlist");
        if (raw) {
          const list = JSON.parse(raw).filter((e) => String(e.id) !== String(entryId));
          localStorage.setItem("vela_waitlist", JSON.stringify(list));
        }
      } catch (_) {}
    }
    loadWaitlist();
  };

  const handleClose = async (entryId) => {
    try {
      await waitlistService.delete(entryId);
    } catch (_) {}
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vela_waitlist");
        if (raw) {
          const list = JSON.parse(raw).filter((e) => String(e.id) !== String(entryId));
          localStorage.setItem("vela_waitlist", JSON.stringify(list));
        }
      } catch (_) {}
    }
    loadWaitlist();
  };

  const data = React.useMemo(() => ({
    services,
    staff,
    waitlist: waitlistList,
    appointments,
  }), [services, staff, waitlistList, appointments]);

  const rows = waitlistRows(data);
  const ready = rows.filter((row) => row.openings.length).length;
  return (
    <AdminPage
      eyebrow="VELA · Danh sách chờ"
      title="Danh sách chờ"
      description="Khách muốn một khung giờ salon chưa có. Không giữ chỗ — hệ thống đối chiếu lại với lịch trống mỗi lần mở trang."
    >
      <p className="mb-8 border-l border-champagne pl-4 text-sm leading-relaxed text-paper/70">
        {ready
          ? `${ready}/${rows.length} mục đã có chỗ trống phù hợp. Gọi xác nhận với khách rồi bấm giờ để tạo lịch hẹn.`
          : `${rows.length} mục đang chờ, hiện chưa mục nào có chỗ. Khi một lịch hẹn bị hủy, các mục khớp sẽ hiện giờ trống ngay tại đây.`}
      </p>

      <div className="divide-y divide-paper/10 border-y border-paper/10">
        {rows.map((row) => (
          <WaitlistCard
            key={row.entry.id}
            row={row}
            services={services}
            staff={staff}
            onBookSuccess={handleBookSuccess}
            onClose={handleClose}
          />
        ))}
      </div>

      {!rows.length ? (
        <p
          role="status"
          className="border-y border-paper/10 py-12 text-center text-sm text-paper/50"
        >
          Danh sách chờ đang trống.
        </p>
      ) : null}
    </AdminPage>
  );
}
function WaitlistCard({ row, services = [], staff = [], onBookSuccess, onClose }) {
  const { entry, openings } = row;
  const service = services.find((item) => String(item.id) === String(entry.serviceId));
  const member = staff.find((item) => String(item.id) === String(entry.staffId));
  async function book(time) {
    try {
      const code = generateWaitlistCode();
      const stId = entry.staffId && entry.staffId !== "any" ? Number(entry.staffId) : (staff[0]?.id || 1);
      const svcId = Number(entry.serviceId) || (services[0]?.id || 1);
      await appointmentService.create({
        bookingCode: code,
        staffId: stId,
        customerId: entry.customerId ? Number(entry.customerId) : null,
        customerName: entry.name,
        customerPhone: entry.phone,
        customerEmail: entry.email,
        appointmentDate: entry.date,
        timeStart: time,
        note: entry.note || "Đặt từ danh sách chờ",
        serviceIds: [svcId],
      });
      if (typeof onBookSuccess === "function") {
        onBookSuccess(entry.id);
      }
      toast.success(
        `Đã tạo lịch ${code} lúc ${time} cho ${entry.name}`,
      );
    } catch (cause) {
      toast.error(
        cause?.response?.data?.message || cause?.message || "Không tạo được lịch hẹn.",
      );
    }
  }
  function close() {
    try {
      if (typeof onClose === "function") {
        onClose(entry.id);
      }
      toast.success(`Đã bỏ ${entry.name} khỏi danh sách chờ`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không bỏ được.");
    }
  }
  return (
    <article className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm">{entry.name}</h2>
            <span
              className={cn(
                "border px-2 py-0.5 text-[0.625rem] uppercase tracking-[0.15em]",
                openings.length
                  ? "border-signal-live/50 text-signal-live"
                  : "border-paper/20 text-paper/40",
              )}
            >
              {openings.length ? `${openings.length} chỗ trống` : "Chưa có chỗ"}
            </span>
          </div>

          <p className="mt-2.5 text-sm text-paper/70">
            {service?.name ?? "—"} ·{" "}
            {entry.staffId === "any"
              ? "Nhân viên bất kỳ"
              : (member?.name ?? "—")}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-paper/45">
            <CalendarClock className="size-3" />
            {formatMediumDate(entry.date)} · {windowLabel(entry)}
          </p>
          <p className="mt-1.5 text-xs text-paper/40">
            {entry.phone} · {entry.email}
            {entry.customerId ? " · có tài khoản" : " · khách vãng lai"}
          </p>
          {entry.note ? (
            <p className="mt-2.5 max-w-[60ch] border-l border-paper/15 pl-3 text-xs italic leading-relaxed text-paper/55">
              “{entry.note}”
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={close}
          aria-label={`Bỏ ${entry.name} khỏi danh sách chờ`}
          className="shrink-0 p-1.5 text-paper/25 transition-colors hover:text-signal-stop"
        >
          <X className="size-4" />
        </button>
      </div>

      {openings.length ? (
        <div className="mt-4">
          <p className="mb-2.5 text-xs text-paper/45">
            Bấm một giờ để tạo lịch hẹn ngay:
          </p>
          <div className="flex flex-wrap gap-2">
            {openings.slice(0, 12).map((slot) => (
              <Button
                key={slot.time}
                size="sm"
                variant="champagne"
                onClick={() => book(slot.time)}
              >
                <Check className="size-3" />
                {slot.time}
              </Button>
            ))}
            {openings.length > 12 ? (
              <span className="self-center text-xs text-paper/35">
                +{openings.length - 12} giờ khác
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
export function WaitlistAlert() {
  const [appointments, setAppointments] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [staff, setStaff] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      appointmentService.getAll().catch(() => []),
      nailService.getAll().catch(() => []),
      staffService.getAll().catch(() => []),
    ]).then(([appts, svcs, st]) => {
      if (!mounted) return;
      if (Array.isArray(appts)) setAppointments(appts);
      if (Array.isArray(svcs)) {
        setServices(
          svcs.map((s) => ({
            ...s,
            id: String(s.id),
            name: s.name,
            durationMin: s.durationMinutes || s.durationMin || 45,
            active: s.status !== "INACTIVE",
          }))
        );
      }
      if (Array.isArray(st)) {
        setStaff(
          st.map((member) => ({
            ...member,
            id: String(member.id),
            name: member.fullName || member.name || "Chuyên viên VELA",
            active: member.status !== "INACTIVE",
          }))
        );
      }
    });
    return () => { mounted = false; };
  }, []);

  const data = React.useMemo(() => {
    let waitlistList = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vela_waitlist");
        if (stored) waitlistList = JSON.parse(stored);
      } catch (_) {}
    }
    return {
      services,
      staff,
      waitlist: waitlistList,
      appointments,
    };
  }, [appointments, services, staff]);

  const ready = waitlistOpenings(data);
  if (!ready.length) return null;
  return (
    <Link
      href="/admin/waitlist"
      className="flex flex-wrap items-center justify-between gap-4 border border-signal-live/30 bg-signal-live/[0.06] px-5 py-4 transition-colors hover:bg-signal-live/[0.1]"
    >
      <span className="flex items-center gap-3">
        <Hourglass className="size-4 text-signal-live" />
        <span className="text-sm">
          {ready.length} khách trong danh sách chờ đã có chỗ trống
          <span className="mt-1 block text-xs text-paper/50">
            {ready
              .slice(0, 3)
              .map((row) => row.entry.name)
              .join(" · ")}
            {ready.length > 3 ? ` · +${ready.length - 3}` : ""}
          </span>
        </span>
      </span>
      <span className="text-xs text-champagne underline underline-offset-4">
        Mở danh sách chờ →
      </span>
    </Link>
  );
}
