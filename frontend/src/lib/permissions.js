const OWNER = [
  "dashboard",
  "calendar",
  "appointments",
  "customers",
  "waitlist",
  "team",
  "catalogue",
  "promotions",
  "hours",
  "reviews",
  "reports",
  "notices",
  "revenue",
  "takePayment",
  "moderate",
];

const RECEPTIONIST = [
  "dashboard",
  "calendar",
  "appointments",
  "customers",
  "waitlist",
  "team",
  "reviews",
  "takePayment",
  "notices",
];

const STAFF = ["dashboard", "calendar", "appointments", "team", "reviews"];

export function normalizeRole(role) {
  if (!role) return "owner";
  if (typeof role === "object") {
    role = role.code || role.name || "";
  }
  const normalized = String(role).toLowerCase().trim();
  if (["admin", "owner"].includes(normalized)) return "owner";
  if (["receptionist", "desk", "letan"].includes(normalized)) return "receptionist";
  if (["staff", "nhanvien"].includes(normalized)) return "staff";
  return normalized;
}

const BY_ROLE = {
  owner: OWNER,
  admin: OWNER,
  ADMIN: OWNER,
  OWNER: OWNER,
  receptionist: RECEPTIONIST,
  RECEPTIONIST: RECEPTIONIST,
  desk: RECEPTIONIST,
  DESK: RECEPTIONIST,
  staff: STAFF,
  STAFF: STAFF,
  customer: [],
  CUSTOMER: [],
};

export function can(session, capability) {
  if (!session || !session.user) return false;
  const role = normalizeRole(session.user.role);
  const permissions = BY_ROLE[role] || BY_ROLE[session.user.role] || [];
  return Array.isArray(permissions) && permissions.includes(capability);
}

export function scopedStaffId(session) {
  return null;
}

export const isOwner = (session) => {
  if (!session || !session.user) return false;
  const role = normalizeRole(session.user.role);
  return role === "owner";
};

const ROUTES = [
  ["/admin/dashboard", "dashboard"],
  ["/admin/calendar", "calendar"],
  ["/admin/appointments", "appointments"],
  ["/admin/customers", "customers"],
  ["/admin/waitlist", "waitlist"],
  ["/admin/staff", "team"],
  ["/admin/services", "catalogue"],
  ["/admin/categories", "catalogue"],
  ["/admin/promotions", "promotions"],
  ["/admin/notices", "notices"],
  ["/admin/reviews", "reviews"],
  ["/admin/reports", "reports"],
];

export function routeCapability(pathname) {
  return ROUTES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? null;
}

export const ADMIN_ROLES = ["owner", "admin", "receptionist", "desk"];
export const isAdminRole = (value) => {
  const role = normalizeRole(value);
  return ["owner", "receptionist"].includes(role);
};

export const ROLE_LABEL = {
  admin: "Quản trị viên",
  owner: "Chủ salon",
  receptionist: "Lễ tân",
  desk: "Lễ tân",
};
