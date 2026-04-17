import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://insight.wehavn.vn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Chỉ disallow các route đã implement và cần chặn crawl.
        // `/ho-so/` và `/history/` chưa có — không đưa vào để tránh Google
        // blacklist trước khi launch.
        disallow: ["/admin/", "/api/", "/result/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
