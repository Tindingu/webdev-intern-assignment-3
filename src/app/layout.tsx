import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "G-Scores",
  description: "Tra cứu điểm thi THPT Việt Nam và báo cáo thống kê"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
