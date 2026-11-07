import { getStaffMember, staff } from "@/data";
export function generateStaticParams() {
  return staff.map((member) => ({ slug: member.slug }));
}
export async function generateMetadata(props) {
  const { slug } = await props.params;
  const artist = getStaffMember(slug);
  if (!artist) return { title: "Không tìm thấy nhân viên" };
  return {
    title: `${artist.name} — ${artist.role}`,
    description: artist.philosophy,
    openGraph: { images: [artist.portrait] },
  };
}
import { ArtistDetail } from "@/components/website/artist-detail";
export default async function Page(props) {
  const { slug } = await props.params;
  return <ArtistDetail slug={slug} />;
}
