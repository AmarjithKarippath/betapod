import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://apptest.example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Find 12 Google Play Testers in Hours — Free | AppTest",
    template: "%s · AppTest",
  },
  description:
    "Get the 12 active testers Google Play requires for closed testing. Indie devs help each other ship to production in 14 days. Free, no waitlist, no paid test farms.",
  keywords: [
    "google play 12 testers",
    "12 testers 14 days",
    "google play closed testing testers",
    "find android beta testers",
    "google play production access",
    "android closed testing",
    "play store beta testers",
    "google play personal developer account",
    "opt-in testers google play",
    "android beta tester exchange",
    "mutual app testing",
  ],
  openGraph: {
    title: "Find 12 Google Play Testers in Hours — Free | AppTest",
    description:
      "Get the 12 active testers Google Play requires for closed testing. Indie devs help each other ship to production in 14 days.",
    url: SITE_URL,
    siteName: "AppTest",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find 12 Google Play Testers in Hours — Free | AppTest",
    description:
      "The free marketplace where indie Android devs swap closed testing. No paid test farms.",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <header className="border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-lg text-brand-600">
              AppTest
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/#how-it-works" className="text-slate-600 hover:text-slate-900">
                How it works
              </a>
              <a href="/blog" className="text-slate-600 hover:text-slate-900">
                Blog
              </a>
              <a href="/#faq" className="text-slate-600 hover:text-slate-900">
                FAQ
              </a>
              <a
                href={`${APP_URL}/login`}
                className="text-slate-600 hover:text-slate-900"
              >
                Log in
              </a>
              <a
                href={`${APP_URL}/register`}
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-brand-600 text-white hover:bg-brand-700"
              >
                Get started
              </a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-sm text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} AppTest. Built by indie devs.</span>
            <span>
              <a href="/privacy" className="hover:text-slate-900">
                Privacy
              </a>
              {" · "}
              <a href="/terms" className="hover:text-slate-900">
                Terms
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
