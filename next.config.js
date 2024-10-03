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
            value: 'ALLOWALL' // Allows your app to be embedded in an iframe
          }
        ]
      }
    ];
  }
  
};

module.exports = nextConfig;