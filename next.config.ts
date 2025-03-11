import type { NextConfig } from "next";
import path from "path"; // Import path to avoid runtime error
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add any image domains you need or remove if not necessary
  },
  webpack(config) {
    config.module.rules.forEach((rule: { oneOf: never[]; }) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((one: { issuer: { and: string | string[]; }; }) => {
          if (one.issuer?.and && one.issuer.and.includes('_app')) {
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
    return config;
  },
};
export default nextConfig;