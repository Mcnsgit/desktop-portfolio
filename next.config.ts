import type { NextConfig } from "next";
import path from "path"; // Import path to avoid runtime error
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },

  // Fix CSS loading issues


  // Fix image loading issues - particularly for model textures
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.forEach((rule: { oneOf: never[] }) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((one: { issuer: { and: string | string[] } }) => {
          if (one.issuer?.and && one.issuer.and.includes("_app")) {
            one.issuer.and = [path.resolve(__dirname)];
          }
        });
      }
    });
    config.externals.push({
      canvas: "canvas",
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    });
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ["raw-loader"],
      });
     config.module.rules.push({
       test: /\.json$/,
       type: "javascript/auto",
     });
    
    return config;
  },
    productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;