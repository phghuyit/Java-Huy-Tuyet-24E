"use client";
import * as React from "react";
import Link from "next/link";
import { dayName, formatDayMonth } from "@/lib/clock";
import { siteContent } from "@/data/site";
import { SuccessScreen } from "./success-screen";
import { appointmentService } from "@/services";

export function BookingResult({ code }) {
  const [apiAppointment, setApiAppointment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchAppointment() {
      try {
        const myAppts = await appointmentService.getMy().catch(() => []);
        const foundInMy = Array.isArray(myAppts)
          ? myAppts.find(
              (a) =>
                String(a.bookingCode || "").toUpperCase() === String(code || "").toUpperCase() ||
                String(a.id) === String(code),
            )
          : null;
        if (isMounted && foundInMy) {
          setApiAppointment(foundInMy);
          return;
        }
        if (/^\d+$/.test(String(code))) {
          const match = await appointmentService.getById(code);
          if (isMounted && match) setApiAppointment(match);
        }
      } catch (err) {
        console.warn("Could not query backend appointments:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAppointment();
    return () => { isMounted = false; };
  }, [code]);

  if (loading) {
    return (
      <p role="status" className="gutter py-20">
        Đang tải lịch hẹn…
      </p>
    );
  }

  if (apiAppointment) {
    const rawDate = apiAppointment.appointmentDate || new Date().toISOString().split("T")[0];
    const timeStart = (apiAppointment.timeStart || apiAppointment.startTime || "09:00").slice(0, 5);
    const servicesList = apiAppointment.services || apiAppointment.serviceDetails || [];
    const serviceName = servicesList.map((s) => s.name || s.serviceName).join(" + ") || "Dịch vụ làm đẹp VELA";

    return (
      <SuccessScreen
        booking={{
          status: apiAppointment.status || "PENDING",
          reference: apiAppointment.bookingCode || code,
          clientName: apiAppointment.customer?.fullName || apiAppointment.customerName || "Quý khách",
          dayName: dayName(rawDate),
          dayMonth: formatDayMonth(rawDate),
          isoDate: rawDate,
          time: timeStart,
          endTime: apiAppointment.timeEnd ? apiAppointment.timeEnd.slice(0, 5) : "10:00",
          durationMin: apiAppointment.totalDuration || 60,
          serviceLabel: serviceName,
          artistName: apiAppointment.staff?.fullName || apiAppointment.staff?.name || "Chuyên viên VELA",
          artistPortrait: (apiAppointment.staff?.avatarUrl && !apiAppointment.staff.avatarUrl.includes("placeholder"))
            ? apiAppointment.staff.avatarUrl
            : "/images/photo-1533933269825-da140ad3132f.jpg",
          total: Number(apiAppointment.totalAmount || apiAppointment.price || 0),
          address: siteContent.contact.addressLines.join(", "),
          mapsUrl: siteContent.contact.mapsUrl,
        }}
      />
    );
  }

  return (
    <main className="gutter flex min-h-dvh flex-col justify-center">
      <p className="eyebrow text-champagne">VELA · Đặt lịch</p>
      <h1 className="mt-6 font-display text-d2">Lịch hẹn #{code}</h1>
      <p className="mt-6 max-w-xl text-ink/60">
        Yêu cầu đặt lịch của bạn đã được ghi nhận trên hệ thống. Salon sẽ liên hệ để xác nhận lịch hẹn trong thời gian sớm nhất.
      </p>
      <div className="mt-8 flex gap-6">
        <Link href="/booking" className="underline underline-offset-4">
          Đặt lịch mới
        </Link>
        <Link href="/" className="underline underline-offset-4">
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
