import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prismaClient = getPrisma();
  const analytics = await prismaClient.post.findMany({
    include: {
      _count: {
        select: { pageViews: true },
      },
    },
  });
  const result = analytics.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    views: post._count.pageViews,
  }));
  res.json(result);
}
