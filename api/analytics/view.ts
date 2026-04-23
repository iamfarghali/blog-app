import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const analyticsViewSchema = z.object({
  postId: z.string().uuid(),
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postId } = analyticsViewSchema.parse(req.body);
    const pageView = await prisma.pageView.create({
      data: { postId },
    });
    res.status(201).json(pageView);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}