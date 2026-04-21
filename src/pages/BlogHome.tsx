import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePostsStore } from '../store/posts';

export function BlogHome() {
  const { posts, loading, fetchPosts } = usePostsStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">MAF Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => {
          const date = new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          return (
            <div key={post.id} className="border-b border-gray-200 pb-8">
              <Link to={`/blog/${post.slug}`} className="block group">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-2">{post.content.substring(0, 150)}...</p>
                <time className="text-sm text-gray-500">{date}</time>
              </Link>
            </div>
          );
        })}
        {posts.length === 0 && (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
}