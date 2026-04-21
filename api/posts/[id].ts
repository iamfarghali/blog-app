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
  const { id } = req.query;

  if (req.method === 'PUT') {
    const prismaClient = getPrisma();
    const { title, content, slug, published } = req.body;
    const post = await prismaClient.post.update({
      where: { id: String(id) },
      data: { title, content, slug, published },
    });
    return res.json(post);
  }

  if (req.method === 'DELETE') {
    const prismaClient = getPrisma();
    await prismaClient.post.delete({
      where: { id: String(id) },
    });
    return res.status(204).send();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
