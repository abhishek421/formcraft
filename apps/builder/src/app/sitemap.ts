import type { MetadataRoute } from "next";

const BASE = "https://forms.stayclever.in";

const FEATURE_SLUGS = ["ab-testing", "conditional-logic", "file-upload", "analytics"];
const COMPETITOR_SLUGS = ["typeform", "google-forms", "jotform", "formstack", "surveymonkey", "tally", "paperform"];
const INDUSTRY_SLUGS = ["healthcare", "education", "real-estate", "lead-generation"];
const INTEGRATION_SLUGS = ["zapier", "hubspot", "slack", "webhook"];
const BLOG_CATEGORIES = ["form-design", "ab-testing", "survey-tips"];
const BLOG_POSTS: Record<string, string[]> = {
  "form-design": ["why-users-abandon-forms", "static-forms-are-dead", "how-much-revenue-your-forms-lose"],
  "ab-testing": ["form-ab-testing-is-broken", "what-we-learned-from-thousands-of-form-interactions"],
  "survey-tips": ["why-users-abandon-forms", "what-we-learned-from-thousands-of-form-interactions"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly", lastModified: now },
    { url: `${BASE}/pricing`, priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/about`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "weekly", lastModified: now },
    { url: `${BASE}/features`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/compare`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/use-cases`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/integrations`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/changelog`, priority: 0.5, changeFrequency: "weekly", lastModified: now },
    { url: `${BASE}/security`, priority: 0.6, changeFrequency: "yearly", lastModified: now },
    { url: `${BASE}/terms`, priority: 0.3, changeFrequency: "yearly", lastModified: now },
    { url: `${BASE}/privacy`, priority: 0.3, changeFrequency: "yearly", lastModified: now },
  ];

  const feature_pages: MetadataRoute.Sitemap = FEATURE_SLUGS.map((slug) => ({
    url: `${BASE}/features/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const compare_pages: MetadataRoute.Sitemap = COMPETITOR_SLUGS.map((slug) => ({
    url: `${BASE}/compare/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const use_case_pages: MetadataRoute.Sitemap = INDUSTRY_SLUGS.map((slug) => ({
    url: `${BASE}/use-cases/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const integration_pages: MetadataRoute.Sitemap = INTEGRATION_SLUGS.map((slug) => ({
    url: `${BASE}/integrations/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blog_category_pages: MetadataRoute.Sitemap = BLOG_CATEGORIES.map((cat) => ({
    url: `${BASE}/blog/${cat}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  const blog_post_pages: MetadataRoute.Sitemap = BLOG_CATEGORIES.flatMap((cat) =>
    (BLOG_POSTS[cat] ?? []).map((slug) => ({
      url: `${BASE}/blog/${cat}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [
    ...static_pages,
    ...feature_pages,
    ...compare_pages,
    ...use_case_pages,
    ...integration_pages,
    ...blog_category_pages,
    ...blog_post_pages,
  ];
}
