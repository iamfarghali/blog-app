# Blog App

A personal blog built with React, TypeScript, Vite, and Prisma.

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://..."
API_KEY="your-secure-api-key"
ALLOWED_ORIGIN="http://localhost:5173"
```

## Deployment (Vercel)

Set these in Vercel project settings:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `API_KEY` | Secret key for admin API operations |
| `ALLOWED_ORIGIN` | Your production domain |

## Security Note

The admin API uses a simple API key authentication. This is suitable for personal blogs where:
- You are the only user
- The key grants full admin access
- The key is embedded in the client bundle (visible to anyone who inspects)

For multi-user applications, implement proper JWT/session authentication.

## Tech Stack

- React 19 + TypeScript
- Vite
- TailwindCSS
- TipTap (rich text editor)
- Prisma (PostgreSQL)
- Zustand (state)
- Express (dev server)
- Vercel (deployment)