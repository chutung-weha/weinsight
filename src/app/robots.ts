import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://weinsight.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/result/", "/ho-so/", "/history/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
