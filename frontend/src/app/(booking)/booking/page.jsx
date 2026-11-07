import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { Skeleton } from "@/components/ui/feedback";
export const metadata = {
  title: "Đặt lịch",
  description:
    "Chọn dịch vụ, nhân viên, ngày giờ và gửi yêu cầu đặt lịch tại VELA.",
};
export default function BookingPage() {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingFlow />
    </Suspense>
  );
}
function BookingSkeleton() {
  return (
    <div className="gutter min-h-dvh pt-24">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-8 h-16 w-3/4 max-w-2xl" />
      <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] lg:aspect-[2/3]" />
        ))}
      </div>
    </div>
  );
}
