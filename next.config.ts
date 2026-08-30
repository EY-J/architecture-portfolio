import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  allowedDevOrigins: ['architectu1452.builtwithrocket.new'],
  // @ts-expect-error turbopack config silences webpack/turbopack conflict warning
  turbopack: {},

  webpack(config, { dev }) {
    if (dev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });
    }

    return config;
  }
};

export default nextConfig;
