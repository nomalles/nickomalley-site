/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow .glb files to be served as static assets from /public
  // (Next handles this by default, but we explicitly mark them as not-bundled)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf|hdr|exr)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;
