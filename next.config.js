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
            source: '/:path*',
            headers: [
                { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://therapy-trainings-quiz-game-psi.vercel.app/quiz;" },
                // Allow iFrame embedding from your domain and the domain you want
            ],
        },
    ];
}
};

module.exports = nextConfig;
