// Social preview tags injected into index.html for /requests/<id>.
import { beforeEach, describe, expect, it } from "vitest";
import { PNG_1PX, SAMPLE_REQUEST, register, setup } from "./helpers";

let t: Awaited<ReturnType<typeof setup>>;
beforeEach(async () => {
  t = await setup();
});

const meta = (html: string, attr: string, key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];

describe("listing share previews", () => {
  it("injects the listing's Open Graph and Twitter tags", async () => {
    const owner = t.client();
    await register(owner, "owner@example.com", "Owner");
    const created = (await (
      await owner.post("/api/requests", {
        ...SAMPLE_REQUEST,
        app_name: 'Pixel "Pals" <Beta>',
        description: "Line one\nline two & more",
      })
    ).json()) as { id: number };
    const form = new FormData();
    form.append("file", new File([PNG_1PX], "s.png", { type: "image/png" }));
    await owner.fetch(`/api/requests/${created.id}/screenshot`, { method: "POST", body: form });

    const res = await t.client().get(`/requests/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
    const html = await res.text();

    // still the SPA shell
    expect(html).toContain('<div id="root"></div>');
    // title + escaped user content
    expect(html).toContain('<title>Test Pixel "Pals" &lt;Beta&gt; on BetaPod</title>');
    expect(meta(html, "property", "og:title")).toBe("Test Pixel &quot;Pals&quot; &lt;Beta&gt; on BetaPod");
    expect(meta(html, "property", "og:description")).toMatch(
      /^Looking for 2 Android testers for a 14-day Google Play test \(Productivity, UK\)\. Line one line two &amp; more$/,
    );
    expect(meta(html, "property", "og:url")).toBe(`http://localhost/requests/${created.id}`);
    expect(meta(html, "property", "og:image")).toMatch(/^http:\/\/localhost\/uploads\/[A-Za-z0-9_-]+\.png$/);
    expect(meta(html, "name", "twitter:card")).toBe("summary_large_image");
    // the generic defaults from index.html are replaced, not duplicated
    expect(html.match(/property="og:title"/g)).toHaveLength(1);
    expect(html.match(/name="description"/g)).toHaveLength(1);
    expect(html).not.toContain("find testers for your Android app");
  });

  it("uses a summary card when there is no screenshot", async () => {
    const owner = t.client();
    await register(owner, "owner@example.com", "Owner");
    const { id } = (await (await owner.post("/api/requests", SAMPLE_REQUEST)).json()) as { id: number };
    const html = await (await t.client().get(`/requests/${id}`)).text();
    expect(meta(html, "name", "twitter:card")).toBe("summary");
    expect(html).not.toContain("og:image");
  });

  it("falls back to the plain SPA for unknown ids and non-listing routes", async () => {
    for (const path of ["/requests/999", "/requests/new"]) {
      const res = await t.client().get(path);
      expect(res.status, path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain('<div id="root"></div>');
      expect(meta(html, "property", "og:title"), path).toBe("BetaPod: find testers for your Android app");
    }
  });
});
