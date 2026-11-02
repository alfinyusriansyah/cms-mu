/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Dev: gambar disajikan dari FastAPI (localhost:8000/static/uploads/...)
      { protocol: "http", hostname: "localhost", port: "8000" },
      // Production nanti: tambahkan hostname bucket S3 di sini, misal:
      // { protocol: "https", hostname: "your-bucket.s3.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;
