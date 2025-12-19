import { DiscoverCategoryMeta } from "@/types/discover";

export const DISCOVER_CATEGORIES: DiscoverCategoryMeta[] = [
  {
    id: "tech-programming",
    name: "Tech & Programming",
    description: "Developer blogs, tech news, open source, and programming resources",
    icon: "Code",
    color: "bg-blue-500",
    textColor: "text-blue-500",
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Artificial intelligence research, ML tutorials, and AI news",
    icon: "Brain",
    color: "bg-violet-500",
    textColor: "text-violet-500",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Popular YouTube channels for tech, education, entertainment, and more",
    icon: "Youtube",
    color: "bg-red-600",
    textColor: "text-red-600",
  },
  {
    id: "social-media",
    name: "Social & Communities",
    description: "Hacker News, Reddit, Lobsters, and developer communities",
    icon: "Users",
    color: "bg-sky-500",
    textColor: "text-sky-500",
  },
  {
    id: "design-creative",
    name: "Design & Creative",
    description: "UI/UX design, graphic design, illustration, and creative inspiration",
    icon: "Palette",
    color: "bg-pink-500",
    textColor: "text-pink-500",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Video game news, reviews, esports, and gaming culture",
    icon: "Gamepad2",
    color: "bg-orange-500",
    textColor: "text-orange-500",
  },
  {
    id: "entertainment-media",
    name: "Entertainment & Media",
    description: "Movies, TV, music, and pop culture",
    icon: "Film",
    color: "bg-purple-500",
    textColor: "text-purple-500",
  },
  {
    id: "news-current-events",
    name: "News & Current Events",
    description: "World news, politics, business, and current affairs",
    icon: "Newspaper",
    color: "bg-amber-500",
    textColor: "text-amber-500",
  },
  {
    id: "podcasts-newsletters",
    name: "Podcasts & Newsletters",
    description: "Audio shows and curated email newsletters with RSS feeds",
    icon: "Podcast",
    color: "bg-rose-500",
    textColor: "text-rose-500",
  },
  {
    id: "indie-blogs",
    name: "Indie Blogs",
    description: "Personal blogs and independent writers worth following",
    icon: "PenTool",
    color: "bg-teal-500",
    textColor: "text-teal-500",
  },
  {
    id: "lifestyle-other",
    name: "Science & Lifestyle",
    description: "Science, health, sports, food, travel, and personal interests",
    icon: "Sparkles",
    color: "bg-green-500",
    textColor: "text-green-500",
  },
];

export function getCategoryMeta(categoryId: string): DiscoverCategoryMeta | undefined {
  return DISCOVER_CATEGORIES.find((c) => c.id === categoryId);
}
