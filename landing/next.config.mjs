/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    // www.betapod.io is attached to the same Worker; send it to the apex.
    return [
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
