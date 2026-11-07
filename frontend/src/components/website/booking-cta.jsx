import { AnimatedText } from "@/components/motion/animated-text";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { siteContent } from "@/data/site";
export function BookingCta({ eyebrow = "Sẵn sàng đón bạn", lines = ["VẺ ĐẸP CỦA BẠN.", "DẤU ẤN RIÊNG."], }) {
    return (<section className="border-t border-ink/10 bg-ivory py-24 md:py-32">
      <div className="gutter">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal className="mb-8">
              <span className="eyebrow text-champagne">{eyebrow}</span>
            </Reveal>
            <AnimatedText as="h2" lines={lines} className="font-display text-d1 font-light"/>
          </div>

          <div className="lg:col-span-4 lg:pb-3">
            <Reveal delay={0.15}>
              <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-ink/55">

                Năm bước để gửi yêu cầu đặt lịch: chọn dịch vụ, nhân viên, ngày giờ, nhập thông tin và xác nhận.
              </p>
              <div className="mt-8">
                <MagneticButton href="/booking" size="cta">

                  Đặt lịch ngay
                </MagneticButton>
              </div>
              <p className="mt-6 text-[0.8125rem] text-ink/40">

                Hoặc gọi VELA qua{" "}
                <a href={`tel:${siteContent.contact.phone.replace(/\s/g, "")}`} className="text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink">
                  {siteContent.contact.phone}
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>);
}
