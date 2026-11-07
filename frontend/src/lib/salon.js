import {
  NOW_TIME,
  TODAY,
  fromMinutes,
  parseDate,
  toDateKey,
  toMinutes,
} from "./clock";

export const STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["IN_SERVICE"],
  IN_SERVICE: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export const isDateKey = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && toDateKey(parseDate(value)) === value;

export const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const normalizePhone = (phone) =>
  String(phone || "").replace(/^\+84/, "0").replace(/\D/g, "");

export const appointmentStamp = (appointment) =>
  `${appointment.appointmentDate}T${(appointment.startTime || appointment.timeStart || "09:00").slice(0, 5)}`;

export function appointmentViews(data) {
  const customers = data.customers || [];
  const staff = data.staff || [];
  const allServices = data.services || [];

  return (data.appointments || [])
    .flatMap((appointment) => {
      const customer = customers.find(
        (item) => String(item.id) === String(appointment.customerId),
      ) || {
        id: appointment.customerId,
        name:
          appointment.customerName ||
          appointment.customer?.fullName ||
          "Khách hàng",
        phone: appointment.customerPhone || appointment.phone || "",
        email: appointment.customerEmail || appointment.email || "",
      };

      const artist = staff.find(
        (item) => String(item.id) === String(appointment.staffId),
      ) ||
        staff[0] || {
          id: appointment.staffId,
          name:
            appointment.staff?.fullName ||
            appointment.staff?.name ||
            "Chuyên viên VELA",
        };

      let services = (appointment.serviceIds || [])
        .map((id) => allServices.find((item) => String(item.id) === String(id)))
        .filter(Boolean);

      if (
        services.length === 0 &&
        Array.isArray(appointment.services) &&
        appointment.services.length > 0
      ) {
        services = appointment.services.map((as) => ({
          id: String(as.serviceId || as.id),
          name: as.serviceName || as.name || "Dịch vụ VELA",
          price: Number(as.price || 0),
        }));
      }

      const finalServices =
        services.length > 0
          ? services
          : [
              {
                id: "svc-default",
                name: "Dịch vụ VELA",
                price: Number(
                  appointment.subTotal ||
                    appointment.price ||
                    appointment.totalPrice ||
                    appointment.totalAmount ||
                    0,
                ),
              },
            ];

      const servicesPriceSum = finalServices.reduce(
        (sum, item) => sum + (Number(item.price) || 0),
        0,
      );

      const resolvedDiscount = Number(
        appointment.discountAmount ?? appointment.discount ?? 0,
      );

      const resolvedSubTotal =
        Number(
          appointment.subTotal ??
            appointment.price ??
            appointment.totalPrice ??
            (appointment.totalAmount != null && resolvedDiscount > 0
              ? Number(appointment.totalAmount) + resolvedDiscount
              : appointment.totalAmount) ??
            servicesPriceSum,
        ) || 0;

      const resolvedTotalAmount =
        appointment.totalAmount != null
          ? Number(appointment.totalAmount)
          : Math.max(0, resolvedSubTotal - resolvedDiscount);

      appointment.subTotal = resolvedSubTotal;
      appointment.price = resolvedSubTotal;
      appointment.discount = resolvedDiscount;
      appointment.discountAmount = resolvedDiscount;
      appointment.totalAmount = resolvedTotalAmount;

      let promoCode = appointment.promotionCode || appointment.couponCode || "";
      if (!promoCode && appointment.couponId && Array.isArray(data.coupons)) {
        const foundC = data.coupons.find(
          (c) => String(c.id) === String(appointment.couponId),
        );
        if (foundC) promoCode = foundC.code;
      }
      appointment.promotionCode = promoCode;

      const startTime = (
        appointment.startTime ||
        appointment.timeStart ||
        "09:00"
      ).slice(0, 5);

      const endTime = (
        appointment.endTime ||
        appointment.timeEnd ||
        "10:00"
      ).slice(0, 5);

      const durationMin =
        appointment.durationMinutes || appointment.totalDuration || 45;
      appointment.durationMinutes = durationMin;
      appointment.totalDuration = durationMin;

      return [
        {
          appointment,
          customer,
          artist,
          services: finalServices,
          date: appointment.appointmentDate,
          startTime,
          endTime,
          durationMin,
          serviceLabel: finalServices.map((item) => item.name).join(" + "),
        },
      ];
    })
    .sort((a, b) =>
      appointmentStamp(b.appointment).localeCompare(
        appointmentStamp(a.appointment),
      ),
    );
}

export function activeServices(data) {
  return (data.services || [])
    .filter(
      (service) =>
        service.active &&
        (!data.categories ||
          data.categories.some(
            (category) =>
              category.slug === service.categorySlug && category.active,
          )),
    );
}

export function qualifiedStaff(data, serviceIds) {
  return (data.staff || []).filter((member) => member.active !== false);
}

export function awaitingReview(data, customerId) {
  return (data.appointments || [])
    .filter(
      (item) =>
        String(item.customerId) === String(customerId) &&
        item.status === "COMPLETED" &&
        !(data.reviews || []).some((review) => String(review.appointmentId) === String(item.id)),
    )
    .sort((x, y) => appointmentStamp(y).localeCompare(appointmentStamp(x)));
}

export function availableSlots(
  data,
  date,
  staffId,
  duration = 30,
  serviceIds = [],
  excludeId,
) {
  if (!isDateKey(date) || date < TODAY) return [];
  const openMin = 7 * 60;
  const closeMin = 22 * 60;

  const candidates = qualifiedStaff(data, serviceIds).filter(
    (member) => !staffId || staffId === "any" || String(member.id) === String(staffId),
  );
  if (!candidates.length) return [];

  const booked = (data.appointments || []).filter(
    (item) =>
      (excludeId == null || item.id == null || String(item.id) !== String(excludeId)) &&
      item.appointmentDate === date &&
      item.status !== "CANCELLED" &&
      item.status !== "NO_SHOW",
  );

  const slots = [];
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  for (let start = openMin; start < closeMin; start += 30) {
    const slotEnd = start + duration;

    const past = date === TODAY && start <= currentMin + 15;
    const exceedsClosing = slotEnd > closeMin;

    let free = false;
    for (const member of candidates) {
      const hasOverlap = booked.some((item) => {
        if (String(item.staffId) !== String(member.id)) return false;
        const aStart = toMinutes(item.startTime || item.timeStart);
        const aDur = Number(item.totalDuration || item.durationMinutes || 30);
        const aEnd = item.endTime || item.timeEnd ? toMinutes(item.endTime || item.timeEnd) : aStart + aDur;
        return start < aEnd && slotEnd > aStart;
      });

      if (!hasOverlap) {
        free = true;
        break;
      }
    }

    slots.push({
      time: fromMinutes(start),
      available: free && !past && !exceedsClosing,
      reason: past ? "past" : exceedsClosing ? "closing" : free ? undefined : "booked",
    });
  }
  return slots;
}

export function resolveStaff(
  data,
  serviceIds,
  staffId,
  date,
  time,
  duration,
  excludeId,
) {
  return qualifiedStaff(data, serviceIds).find(
    (member) =>
      (!staffId || staffId === "any" || String(member.id) === String(staffId)) &&
      availableSlots(
        data,
        date,
        member.id,
        duration,
        serviceIds,
        excludeId,
      ).some((slot) => slot.time === time && slot.available),
  );
}

export function customerStats(data, id) {
  const history = (data.appointments || []).filter(
    (item) => String(item.customerId) === String(id),
  );
  const completed = history.filter((item) => item.status === "COMPLETED");
  const noShow = history.filter((item) => item.status === "NO_SHOW");
  const cancelled = history.filter((item) => item.status === "CANCELLED");
  const settled = completed.length + noShow.length + cancelled.length;

  return {
    totalAppointments: history.length,
    completed: completed.length,
    noShow: noShow.length,
    cancelled: cancelled.length,
    noShowRate: settled ? (noShow.length / settled) * 100 : 0,
    lastAppointment:
      [...history].sort((a, b) =>
        appointmentStamp(b).localeCompare(appointmentStamp(a)),
      )[0]?.appointmentDate ?? null,
    totalSpend: completed.reduce(
      (sum, item) => sum + Number(item.totalAmount || item.price || 0),
      0,
    ),
  };
}

export function unreliable(stats) {
  return stats.noShow >= 2 || (stats.noShow >= 1 && stats.noShowRate >= 25);
}
