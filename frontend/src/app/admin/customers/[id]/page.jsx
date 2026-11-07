import { CustomerDetail } from "@/components/admin/workspace";
export default async function Page(props) {
  const { id } = await props.params;
  return <CustomerDetail id={id} />;
}
