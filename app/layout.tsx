import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบติดตามพนักงานใหม่ - สภาอุตสาหกรรมแห่งประเทศไทย",
  description: "ติดตามและต้อนรับพนักงานใหม่ที่เข้าร่วมทีมสภาอุตสาหกรรมแห่งประเทศไทย",
  icons: {
    icon: '/Logo_FTI.webp',
    shortcut: '/Logo_FTI.webp',
    apple: '/Logo_FTI.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${prompt.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
