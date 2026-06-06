import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "../posts";
import { POST_BODIES } from "./bodies";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://betapod.io";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const Body = POST_BODIES[slug];
  if (!post || !Body) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "BetaPod" },
    publisher: { "@type": "Organization", name: "BetaPod" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" className="text-sm text-brand-600 hover:underline">
        ← All posts
      </Link>

      <article className="mt-6">
        <header>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {post.title}
          </h1>
          <div className="mt-3 text-sm text-slate-500">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span> · {post.readingMinutes} min read</span>
          </div>
        </header>

        <div className="mt-8 prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-brand-600">
          <Body />
        </div>

        <aside className="mt-12 rounded-lg bg-brand-50 border border-brand-100 p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            Skip the work — get 12 testers now
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Post a request on BetaPod and indie devs will enroll within hours. Free,
            no credit card.
          </p>
          <a
            href={`${APP_URL}/register`}
            className="mt-4 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium bg-brand-600 text-white hover:bg-brand-700"
          >
            Create a free account
          </a>
          <p className="mt-4 text-xs text-slate-500">
            BetaPod is free. If it helped, follow{" "}
            <a
              href="https://x.com/AmarKarippath"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:underline"
            >
              @AmarKarippath
            </a>{" "}
            on X.
          </p>
        </aside>
      </article>
    </main>
  );
}
