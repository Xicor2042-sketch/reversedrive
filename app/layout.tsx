import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ReverseDrive",
    template: "%s · ReverseDrive",
  },
  description: "Don't search. Let the car come to you.",
  applicationName: "ReverseDrive",
  authors: [{ name: "ReverseDrive" }],
  keywords: [
    "reverse marketplace",
    "car buying",
    "car concierge",
    "automotive",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0d0f14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-navy-950 text-white font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}