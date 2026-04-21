import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const key = req.headers['x-api-key'];
  if (!API_KEY || key !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/posts', async (_req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/posts', authMiddleware, async (_req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

app.get('/api/posts/:slug', async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
    });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

const postCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1),
  published: z.boolean().optional(),
});

app.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const data = postCreateSchema.parse(req.body);
    const post = await prisma.post.create({
      data: { ...data, published: data.published ?? false },
    });
    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    next(error);
  }
});

const postUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

app.put('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!/^[a-f0-9-]{36}$/i.test(req.params.id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }
    const data = postUpdateSchema.parse(req.body);
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data,
    });
    res.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    next(error);
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!/^[a-f0-9-]{36}$/i.test(req.params.id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }
    await prisma.post.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

const analyticsViewSchema = z.object({
  postId: z.string().uuid(),
});

app.post('/api/analytics/view', async (req, res, next) => {
  try {
    const { postId } = analyticsViewSchema.parse(req.body);
    const pageView = await prisma.pageView.create({
      data: { postId },
    });
    res.status(201).json(pageView);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    next(error);
  }
});

app.get('/api/analytics', async (_req, res, next) => {
  try {
    const analytics = await prisma.post.findMany({
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
  } catch (error) {
    next(error);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;