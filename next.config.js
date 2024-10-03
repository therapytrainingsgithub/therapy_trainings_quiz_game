const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *;"
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate' // Prevents caching
          },
          {
            key: 'Pragma',
            value: 'no-cache' // HTTP 1.0 backward compatibility
          },
          {
            key: 'Expires',
            value: '0' // Proxies
          }
        ]
      }
    ];
  }
  
};

module.exports = nextConfig;
