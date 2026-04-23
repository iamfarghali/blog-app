import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isAuthorized(req: VercelRequest): boolean {
  const apiKey = req.headers['x-api-key'];
  return apiKey === process.env.API_KEY;
}

function handlePrismaError(error: unknown, res: VercelResponse): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Post not found' });
      return true;
    }
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Unique constraint violation' });
      return true;
    }
  }
  return false;
}

const postUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id } = req.query;
  const param = String(id);

  if (req.method === 'GET') {
    try {
      const where = isUUID(param) 
        ? { id: param } 
        : { slug: param };
      const post = await prisma.post.findUnique({ where });
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    if (!isUUID(param)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
      const data = postUpdateSchema.parse(req.body);
      const post = await prisma.post.update({
        where: { id: param },
        data,
      });
      return res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      if (handlePrismaError(error, res)) {
        return;
      }
      console.error('Error updating post:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!isUUID(param)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
      await prisma.post.delete({
        where: { id: param },
      });
      return res.status(204).send(null);
    } catch (error) {
      if (handlePrismaError(error, res)) {
        return;
      }
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}