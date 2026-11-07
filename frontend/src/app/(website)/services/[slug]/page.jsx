import { ServiceDetail } from "@/components/website/service-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata(props) {
  const { slug } = await props.params;
  return {
    title: "Chi tiết dịch vụ | VELA",
    description: "Thông tin chi tiết dịch vụ và bảng giá tại salon VELA.",
  };
}

export default async function Page(props) {
  const { slug } = await props.params;
  return <ServiceDetail slug={slug} />;
}
