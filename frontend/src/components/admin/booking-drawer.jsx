"use client";
import * as React from "react";
import { toast } from "sonner";
import { availableSlots, qualifiedStaff, resolveStaff } from "@/lib/salon";
import { bookingDetailsSchema } from "@/lib/booking-schema";
import { TODAY, durationLabel, formatMediumDate } from "@/lib/clock";
import { currency } from "@/lib/format";
import { RightDrawer } from "@/components/ui/right-drawer";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { AdminSelect, FormError } from "./form-kit";
import { initialSalonData } from "@/data";
import { appointmentService, nailService, staffService, userService } from "@/services";
function generateBookingCode() {
  return `VELA-${Date.now().toString().slice(-6)}`;
}

export function NewBookingButton({ customerId, label = "Tạo lịch hẹn" }) {
  return (
    <Button
      variant="champagne"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("vela:new-booking", { detail: { customerId } }),
        )
      }
    >
      {label}
    </Button>
  );
}
export function BookingDrawer({
  open,
  onClose,
  customerId: initialCustomerId,
}) {
  const [customers, setCustomers] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      userService.getAll().catch(() => []),
      nailService.getAll().catch(() => []),
      staffService.getAll().catch(() => []),
      appointmentService.getAll().catch(() => []),
    ]).then(([users, svcs, st, appts]) => {
      if (!mounted) return;
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
      if (Array.isArray(svcs)) setServices(svcs);
      if (Array.isArray(st)) setStaff(st);
      if (Array.isArray(appts)) setAppointments(appts);
    });
    return () => { mounted = false; };
  }, []);

  const salonData = React.useMemo(() => ({
    ...initialSalonData,
    customers,
    services,
    staff,
    appointments,
  }), [customers, services, staff, appointments]);

  const activeServicesList = React.useMemo(() => {
    return services.filter((s) => s.active !== false);
  }, [services]);

  const initial = customers.find((item) => String(item.id) === String(initialCustomerId));
  const [customerId, setCustomerId] = React.useState(initial?.id ?? "new");
  const [name, setName] = React.useState(initial?.name ?? "");
  const [phone, setPhone] = React.useState(initial?.phone ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [note, setNote] = React.useState("");
  const [serviceIds, setServiceIds] = React.useState([]);
  const [staffId, setStaffId] = React.useState("any");
  const [date, setDate] = React.useState(TODAY);
  const [time, setTime] = React.useState("");
  const [preview, setPreview] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const basket = serviceIds
    .map((id) => activeServicesList.find((item) => String(item.id) === String(id)))
    .filter(Boolean);
  const duration = basket.reduce((sum, item) => sum + (item.durationMin || item.durationMinutes || 45), 0);
  const listPrice = basket.reduce((sum, item) => sum + (item.price || 0), 0);
  const artists = qualifiedStaff(salonData, serviceIds);
  const slots = basket.length
    ? availableSlots(salonData, date, staffId, duration, serviceIds).filter(
        (slot) => slot.available,
      )
    : [];
  const assigned = basket.length
    ? resolveStaff(salonData, serviceIds, staffId, date, time, duration)
    : null;

  function toggleService(id) {
    const next = serviceIds.includes(id)
      ? serviceIds.filter((item) => item !== id)
      : [...serviceIds, id];
    setServiceIds(next);
    setStaffId("any");
    setTime("");
  }
  function review(event) {
    event.preventDefault();
    const valid = bookingDetailsSchema.safeParse({ name, phone, email, note });
    if (!valid.success) {
      setError(valid.error.issues[0].message);
      return;
    }
    if (!basket.length || !assigned) {
      setError("Chọn dịch vụ, nhân viên và giờ trống hợp lệ.");
      return;
    }
    setError("");
    setPreview(true);
  }
  async function create() {
    if (saving) return;
    setSaving(true);
    try {
      const bookingCode = generateBookingCode();
      const parsedCustomerId = customerId && /^\d+$/.test(String(customerId)) ? parseInt(String(customerId), 10) : null;
      const parsedStaffId = assigned?.id && /^\d+$/.test(String(assigned.id)) ? parseInt(String(assigned.id), 10) : (assigned?.id ?? 1);

      await appointmentService.create({
        bookingCode,
        customerId: parsedCustomerId,
        staffId: parsedStaffId,
        appointmentDate: date,
        timeStart: time,
        fullName: name,
        phone,
        email,
        note,
        totalDuration: duration,
        price: listPrice,
        subTotal: listPrice,
        totalAmount: listPrice,
        status: "PENDING",
        serviceIds,
      });

      toast.success("Đã tạo lịch hẹn", {
        description: `${bookingCode} · Chờ xác nhận`,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tạo lịch hẹn.",
      );
      setPreview(false);
    } finally {
      setSaving(false);
    }
  }
  return (
    <RightDrawer
      open={open}
      onOpenChange={(value) => !value && onClose()}
      title={preview ? "Xác nhận lịch hẹn" : "Tạo lịch hẹn"}
      eyebrow="VELA · Lịch hẹn"
      footer={
        preview ? (
          <div className="flex gap-2">
            <Button
              variant="champagne"
              disabled={saving || !assigned}
              onClick={create}
            >
              {saving ? "Đang lưu…" : "Xác nhận tạo lịch"}
            </Button>
            <Button variant="ghostLight" onClick={() => setPreview(false)}>
              Chỉnh sửa
            </Button>
          </div>
        ) : (
          <Button variant="champagne" type="submit" form="admin-booking">
            Kiểm tra lịch hẹn
          </Button>
        )
      }
    >
      {preview ? (
        <div>
          <dl className="space-y-4">
            {[
              ["Khách hàng", name],
              ["Điện thoại", phone],
              ["Email", email],
              ["Dịch vụ", basket.map((item) => item.name).join(" + ")],
              ["Nhân viên", assigned?.name],
              ["Ngày và giờ", `${formatMediumDate(date)} · ${time}`],
              ["Thời lượng", durationLabel(duration)],
              ["Giá", currency(listPrice)],
              ["Ghi chú", note || "Không có ghi chú"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-wrap justify-between gap-3 border-b border-paper/10 pb-3"
              >
                <dt className="text-paper/40">{label}</dt>
                <dd className="max-w-full break-words">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[0.875rem] text-paper/50">
            Lịch mới được tạo ở trạng thái Chờ xác nhận.
          </p>
        </div>
      ) : (
        <form
          id="admin-booking"
          onSubmit={review}
          noValidate
          className="space-y-6"
        >
          <Field label="Khách hàng">
            <AdminSelect
              value={customerId}
              onChange={(event) => {
                setCustomerId(event.target.value);
                const customer = customers.find(
                  (item) => String(item.id) === String(event.target.value),
                );
                setName(customer?.name ?? "");
                setPhone(customer?.phone ?? "");
                setEmail(customer?.email ?? "");
              }}
            >
              <option value="new">Khách mới</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} · {customer.phone}
                </option>
              ))}
            </AdminSelect>
          </Field>
          <Field label="Họ tên *">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Nguyễn Minh Anh"
            />
          </Field>
          <Field label="Điện thoại *">
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              placeholder="0901234567"
            />
          </Field>
          <Field label="Email *">
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="ban@example.com"
            />
          </Field>
          <fieldset>
            <legend className="text-sm">Dịch vụ *</legend>
            <p className="mb-2 text-xs text-paper/40">
              Chọn nhiều dịch vụ nếu khách làm liền trong một lượt.
            </p>
            <div className="thin-scrollbar max-h-56 overflow-y-auto border border-paper/10 px-3">
              {activeServicesList.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-champagne"
                    checked={serviceIds.includes(item.id)}
                    onChange={() => toggleService(item.id)}
                  />
                  {item.name}
                  <span className="ml-auto text-xs tabular text-paper/45">
                    {currency(item.price)} · {item.durationMin || item.durationMinutes || 45}p
                  </span>
                </label>
              ))}
            </div>
            {basket.length > 1 && (
              <p className="mt-2 text-xs text-champagne">
                {basket.length} dịch vụ · {durationLabel(duration)} ·{" "}
                {currency(listPrice)}
              </p>
            )}
          </fieldset>
          <Field label="Nhân viên *">
            <AdminSelect
              value={staffId}
              onChange={(event) => {
                setStaffId(event.target.value);
                setTime("");
              }}
            >
              <option value="any">Nhân viên phù hợp còn trống</option>
              {artists.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </AdminSelect>
          </Field>
          <Field label="Ngày hẹn *">
            <Input
              type="date"
              value={date}
              min={TODAY}
              onChange={(event) => {
                setDate(event.target.value);
                setTime("");
              }}
            />
          </Field>
          <Field label="Giờ hẹn *">
            <AdminSelect
              value={time}
              onChange={(event) => setTime(event.target.value)}
            >
              <option value="">Chọn giờ trống</option>
              {slots.map((slot) => (
                <option key={slot.time} value={slot.time}>
                  {slot.time}
                </option>
              ))}
            </AdminSelect>
          </Field>
          {basket.length > 0 && !slots.length && (
            <p className="text-[0.8125rem] text-paper/45">
              Không còn giờ phù hợp. Chọn ngày hoặc nhân viên khác.
            </p>
          )}
          <Field label="Ghi chú của khách">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
            />
          </Field>
        </form>
      )}
      <div className="mt-6">
        <FormError message={error} />
      </div>
    </RightDrawer>
  );
}
