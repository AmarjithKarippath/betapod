export const metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 prose prose-slate">
      <h1>Privacy</h1>
      <p>
        AppTest stores the minimum needed to run the marketplace: your name, email, and
        password hash; the test requests you create; and which requests you&apos;ve enrolled in.
      </p>
      <p>
        When you enroll in a request, the request owner sees your email address so they can
        add you to their Google Play closed-testing track. They do not see other testers&apos;
        emails in your account.
      </p>
      <p>
        We do not sell, share, or monetize your data. We do not use third-party trackers.
      </p>
      <p>
        Delete your account anytime by emailing the address on the homepage. All your data
        is removed within 7 days.
      </p>
    </main>
  );
}
