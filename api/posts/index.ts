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
  const prismaClient = getPrisma();

  if (req.method === 'GET') {
    const posts = await prismaClient.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(posts);
  }

  if (req.method === 'POST') {
    const { title, content, slug, published } = req.body;
    const post = await prismaClient.post.create({
      data: { title, content, slug, published: published ?? false },
    });
    return res.status(201).json(post);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
