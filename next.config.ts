import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'npnifamrslmcrjtysuhs.supabase.co',
      },
    ],
  },
};

export default nextConfig;
