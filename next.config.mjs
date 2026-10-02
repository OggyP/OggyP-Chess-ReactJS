/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    const longCache = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ]
    return [
      {
        source: '/stockfish/:path*',
        headers: longCache,
      },
      {
        source: '/badStockfish/:path*',
        headers: longCache,
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
