import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});
export const metadata = {
  metadataBase: new URL("https://vela.studio"),
  title: {
    default: "VELA — Vẻ đẹp dành riêng cho bạn.",
    template: "%s — VELA",
  },
  description:
    "Khám phá dịch vụ tóc, móng, mi, chăm sóc da và thư giãn tại VELA. Đặt lịch với chuyên viên bạn yêu thích.",
  keywords: [
    "beauty salon",
    "hair salon",
    "balayage",
    "nail studio",
    "head spa",
    "VELA",
  ],
  openGraph: {
    title: "VELA — Vẻ đẹp dành riêng cho bạn.",
    description: "Không gian làm đẹp dành riêng cho phong cách của bạn.",
    type: "website",
    siteName: "VELA",
  },
};
export const viewport = {
  themeColor: "#f4f0e9",
  colorScheme: "light",
};
export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
