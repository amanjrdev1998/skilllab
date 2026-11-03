import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.skilllab.example.com";
const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

type Course = { id: number; updated_at?: string };

async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/courses`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      success: boolean;
      data?: { courses?: Course[] } | Course[];
    };
    const data = payload.data;
    if (Array.isArray(data)) return data;
    return data?.courses ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/register`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacypolicy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/term-condition`, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${siteUrl}/cancelation-and-refund`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const courses = await fetchCourses();
  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteUrl}/product-details?id=${course.id}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...coursePages];
}
