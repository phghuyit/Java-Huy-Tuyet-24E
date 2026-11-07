import { categories, getLookbookEntries } from "@/data";
import { BookingCta } from "@/components/website/booking-cta";
import { PageHeader } from "@/components/website/page-header";
import { LookbookBrowser } from "@/components/website/lookbook-browser";
export const metadata = {
  title: "Bộ sưu tập",
  description: "Bộ sưu tập tóc, móng, mi và chăm sóc da từ VELA.",
};
export default function LookbookPage() {
  const entries = getLookbookEntries();
  const filters = [
    { label: "Tất cả", value: "all", count: entries.length },
    ...categories.map((category) => ({
      label: category.name,
      value: category.slug,
      count: entries.filter((e) => e.categorySlug === category.slug).length,
    })),
  ];
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Bộ sưu tập" }]}
        lines={["NHỮNG DẤU ẤN,", "TỪ SALON VELA."]}
        description="Tham khảo các diện mạo trong bộ sưu tập và chọn dịch vụ bạn yêu thích cho buổi hẹn tiếp theo."
        aside={
          <dl className="flex flex-wrap gap-x-12 gap-y-4">
            <Figure value={`${entries.length}`} label="Diện mạo" />
            <Figure
              value={`${entries.filter((e) => e.beforeAfter).length}`}
              label="Diện mạo mới"
            />
            <Figure value="4" label="Nhân viên" />
          </dl>
        }
      />

      <LookbookBrowser entries={entries} filters={filters} />

      <BookingCta lines={["ĐÃ THẤY ĐIỀU BẠN THÍCH?", "HẸN GẶP TẠI VELA."]} />
    </>
  );
}
function Figure({ value, label }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-display text-[1.75rem] leading-none">
          {value}
        </span>
        <span className="eyebrow mt-2 block text-ink/40">{label}</span>
      </dd>
    </div>
  );
}
