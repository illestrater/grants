require("dotenv").config();
const withOffline = require("next-offline");

module.exports = withOffline({
  webpack5: false,
  eslint: { ignoreDuringBuilds: true },

  async rewrites() {
    return [
      {
        source: "/service-worker.js",
        destination: "/_next/static/service-worker.js",
      },
    ];
  },

  plugins: [require("tailwindcss"), require("autoprefixer")],

  images: {
    domains: ["cdn.grants.art"],
  },

  workboxOpts: {
    swDest: "static/service-worker.js",
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "https-calls",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
    ],
  },
});
