import { z } from "zod";
export const bookingDetailsSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự).")
        .max(150, "Họ tên không quá 150 ký tự."),
    phone: z
        .string()
        .trim()
        .regex(/^(?:0\d{9}|\+84\d{9})$/, "Nhập số điện thoại Việt Nam gồm 10 chữ số hoặc bắt đầu bằng +84."),
    email: z.string().trim().email("Vui lòng nhập địa chỉ email hợp lệ."),
    note: z.string().trim().max(500, "Ghi chú không quá 500 ký tự.").optional(),
});
