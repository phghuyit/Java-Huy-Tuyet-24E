"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { initialSalonData } from "@/data";
import { customerStats, unreliable, appointmentViews } from "@/lib/salon";
import { TODAY, formatMediumDate } from "@/lib/clock";
import { currency } from "@/lib/format";
import { AdminPage, Panel } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RightDrawer } from "@/components/ui/right-drawer";
import { AdminSelect, FormError } from "./form-kit";
import { AppointmentDrawer } from "./appointment-drawer";
import { NewBookingButton } from "./booking-drawer";
import { userService, appointmentService } from "@/services";
import {
  linkClass,
  Empty,
  Search,
  Pagination,
  AppointmentRows,
} from "./workspace";

export function CustomersWorkspace() {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState("name");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [customers, setCustomers] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);

  React.useEffect(() => {
    setPage(1);
  }, [search, sort]);

  const loadData = React.useCallback(async () => {
    try {
      const [usersData, apptsData] = await Promise.all([
        userService.getAll().catch(() => []),
        appointmentService.getAll().catch(() => []),
      ]);
      if (Array.isArray(usersData)) {
        const filtered = usersData
          .filter((u) => !u.role || u.role.code === "CUSTOMER")
          .map((u) => ({
            id: String(u.id),
            name: u.fullName || u.username || u.name || "Khách hàng",
            phone: u.phone || "Chưa cập nhật",
            email: u.email || "",
            createdAt: u.createdAt ? String(u.createdAt).slice(0, 10) : TODAY,
            notes: u.notes || "",
          }));
        setCustomers(filtered);
      }
      if (Array.isArray(apptsData)) {
        setAppointments(apptsData);
      }
    } catch {
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const salonData = React.useMemo(() => ({
    ...initialSalonData,
    customers,
    appointments,
  }), [customers, appointments]);

  const rows = customers
    .filter((c) =>
      `${c.name} ${c.phone} ${c.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "vi")
        : customerStats(salonData, b.id).totalAppointments -
          customerStats(salonData, a.id).totalAppointments,
    );
  return (
    <AdminPage
      eyebrow="VELA · Hồ sơ khách"
      title="Khách hàng"
      description="Hồ sơ được tạo hoặc cập nhật khi đặt lịch, đối chiếu theo điện thoại và email."
    >
      <div className="mb-8 flex flex-wrap gap-5">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Tìm tên, điện thoại hoặc email…"
        />
        <Field label="Sắp xếp">
          <AdminSelect
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="name">Theo tên</option>
            <option value="visits">Số lịch hẹn</option>
          </AdminSelect>
        </Field>
      </div>
      <div className="divide-y divide-paper/10 border-y border-paper/10">
        {rows.slice((page - 1) * pageSize, page * pageSize).map((customer) => {
          const stats = customerStats(salonData, customer.id);
          return (
            <Link
              key={customer.id}
              href={`/admin/customers/${customer.id}`}
              className="flex flex-wrap items-center justify-between gap-4 py-5 hover:bg-paper/[0.04]"
            >
              <div>
                <p className="flex flex-wrap items-center gap-2.5">
                  {customer.name}
                  {unreliable(stats) && (
                    <span className="border border-signal-warn/40 px-2 py-0.5 text-[0.625rem] uppercase tracking-[0.15em] text-signal-warn">
                      {stats.noShow} lần không đến
                    </span>
                  )}
                </p>
                <p className="mt-2 break-all text-xs text-paper/50">
                  {customer.phone} · {customer.email}
                </p>
              </div>
              <div className="text-right text-xs text-paper/50">
                <p>{stats.totalAppointments} lịch hẹn</p>
                <p className="mt-2">
                  Lịch gần nhất:{" "}
                  {stats.lastAppointment
                    ? formatMediumDate(stats.lastAppointment)
                    : "Chưa có"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {!rows.length && <Empty />}
      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={rows.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemLabel="khách hàng"
      />
    </AdminPage>
  );
}

export function CustomerDetail({ id }) {
  const [customer, setCustomer] = React.useState(null);
  const [appointments, setAppointments] = React.useState([]);
  const [editing, setEditing] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const loadData = React.useCallback(async () => {
    try {
      const [u, appts] = await Promise.all([
        /^\d+$/.test(String(id)) ? userService.getById(id).catch(() => null) : null,
        appointmentService.getAll().catch(() => []),
      ]);
      if (u) {
        setCustomer({
          id: String(u.id),
          name: u.fullName || u.username || "Khách hàng",
          phone: u.phone || "",
          email: u.email || "",
          createdAt: u.createdAt ? String(u.createdAt) : TODAY,
          note: u.note || "",
        });
      }
      if (Array.isArray(appts)) {
        setAppointments(appts);
      }
    } catch {
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const salonData = React.useMemo(() => ({
    ...initialSalonData,
    customers: customer ? [customer] : [],
    appointments,
  }), [customer, appointments]);

  if (!customer)
    return (
      <AdminPage title="Không tìm thấy khách hàng">
        <Link className={linkClass} href="/admin/customers">
          Về danh sách khách hàng
        </Link>
      </AdminPage>
    );
  const stats = customerStats(salonData, id);
  const history = appointmentViews(salonData)
    .filter((v) => String(v.customer.id) === String(id))
    .reverse();
  return (
    <AdminPage
      eyebrow="VELA · Hồ sơ khách"
      title={customer.name}
      actions={
        <>
          <Button variant="outlineLight" onClick={() => setEditing(true)}>
            Chỉnh sửa hồ sơ
          </Button>
          <NewBookingButton customerId={id} />
        </>
      }
    >
      <Link className={linkClass} href="/admin/customers">
        ← Khách hàng
      </Link>
      <div className="my-8 grid gap-8 md:grid-cols-2">
        <Panel title="Thông tin khách">
          <p className="break-all">
            {customer.phone} · {customer.email}
          </p>
          <p className="mt-4 text-sm text-paper/50">
            {customer.note || "Chưa có ghi chú."}
          </p>
          <p className="mt-4 text-xs text-paper/40">
            Ngày tạo: {formatMediumDate(customer.createdAt.slice(0, 10))}
          </p>
        </Panel>
        <Panel title="Lịch sử sử dụng">
          <p className="text-sm">
            {stats.totalAppointments} lịch hẹn · {stats.completed} đã hoàn thành
          </p>
          <p className="mt-4 font-display text-3xl text-champagne">
            {currency(stats.totalSpend)}
          </p>
          <p className="mt-2 text-xs text-paper/40">
            Tổng tiền khách đã trả cho các lịch hoàn thành
          </p>
          <dl className="mt-5 space-y-2 border-t border-paper/10 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-paper/40">Đã hủy</dt>
              <dd>{stats.cancelled}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-paper/40">Không đến</dt>
              <dd
                className={unreliable(stats) ? "text-signal-warn" : undefined}
              >
                {stats.noShow}
                {stats.noShow ? ` · ${Math.round(stats.noShowRate)}%` : ""}
              </dd>
            </div>
          </dl>
          {unreliable(stats) && (
            <p className="mt-4 border-l border-signal-warn pl-3 text-xs leading-relaxed text-signal-warn">
              Nên gọi xác nhận trước mỗi buổi hẹn của khách này.
            </p>
          )}
        </Panel>
      </div>
      <Panel title="Tất cả lịch hẹn" dense>
        <AppointmentRows rows={history} onSelect={setSelected} />
      </Panel>
      {editing && (
        <CustomerEditor
          customer={customer}
          onClose={() => setEditing(false)}
          onSaved={loadData}
        />
      )}
      <AppointmentDrawer
        view={selected}
        onClose={() => setSelected(null)}
        onRefresh={loadData}
      />
    </AdminPage>
  );
}

function CustomerEditor({ customer, onClose, onSaved }) {
  const [form, setForm] = React.useState(customer);
  const [error, setError] = React.useState("");
  const set = (key, value) => setForm({ ...form, [key]: value });

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    try {
      if (/^\d+$/.test(String(customer.id))) {
        await userService.update(customer.id, {
          fullName: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        });
      }
      toast.success("Đã cập nhật hồ sơ khách hàng");
      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu hồ sơ khách hàng.");
    }
  }

  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title="Chỉnh sửa khách hàng"
      footer={
        <Button variant="champagne" type="submit" form="customer-edit">
          Lưu hồ sơ
        </Button>
      }
    >
      <form
        id="customer-edit"
        onSubmit={handleSave}
        noValidate
        className="space-y-6"
      >
        <Field label="Họ tên *">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={150}
          />
        </Field>
        <Field label="Điện thoại *">
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="Email *">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="Ghi chú">
          <Textarea
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            maxLength={500}
          />
        </Field>
        <FormError message={error} />
      </form>
    </RightDrawer>
  );
}
