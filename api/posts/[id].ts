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

function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id } = req.query;
  const param = String(id);

  if (req.method === 'GET') {
    const prismaClient = getPrisma();
    const where = isUUID(param) 
      ? { id: param } 
      : { slug: param };
    const post = await prismaClient.post.findUnique({ where });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.json(post);
  }

  if (req.method === 'PUT') {
    const prismaClient = getPrisma();
    const { title, content, slug, published } = req.body;
    const post = await prismaClient.post.update({
      where: { id: param },
      data: { title, content, slug, published },
    });
    return res.json(post);
  }

  if (req.method === 'DELETE') {
    const prismaClient = getPrisma();
    await prismaClient.post.delete({
      where: { id: param },
    });
    return res.status(204).send();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
