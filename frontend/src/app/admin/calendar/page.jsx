import { AppointmentsWorkspace } from "@/components/admin/workspace";
export default async function Page(props) {
  const params = await props.searchParams;
  return (
    <AppointmentsWorkspace
      calendar
      initialDate={typeof params.date === "string" ? params.date : undefined}
    />
  );
}
