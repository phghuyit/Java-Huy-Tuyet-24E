"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useAuth } from "@/lib/auth-store";
import { can, scopedStaffId } from "@/lib/permissions";
import { userService, staffService, nailService } from "@/services";
import { slugify } from "@/util";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/primitives";
import { ADMIN_NAV } from "./sidebar";

export function CommandPalette({ open, onOpenChange, onNewBooking }) {
  const router = useRouter();
  const { session } = useAuth();
  const [customers, setCustomers] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [services, setServices] = React.useState([]);

  React.useEffect(() => {
    if (!open) return;
    let mounted = true;
    Promise.allSettled([
      userService.getAll(),
      staffService.getAll(),
      nailService.getAll(),
    ]).then(([uRes, stfRes, sRes]) => {
      if (!mounted) return;
      if (uRes.status === "fulfilled" && Array.isArray(uRes.value)) {
        setCustomers(uRes.value);
      }
      if (stfRes.status === "fulfilled" && Array.isArray(stfRes.value)) {
        setStaff(stfRes.value);
      }
      if (sRes.status === "fulfilled" && Array.isArray(sRes.value)) {
        setServices(sRes.value);
      }
    });
    return () => {
      mounted = false;
    };
  }, [open]);

  const mine = scopedStaffId(session);
  const nav = ADMIN_NAV.filter((item) => can(session, item.cap));
  React.useEffect(() => {
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);
  function navigate(href) {
    router.push(href);
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-paper/15 bg-char p-4 text-paper"
        data-tone="dark"
      >
        <DialogTitle className="sr-only">Tìm kiếm và điều hướng</DialogTitle>
        <DialogDescription className="sr-only">
          Tìm khách hàng, dịch vụ, nhân viên và màn hình quản trị.
        </DialogDescription>
        <Command loop>
          <Command.Input
            autoFocus
            aria-label="Tìm kiếm quản trị"
            placeholder="Tìm khách, dịch vụ, nhân viên…"
            className="mb-3 h-12 w-full border-b border-paper/15 bg-transparent pr-6 outline-none placeholder:text-paper/35"
          />
          <Command.List className="thin-scrollbar max-h-[55dvh] overflow-y-auto">
            <Command.Empty className="py-10 text-center text-paper/45">
              Không có kết quả phù hợp.
            </Command.Empty>
            <Command.Item
              onSelect={() => {
                onOpenChange(false);
                onNewBooking();
              }}
              className="cursor-pointer px-3 py-3 text-champagne data-[selected=true]:bg-paper/10"
            >
              Tạo lịch hẹn
            </Command.Item>
            <Command.Group
              heading="Điều hướng"
              className="[&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-paper/35"
            >
              {nav.map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => navigate(item.href)}
                  className="cursor-pointer px-3 py-2.5 data-[selected=true]:bg-paper/10"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
            {can(session, "customers") && (
              <Command.Group
                heading="Khách hàng"
                className="[&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-paper/35"
              >
                {customers.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.name || item.fullName} ${item.phone} ${item.email}`}
                    onSelect={() => navigate(`/admin/customers/${item.id}`)}
                    className="cursor-pointer px-3 py-2.5 data-[selected=true]:bg-paper/10"
                  >
                    {item.name || item.fullName}
                    <span className="ml-3 text-xs text-paper/40">
                      {item.phone}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            <Command.Group
              heading="Nhân viên"
              className="[&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-paper/35"
            >
              {staff
                .filter((item) => !mine || String(item.id) === String(mine))
                .map((item) => (
                  <Command.Item
                    key={item.id}
                    onSelect={() => navigate(`/admin/staff/${item.slug || slugify(item.name) || item.id}`)}
                    className="cursor-pointer px-3 py-2.5 data-[selected=true]:bg-paper/10"
                  >
                    {item.name}
                  </Command.Item>
                ))}
            </Command.Group>
            {can(session, "catalogue") && (
              <Command.Group
                heading="Dịch vụ"
                className="[&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-paper/35"
              >
                {services.map((item) => (
                  <Command.Item
                    key={item.id}
                    onSelect={() =>
                      navigate(`/admin/services?service=${item.id}`)
                    }
                    className="cursor-pointer px-3 py-2.5 data-[selected=true]:bg-paper/10"
                  >
                    {item.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
