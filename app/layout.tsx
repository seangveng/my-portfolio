import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Kantumruy_Pro,
} from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Import Kantumruy Pro from Google Fonts
const kantumruyPro = Kantumruy_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["khmer"],
  variable: "--font-kantumruy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sou Seangveng | Full Stack Developer",
  description:
    "Full Stack Developer building modern, scalable and user-focused web applications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="km"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${kantumruyPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
