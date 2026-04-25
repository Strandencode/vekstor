import type { Metadata } from "next";
import { Geist_Mono, Work_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vekstor",
  description: "Norsk B2B-plattform for salgsprospektering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${workSans.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-body">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
