/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'source.unsplash.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'github.com',
      'randomuser.me',
      'picsum.photos',
      'cloudflare-ipfs.com',
    ],
    unoptimized: true,
  },
}

export default nextConfig
