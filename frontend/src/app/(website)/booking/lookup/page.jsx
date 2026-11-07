import { Suspense } from "react";
import { BookingLookup } from "@/components/booking/booking-lookup";
export const metadata = {
  title: "Tra cứu lịch hẹn",
  description:
    "Nhập mã đặt lịch và số điện thoại để xem hoặc hủy lịch hẹn tại VELA mà không cần tài khoản.",
};
export default async function BookingLookupPage(props) {
  const params = await props.searchParams;
  const code = typeof params.code === "string" ? params.code : "";
  return (
    <Suspense>
      <BookingLookup initialCode={code} />
    </Suspense>
  );
}
