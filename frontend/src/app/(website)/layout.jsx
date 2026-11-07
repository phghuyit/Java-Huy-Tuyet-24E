import { Footer } from "@/components/website/footer";
import { MobileBookingBar, Navbar } from "@/components/website/navbar";
export default function WebsiteLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer />
      <MobileBookingBar />
    </div>
  );
}
