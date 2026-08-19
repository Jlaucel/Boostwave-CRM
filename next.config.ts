import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '*.loca.lt',
    '*.ngrok-free.app',
    '*.trycloudflare.com',
    '*.pinggy.link',
    'https://*.loca.lt',
    'https://*.ngrok-free.app',
    'https://*.trycloudflare.com',
    'https://*.pinggy.link'
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        '*.loca.lt',
        '*.ngrok-free.app',
        '*.trycloudflare.com',
        '*.pinggy.link',
        'https://*.loca.lt',
        'https://*.ngrok-free.app',
        'https://*.trycloudflare.com',
        'https://*.pinggy.link'
      ]
    }
  }
};

export default nextConfig;
