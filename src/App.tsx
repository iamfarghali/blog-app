import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PostList } from './pages/PostList';
import { PostEditor } from './pages/PostEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PostList />} />
          <Route path="new" element={<PostEditor />} />
          <Route path="edit/:id" element={<PostEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;