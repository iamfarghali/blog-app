import { useEffect, useState } from 'react';

interface AnalyticsData {
  id: string;
  title: string;
  slug: string;
  views: number;
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const totalViews = data.reduce((sum, post) => sum + post.views, 0);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="text-3xl font-bold text-gray-900">{totalViews}</div>
        <div className="text-sm text-gray-500">Total page views</div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {data.map((post) => (
          <div key={post.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{post.title}</div>
              <div className="text-sm text-gray-500">/{post.slug}</div>
            </div>
            <div className="text-lg font-semibold text-gray-900">{post.views}</div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="p-4 text-center text-gray-500">No data yet</div>
        )}
      </div>
    </div>
  );
}