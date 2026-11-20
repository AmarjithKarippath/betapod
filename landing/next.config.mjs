/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    // www.betapod.io and www.app.betapod.io are attached to this Worker as
    // custom domains purely so they resolve; send them to the canonical hosts.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.app.betapod.io" }],
        destination: "https://app.betapod.io/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.betapod.io" }],
        destination: "https://betapod.io/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
