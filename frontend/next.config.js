/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.scdn.co', 'example.com', 'localhost']
  }
}

module.exports = nextConfig
