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
        source: '/(.*)', // Apply these headers to all routes
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL' // Allow from any domain
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *" // Allow from any domain
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;