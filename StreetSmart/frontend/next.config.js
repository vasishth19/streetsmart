/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile Three.js
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // PWA headers — critical for service worker scope
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control',   value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Content-Type',    value: 'application/javascript' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type',  value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },

  images: {
    domains: ['api.mapbox.com'],
  },
};

module.exports = nextConfig;