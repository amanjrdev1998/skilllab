import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.skilllab.example.com",
  ),
  title: {
    default: "SkillLab | Online Courses in Digital Marketing, AI & App Development",
    template: "%s | SkillLab",
  },
  description:
    "Learn high-income skills online with SkillLab. Practical video courses in Facebook ads, Instagram marketing, AI automation, AI agents, and Flutter app development. Pay securely with PayPal.",
  keywords: [
    "online courses",
    "digital marketing course",
    "facebook ads course",
    "instagram ads course",
    "ai automation course",
    "ai agent course",
    "flutter app development course",
    "learn digital marketing online",
    "social media marketing training",
    "make money online courses",
    "skilllab",
  ],
  authors: [{ name: "SkillLab" }],
  creator: "SkillLab",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "SkillLab",
    title: "SkillLab | Online Courses in Digital Marketing, AI & App Development",
    description:
      "Practical online courses in digital marketing, AI automation and app development. Learn high-income skills, pay securely with PayPal.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillLab | Online Courses in Digital Marketing, AI & App Development",
    description:
      "Practical online courses in digital marketing, AI automation and app development.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
