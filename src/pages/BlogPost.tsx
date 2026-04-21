import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Post } from '../store/posts';

export function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const tracked = useRef(false);

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        if (data?.id && !tracked.current) {
          tracked.current = true;
          fetch('/api/analytics/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: data.id }),
          }).catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Post not found</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-2xl mx-auto">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
      <time className="text-gray-500 mb-8 block">{date}</time>
      <div className="prose prose-gray max-w-none whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}