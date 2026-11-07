import { appointments } from "./appointments";
import { customers } from "./customers";
import { staff, staffBySlug, staffById } from "./staff";
import { services, categories, serviceById, categoryBySlug } from "./services";
import { businessHours } from "./site";
import { waitlist } from "./waitlist";
import { promotions } from "./promotions";
import { lookbook } from "./lookbook";
import { reviews } from "./reviews";
import { activeServices } from "@/lib/salon";

export * from "./services";
export * from "./staff";
export * from "./customers";
export * from "./appointments";
export * from "./lookbook";
export * from "./reviews";
export * from "./site";
export * from "./waitlist";
export * from "./promotions";
export * from "./images";

export const initialSalonData = {
  appointments,
  customers,
  staff,
  services,
  categories,
  businessHours,
  timeOff: [],
  reviews,
  waitlist,
  promotions,
};

export const getActiveServices = () => activeServices(initialSalonData);
export const getServicesByCategory = (slug) =>
  getActiveServices().filter((item) => item.categorySlug === slug);
export const getStaffMember = (slug) => staffBySlug.get(slug) ?? null;
export const getHighlightedReviews = () =>
  reviews.filter((item) => item.published && item.highlighted);
export const getLookbookForStaff = (id, limit = 6) =>
  lookbook.filter((item) => item.staffId === id).slice(0, limit);

export function getLookbookEntries(filter) {
  return lookbook
    .filter((item) => !filter || filter === "all" || item.categorySlug === filter)
    .map((item) => ({
      ...item,
      categoryLabel: categoryBySlug.get(item.categorySlug)?.name ?? "Dịch vụ",
      serviceName: serviceById.get(item.serviceId ?? "")?.name ?? "Liệu trình VELA",
      serviceSlug: serviceById.get(item.serviceId ?? "")?.slug ?? null,
      artistName: staffById.get(item.staffId ?? "")?.name ?? "VELA",
      artistSlug: staffById.get(item.staffId ?? "")?.slug ?? null,
    }));
}
