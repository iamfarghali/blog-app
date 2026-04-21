import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { PostList } from './pages/PostList';
import { PostEditor } from './pages/PostEditor';
import { Analytics } from './pages/Analytics';
import { BlogHome } from './pages/BlogHome';
import { BlogPost } from './pages/BlogPost';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<PostList />} />
          <Route path="new" element={<PostEditor />} />
          <Route path="edit/:id" element={<PostEditor />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<BlogHome />} />
          <Route path="blog/:slug" element={<BlogPost />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;