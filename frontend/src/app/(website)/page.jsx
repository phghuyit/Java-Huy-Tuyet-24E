import { Marquee } from "@/components/motion/marquee";
import { BookingCta } from "@/components/website/booking-cta";
import { Section, SectionTitle } from "@/components/website/section";
import { HomeServicesExplorer } from "@/components/website/home/home-services-explorer";
import { Artists } from "@/components/website/home/artists";
import { Hero } from "@/components/website/home/hero";
import { LookbookPreview } from "@/components/website/home/lookbook-preview";
import { MoodGrid } from "@/components/website/home/mood-grid";
import { Signatures } from "@/components/website/home/signatures";
import { Testimonials } from "@/components/website/home/testimonials";
import {
  getHighlightedReviews,
  serviceById,
} from "@/data";
import { formatMediumDate } from "@/lib/clock";
import { siteContent } from "@/data/site";
export default function HomePage() {
  const testimonials = getHighlightedReviews().map((review) => ({
    id: review.id,
    body: review.body,
    author: review.author,
    meta: [
      review.serviceId ? serviceById.get(review.serviceId)?.name : null,
      formatMediumDate(review.createdAt),
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  return (
    <>
      <Hero />

      <div className="border-y border-ink/10 py-6">
        <Marquee
          items={siteContent.marquee}
          className="font-display text-[2rem] leading-none tracking-tight text-ink/70 md:text-[2.75rem]"
          slow
        />
      </div>

      <MoodGrid />

      <Section tone="paper" className="border-t border-ink/10">
        <div className="gutter">
          <SectionTitle
            index="02"
            eyebrow="Danh mục dịch vụ"
            lines={["MỌI DỊCH VỤ,", "TẠI MỘT NƠI."]}
            link={{ label: "Xem dịch vụ", href: "/services" }}
          />
          <div className="mt-20">
            <HomeServicesExplorer />
          </div>
        </div>
      </Section>

      <Signatures />

      <Artists />

      <LookbookPreview />

      <Testimonials items={testimonials} />

      <BookingCta />
    </>
  );
}
