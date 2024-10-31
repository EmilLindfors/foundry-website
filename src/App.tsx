import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import LandingPage from './pages/LandingPage';

import { ThemeProvider } from '@/contexts/theme-context';
import { NavHeader } from '@/components/navigation/nav-header';

export default function App() {
  return (

    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-light dark:bg-dark">
          <NavHeader />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </div>
      </ThemeProvider>

    </BrowserRouter>

  );
}