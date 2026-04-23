import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

function isAuthorized(req: VercelRequest): boolean {
  const apiKey = req.headers['x-api-key'];
  return apiKey === process.env.API_KEY;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const posts = await prisma.post.findMany({
      include: {
        _count: {
          select: { pageViews: true },
        },
      },
    });
    const result = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      views: post._count.pageViews,
    }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
