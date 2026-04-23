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
      .then((res) => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
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
      .catch(() => {
        setPost(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-500 mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center text-gray-500 text-sm">
          <time dateTime={post.createdAt}>{date}</time>
          <span className="mx-2">•</span>
          <span>5 min read</span>
        </div>
      </header>

      {/* Post Content */}
      <div className="prose prose-lg prose-gray max-w-none">
        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Post Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm">Share:</span>
            <button className="text-gray-400 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.203-.415 5.304-.415 5.304 0 3.59 2.31 6.735 5.508 8.179-.276.075-.567.131-.867.131-2.151 0-3.893-1.78-4.645-4.255-.687.234-1.464.402-2.236.493-1.06-.45-2.207-.717-3.453-.717-2.62 0-4.922 2.197-4.922 4.807 0 .392.045.77.127 1.133-4.107-.205-7.903-2.115-10.215-5.008-.417.711-.652 1.537-.652 2.418 0 .886.343 1.672.87 2.131-.633-.019-1.227-.194-1.743-.487.172.538.674 1.003 1.273 1.015-.468.143-1.01.195-1.564.14.865 2.692 3.482 4.84 4.31.635-.192 1.23-.303 1.893-.303z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </article>
  );
}
