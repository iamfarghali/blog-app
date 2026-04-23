import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostsStore } from '../store/posts';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, createPost, updatePost, loading, fetchAdminPosts } = usePostsStore();
  const isEditing = Boolean(id);

  const existingPost = useMemo(
    () => posts.find((p) => p.id === id),
    [posts, id]
  );

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { error } = usePostsStore();

  const initialState = useMemo(() => {
    if (existingPost) {
      return {
        title: existingPost.title,
        slug: existingPost.slug,
        content: existingPost.content,
        published: existingPost.published,
      };
    }
    return { title: '', slug: '', content: '', published: false };
  }, [existingPost]);

  const [title, setTitle] = useState(initialState.title);
  const [slug, setSlug] = useState(initialState.slug);
  const [content, setContent] = useState(initialState.content);
  const [published, setPublished] = useState(initialState.published);

  useEffect(() => {
    if (posts.length === 0) {
      fetchAdminPosts();
    }
  }, [fetchAdminPosts, posts.length]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const autoSave = useCallback(async () => {
    if (!title || !slug || !content || (!isEditing && !title)) return;
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updatePost(id, { title, slug, content, published });
      } else {
        await createPost({ title, slug, content, published });
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, slug, content, published, isEditing, id, updatePost, createPost]);

  useEffect(() => {
    if (!title || !slug || !content) return;
    const timer = setTimeout(autoSave, 3000);
    return () => clearTimeout(timer);
  }, [title, slug, content, published, autoSave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && id) {
      await updatePost(id, { title, slug, content, published });
    } else {
      await createPost({ title, slug, content, published });
    }
    navigate('/admin');
  };

  if (!isEditing && id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          Error: {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEditing ? 'Edit Post' : 'New Post'}
        </h2>
        {lastSaved && (
          <span className="text-sm text-gray-500">
            {isSaving ? 'Saving...' : `Saved at ${lastSaved.toLocaleTimeString()}`}
          </span>
        )}
      </div>

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
          <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
            <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-gray-300' : ''}`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-gray-300' : ''}`}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-300' : ''}`}
              >
                •
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-300' : ''}`}
              >
                1.
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('blockquote') ? 'bg-gray-300' : ''}`}
              >
                "
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('codeBlock') ? 'bg-gray-300' : ''}`}
              >
                {'</>'}
              </button>
            </div>
            <EditorContent editor={editor} className="min-h-[300px] p-3 prose max-w-none" />
          </div>
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
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
