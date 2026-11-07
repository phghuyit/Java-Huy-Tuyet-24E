import { Suspense } from "react";
import { ServicesWorkspace } from "@/components/admin/workspace";
export default function Page() {
  return (
    <Suspense fallback={<p className="p-8">Đang tải dịch vụ…</p>}>
      <ServicesWorkspace />
    </Suspense>
  );
}
