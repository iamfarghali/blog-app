import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/posts', async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

app.get('/api/posts/:slug', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
  });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json(post);
});

app.post('/api/posts', async (req, res) => {
  const { title, content, slug, published } = req.body;
  const post = await prisma.post.create({
    data: { title, content, slug, published: published ?? false },
  });
  res.status(201).json(post);
});

app.put('/api/posts/:id', async (req, res) => {
  const { title, content, slug, published } = req.body;
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: { title, content, slug, published },
  });
  res.json(post);
});

app.delete('/api/posts/:id', async (req, res) => {
  await prisma.post.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
});

app.post('/api/analytics/view', async (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    res.status(400).json({ error: 'postId required' });
    return;
  }
  const pageView = await prisma.pageView.create({
    data: { postId },
  });
  res.status(201).json(pageView);
});

app.get('/api/analytics', async (_req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;