import "dotenv/config";
console.log("DATABASE_URL:", process.env.DATABASE_URL?.slice(0, 50) + "..."); // 앞 50자만 출력
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { COMPANIES } from "../lib/data/companies";
import { PRODUCTS } from "../lib/data/products";
import { POSTS } from "../lib/data/posts";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.pcfEntry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ghgEmission.deleteMany();
  await prisma.post.deleteMany();
  await prisma.company.deleteMany();

  for (const company of COMPANIES) {
    await prisma.company.create({
      data: {
        id: company.id,
        name: company.name,
        country: company.country,
        industry: company.industry,
        emissions: {
          create: company.emissions.map((e) => ({
            id: e.id,
            yearMonth: e.yearMonth,
            sourceId: e.sourceId,
            scope: e.scope,
            activityData: e.activityData,
            emissions: e.emissions,
          })),
        },
      },
    });
  }

  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        functionalUnit: product.functionalUnit,
        totalEmissions: product.totalEmissions,
        companyId: product.companyId,
        pcf: {
          create: product.pcf.map((entry) => ({
            stage: entry.stage,
            emissions: entry.emissions,
            description: entry.description,
          })),
        },
      },
    });
  }

  for (const post of POSTS) {
    await prisma.post.create({
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        companyId: post.resourceUid,
        dateTime: new Date(post.dateTime),
      },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
