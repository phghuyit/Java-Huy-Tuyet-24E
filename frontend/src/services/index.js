export * from "./axiosClient.js";
export * from "./auth.service.js";
export * from "./nail.service.js";
export * from "./category.service.js";
export * from "./appointment.service.js";
export * from "./staff.service.js";
export * from "./user.service.js";
export * from "./coupon.service.js";
export * from "./review.service.js";
export * from "./product.service.js";
export * from "./inventory.service.js";
export * from "./trash.service.js";
export * from "./waitlist.service.js";
export * from "./lookbook.service.js";

import { apiClient, requestApi, getApiImageUrl, API_URL } from "./axiosClient.js";
import { authService } from "./auth.service.js";
import { nailService } from "./nail.service.js";
import { categoryService } from "./category.service.js";
import { appointmentService } from "./appointment.service.js";
import { staffService } from "./staff.service.js";
import { userService } from "./user.service.js";
import { couponService } from "./coupon.service.js";
import { reviewService } from "./review.service.js";
import { productService } from "./product.service.js";
import { inventoryService } from "./inventory.service.js";
import { trashService } from "./trash.service.js";
import { waitlistService } from "./waitlist.service.js";
import { lookbookService } from "./lookbook.service.js";

const services = {
  client: apiClient,
  requestApi,
  getApiImageUrl,
  API_URL,
  auth: authService,
  nail: nailService,
  category: categoryService,
  appointment: appointmentService,
  staff: staffService,
  user: userService,
  coupon: couponService,
  review: reviewService,
  product: productService,
  inventory: inventoryService,
  trash: trashService,
  waitlist: waitlistService,
  lookbook: lookbookService,
};

export default services;
