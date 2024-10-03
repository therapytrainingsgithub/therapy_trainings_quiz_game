module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*' // Allow any origin to embed your app
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true' // Allow credentials (cookies) to be sent
          }
        ]
      }
    ]
  }
};
