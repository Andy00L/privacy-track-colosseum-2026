import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";
import { Navbar } from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadowPay -- Private Agent Payments on Solana",
  description:
    "Private machine-to-machine payments for the agentic economy. x402-powered with MagicBlock privacy on Solana.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23099c54'/><path d='M16 6L8 10.5V21.5L16 26L24 21.5V10.5L16 6Z' stroke='white' stroke-width='2' stroke-linejoin='round' fill='none'/><path d='M16 11L12 13.25V17.75L16 20L20 17.75V13.25L16 11Z' fill='white' opacity='0.8'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1526",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="relative min-h-screen font-sans antialiased">
        <Providers>
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <Navbar />
          <main
            id="main-content"
            className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
