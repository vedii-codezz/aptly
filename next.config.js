/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next 14.2 exposes this option under `experimental` (see its installed typings).
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],
    // `pdf-parse` is intentionally externalized for the Node.js route. Its ESM
    // dependency on PDF.js is therefore invisible to the route's dynamic-import
    // file trace unless these runtime files are included explicitly. Keep this
    // limited to the server-only PDF implementation and its worker/fake-worker.
    // PDF.js dynamically loads @napi-rs/canvas in Node to supply DOMMatrix;
    // include its Linux runtime binary as well since that require is not
    // discoverable by Next's static file tracer.
    outputFileTracingIncludes: {
      "/api/parse-file": [
        "./node_modules/pdf-parse/dist/pdf-parse/esm/**/*",
        "./node_modules/pdfjs-dist/legacy/build/**/*",
        "./node_modules/@napi-rs/canvas/**/*",
        "./node_modules/@napi-rs/canvas-linux-x64-gnu/**/*",
      ],
    },
  },
};

module.exports = nextConfig;
