import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog — Google Play testing guides for indie Android devs",
  description:
    "Practical guides on Google Play's 12-tester rule, closed testing setup, and shipping Android apps to production faster.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
      <p className="mt-2 text-slate-600">
        Practical guides for indie Android developers navigating Google Play&apos;s testing
        requirements.
      </p>

      <ul className="mt-10 space-y-6">
        {posts.map((p) => (
          <li key={p.slug} className="border-b border-slate-200 pb-6 last:border-b-0">
            <Link
              href={`/blog/${p.slug}`}
              className="block group"
            >
              <h2 className="text-xl font-semibold text-slate-900 group-hover:text-brand-600">
                {p.title}
              </h2>
              <p className="mt-2 text-slate-600 text-sm">{p.description}</p>
              <div className="mt-3 text-xs text-slate-500">
                <time dateTime={p.date}>
                  {new Date(p.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span> · {p.readingMinutes} min read</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
