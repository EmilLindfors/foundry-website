import { useState } from 'react';
import { Bell, Search, Menu, Moon, Sun, ChevronDown, Settings, User, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };



  return (
    <div className={`min-h-screen transition-theme duration-theme ${isDark ? 'dark' : ''} 
      bg-light dark:bg-dark text-light-primary dark:text-dark-primary`}>
      {/* Navigation Bar */}
      <nav className="border-b border-light dark:border-dark p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-8">
            <Menu className="h-6 w-6" />
            <span className="text-xl font-bold text-primary-500 dark:text-primary-400">Brand Logo</span>
            <div className="hidden md:flex items-center gap-6">
              <span className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer">Dashboard</span>
              <span className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer">Projects</span>
              <span className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer">Team</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-light-surface dark:hover:bg-dark-surface transition-theme duration-theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Bell className="h-5 w-5" />
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-2 rounded hover:bg-light-surface dark:hover:bg-dark-surface"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-300" />
                <ChevronDown className="h-4 w-4" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-layout shadow-light dark:shadow-dark border border-light dark:border-dark bg-light-surface dark:bg-dark-surface py-1">
                  <a className="flex items-center gap-2 px-4 py-2 hover:bg-light dark:hover:bg-dark cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                  <a className="flex items-center gap-2 px-4 py-2 hover:bg-light dark:hover:bg-dark cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                  <a className="flex items-center gap-2 px-4 py-2 hover:bg-light dark:hover:bg-dark cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-layout">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Alex!</h1>
          <p className="text-light-secondary dark:text-dark-secondary">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-layout border border-light dark:border-dark
              bg-light-surface dark:bg-dark-surface
              text-light-primary dark:text-dark-primary
              transition-theme duration-theme"
          />
        </div>

        {/* Alert */}
        <Alert className="mb-8 bg-light-surface dark:bg-dark-surface border border-light dark:border-dark">
          <AlertTitle className="text-primary-500 dark:text-primary-400">
            New Feature Available!
          </AlertTitle>
          <AlertDescription className="text-light-secondary dark:text-dark-secondary">
            Try out our new analytics dashboard for enhanced insights.
          </AlertDescription>
        </Alert>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-light-surface dark:bg-dark-surface border-light dark:border-dark shadow-light dark:shadow-dark">
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-light-secondary dark:text-dark-secondary">Active Projects</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-light-secondary dark:text-dark-secondary">Completed Tasks</span>
                  <span className="font-medium">48</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-light-secondary dark:text-dark-secondary">Team Members</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border-light dark:border-dark shadow-light dark:shadow-dark">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Design review completed', 'New team member added', 'Project deadline updated'].map((activity, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
                    <span className="text-light-secondary dark:text-dark-secondary">{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buttons Demo */}
        <div className="mt-8 space-y-4">
          <div className="space-x-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App
