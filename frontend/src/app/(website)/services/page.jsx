import { ServicesCatalogue } from "@/components/website/services-catalogue";
export const metadata = {
  title: "Dịch vụ",
  description: "Dịch vụ, thời lượng và giá tại VELA.",
};
export default async function Page(props) {
  const params = await props.searchParams;
  return (
    <ServicesCatalogue
      initialCategory={
        typeof params.category === "string" ? params.category : undefined
      }
    />
  );
}
