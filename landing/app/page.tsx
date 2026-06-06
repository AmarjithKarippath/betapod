const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://apptest.example.com";

const FAQS = [
  {
    q: "Why do I need 12 testers for 14 days?",
    a: "Google Play now requires personal-account developers to run a closed testing track with at least 12 active testers for 14 continuous days before opting in to production. AppTest helps you find those testers quickly.",
  },
  {
    q: "Is this free?",
    a: "Yes. AppTest is free for both posting testing requests and enrolling as a tester. The marketplace works because everyone benefits from mutual help.",
  },
  {
    q: "How do testers get my app?",
    a: "When testers enroll in your request, their Google email addresses appear in your dashboard. You then add those emails to your Play Console closed-testing track.",
  },
  {
    q: "Do testers need to actually use the app?",
    a: "Yes — Google counts a tester as 'active' only if they opt in via the testing URL and the app reports activity. We recommend briefing your testers and following up.",
  },
  {
    q: "Can I test someone else's app to help?",
    a: "Absolutely. Browse open requests, enroll in any that interest you, and earn good karma. Many devs reciprocate when you post your own.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create an account",
    body: "Sign up with email in 30 seconds. No Google verification, no waitlist.",
  },
  {
    n: "2",
    title: "Post your testing request",
    body: "Share your app name, Play Store URL, screenshot, and how many testers you need.",
  },
  {
    n: "3",
    title: "Testers enroll",
    body: "Other devs sign up to test. Their emails appear in your dashboard.",
  },
  {
    n: "4",
    title: "Add them in Play Console",
    body: "Paste enrolled emails into your closed-testing track. You're 14 days from production.",
  },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AppTest",
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "A marketplace for Android developers to find testers and meet Google Play's closed-testing requirements.",
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-4">
          Built for the Google Play 12-tester / 14-day rule
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          Get 12 Google Play testers.{" "}
          <span className="text-brand-600">Ship to production in 14 days.</span>
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
          The free marketplace where indie Android devs swap closed testing. No paid test
          farms. No Fiverr risk. Real developer accounts, real opt-ins, real feedback.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <a
            href={`${APP_URL}/register`}
            className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium bg-brand-600 text-white hover:bg-brand-700"
          >
            Post a testing request — free
          </a>
          <a
            href={`${APP_URL}/`}
            className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Browse open requests
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Free forever. No credit card. Built by indie devs, for indie devs.
        </p>
      </section>

      <section id="how-it-works" className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900">How it works</h2>
          <p className="text-center text-slate-600 mt-2">From signup to production in four steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white rounded-lg p-6 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-semibold">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">Why AppTest</h2>
        <ul className="mt-6 space-y-4 text-slate-700">
          <li className="flex gap-3">
            <span className="text-brand-600">✓</span>
            <span>
              <strong>Real testers, not bots.</strong> Every enrollment is a verified
              developer account.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-600">✓</span>
            <span>
              <strong>Two-sided marketplace.</strong> Testers know they&apos;ll likely need
              testers too — strong reciprocity built in.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-600">✓</span>
            <span>
              <strong>No friction.</strong> Sign up with email in 30 seconds. No verification
              dance, no waitlist.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-600">✓</span>
            <span>
              <strong>Filter by location.</strong> Need GDPR-region testers? Indian testers
              for an INR-priced app? Filter and ship.
            </span>
          </li>
        </ul>
      </section>

      <section id="faq" className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl font-bold text-slate-900">FAQ</h2>
          <div className="mt-8 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900">{f.q}</h3>
                <p className="mt-2 text-slate-600 text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Ready to ship?</h2>
        <p className="mt-3 text-slate-600">
          Join hundreds of indie devs already getting their apps tested.
        </p>
        <a
          href={`${APP_URL}/register`}
          className="mt-6 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium bg-brand-600 text-white hover:bg-brand-700"
        >
          Get started — it&apos;s free
        </a>
      </section>
    </main>
  );
}
