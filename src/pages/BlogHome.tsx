import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostsStore } from '../store/posts';

export function BlogHome() {
  const { posts, loading, error, fetchPosts } = usePostsStore();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Unable to load posts</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Welcome to MAF Blog
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Sharing thoughts, stories, and ideas on technology, design, and everything in between.
        </p>
      </section>

      {/* Posts List */}
      <section>
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No posts yet.</p>
            <p className="text-gray-400 mt-2">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => {
              const date = new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              
              // Strip HTML tags for excerpt
              const excerpt = post.content.replace(/<[^>]*>/g, '').substring(0, 200);
              
              return (
                <article key={post.id} className="group">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                      <header className="mb-3">
                        <time className="text-sm text-gray-500">{date}</time>
                        <h2 className="text-2xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h2>
                      </header>
                      <p className="text-gray-600 leading-relaxed">
                        {excerpt}
                        {post.content.length > 200 ? '...' : ''}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 font-medium">
                        <span>Read more</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
        <p className="text-blue-100 mb-4">Get notified when new posts are published.</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); if (validateEmail(email)) { alert('Thanks for subscribing!'); setEmail(''); } }}>
          <div className="flex-1">
            <input 
              type="email" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
              onBlur={() => validateEmail(email)}
              placeholder="Enter your email" 
              className={`w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white ${emailError ? 'ring-2 ring-red-500' : ''}`}
            />
            {emailError && <p className="text-red-200 text-sm text-left mt-1">{emailError}</p>}
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
