import { Link, Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            MAF Blog
          </Link>
          <nav className="flex gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}