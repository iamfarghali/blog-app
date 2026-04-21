import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostsStore } from '../store/posts';

export function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, createPost, updatePost, loading, fetchPosts } = usePostsStore();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    }
  }, [fetchPosts, posts.length]);

  const post = posts.find((p) => p.id === id);
  if (post && !title && !content) {
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setPublished(post.published);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && id) {
      await updatePost(id, { title, slug, content, published });
    } else {
      await createPost({ title, slug, content, published });
    }
    navigate('/');
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEditing ? 'Edit Post' : 'New Post'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="published" className="text-sm text-gray-700">
            Published
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}