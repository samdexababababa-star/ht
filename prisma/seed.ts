import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Make sure settings exist with sensible defaults so the homepage looks great
  // before any operator config.
  await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  const seedCats = [
    { name: "Streaming", icon: "▷", description: "Netflix, Spotify, Disney+, more." },
    { name: "AI tools", icon: "✱", description: "ChatGPT Plus, Midjourney, Claude, Cursor." },
    { name: "Gaming", icon: "◇", description: "Xbox, PSN, Steam wallet, top-ups." },
    { name: "Followers & growth", icon: "↗", description: "Instagram, TikTok, YouTube boosts." },
  ];

  for (const c of seedCats) {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: c.name,
        icon: c.icon,
        description: c.description,
        visible: true,
      },
    });
  }

  const cats = await prisma.category.findMany();
  const cat = (n: string) => cats.find((c) => c.name === n)!;

  const products = [
    {
      slug: "netflix-premium",
      name: "Netflix Premium",
      tagline: "4K, 4 screens, no ads.",
      basePrice: 1499,
      compareAtPrice: 2299,
      categoryId: cat("Streaming").id,
      featured: true,
      badge: "BEST SELLER",
      scarcityEnabled: true,
      scarcityText: "Only 6 left at this price",
      variants: [
        { name: "1 month", price: 1499, durationDays: 30 },
        { name: "3 months", price: 3999, durationDays: 90 },
        { name: "12 months", price: 13999, compareAtPrice: 21900, durationDays: 365 },
      ],
    },
    {
      slug: "chatgpt-plus",
      name: "ChatGPT Plus",
      tagline: "GPT-5 access, fast and unlimited.",
      basePrice: 1999,
      categoryId: cat("AI tools").id,
      featured: true,
      badge: "NEW",
      variants: [
        { name: "1 month", price: 1999, durationDays: 30 },
        { name: "3 months", price: 5499, durationDays: 90 },
      ],
    },
    {
      slug: "spotify-premium",
      name: "Spotify Premium",
      tagline: "Lossless, offline, ad-free.",
      basePrice: 999,
      categoryId: cat("Streaming").id,
      featured: false,
      variants: [
        { name: "1 month", price: 999, durationDays: 30 },
        { name: "12 months", price: 9999, durationDays: 365 },
      ],
    },
    {
      slug: "instagram-followers-1k",
      name: "Instagram followers — 1,000 pack",
      tagline: "Organic-looking, no drops, fast delivery.",
      basePrice: 799,
      categoryId: cat("Followers & growth").id,
      kind: "followers",
      deliveryMode: "auto",
      featured: true,
      variants: [
        { name: "1,000 followers", price: 799 },
        { name: "5,000 followers", price: 2999 },
        { name: "10,000 followers", price: 4999, compareAtPrice: 7999 },
      ],
    },
    {
      slug: "ps-plus-essential",
      name: "PlayStation Plus Essential",
      tagline: "Online play + monthly games.",
      basePrice: 1099,
      categoryId: cat("Gaming").id,
      variants: [
        { name: "1 month", price: 1099, durationDays: 30 },
        { name: "12 months", price: 6999, durationDays: 365 },
      ],
    },
    {
      slug: "midjourney-standard",
      name: "Midjourney Standard",
      tagline: "Unlimited slow-mode generations.",
      basePrice: 2999,
      categoryId: cat("AI tools").id,
      variants: [{ name: "1 month", price: 2999, durationDays: 30 }],
    },
  ];

  for (const p of products) {
    const { variants, ...data } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        currency: "USD",
        kind: data.kind ?? "subscription",
        visible: true,
        variants: { create: variants },
      },
    });
  }

  console.log("Seeded categories + products.");
}

main().finally(() => prisma.$disconnect());
