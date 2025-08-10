import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenGPT - Your Personal AI Assistant",
  description: "Open-source ChatGPT alternative where you use your own OpenAI API key for secure, private conversations.",
  keywords: ["OpenGPT", "ChatGPT", "AI", "OpenAI", "Open Source", "API", "Chat", "Assistant"],
  authors: [{ name: "Rahees Ahmed", url: "https://github.com/RaheesAhmed" }],
  creator: "Rahees Ahmed",
  publisher: "OpenGPT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" }
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://opengpt-rahees.vercel.app",
    title: "OpenGPT - Open Source ChatGPT Alternative",
    description: "Open-source ChatGPT alternative where you use your own OpenAI API key for secure, private conversations.",
    siteName: "OpenGPT",
    images: [
      {
        url: "/opengpt-screenshot.png",
        width: 1200,
        height: 630,
        alt: "OpenGPT Screenshot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenGPT - Open Source ChatGPT Alternative",
    description: "Open-source ChatGPT alternative where you use your own OpenAI API key for secure, private conversations.",
    images: ["/opengpt-screenshot.png"],
    creator: "@raheesahmed",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
