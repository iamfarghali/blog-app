import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

function isAuthorized(req: VercelRequest): boolean {
  const apiKey = req.headers['x-api-key'];
  return apiKey === process.env.API_KEY;
}

const postCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1),
  published: z.boolean().optional(),
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'GET') {
    try {
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not set in environment');
        return res.status(500).json({ error: 'DATABASE_URL not configured', env: !!process.env.DATABASE_URL });
      }
      const posts = await getPrisma().post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(posts);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('Error fetching posts:', errMsg);
      return res.status(500).json({ error: 'Internal server error', message: errMsg, stack: error instanceof Error ? error.stack : undefined });
    }
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const data = postCreateSchema.parse(req.body);
      const post = await getPrisma().post.create({
        data: { ...data, published: data.published ?? false },
      });
      return res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}