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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ error: 'postId required' });
  }

  const prismaClient = getPrisma();
  const pageView = await prismaClient.pageView.create({
    data: { postId },
  });
  res.status(201).json(pageView);
}
