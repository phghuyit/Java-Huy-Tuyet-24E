import { BookingResult } from "@/components/booking/booking-result";
export const metadata = {
  title: "Đã gửi yêu cầu đặt lịch",
  robots: { index: false },
};
export default async function Page(props) {
  const params = await props.searchParams;
  return (
    <BookingResult code={typeof params.code === "string" ? params.code : ""} />
  );
}
