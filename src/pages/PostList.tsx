import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePostsStore } from '../store/posts';

export function PostList() {
  const { posts, loading, error, fetchPosts, deletePost } = usePostsStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading && posts.length === 0) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No posts yet</p>
        <Link
          to="/new"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Posts</h2>
        <Link
          to="/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <Link
                to={`/edit/${post.id}`}
                className="block hover:text-blue-600"
              >
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">{post.slug}</p>
              </Link>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  post.published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {post.published ? 'Published' : 'Draft'}
              </span>
              <Link
                to={`/edit/${post.id}`}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                Edit
              </Link>
              <button
                onClick={() => deletePost(post.id)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}