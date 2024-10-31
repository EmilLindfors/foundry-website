// components/navigation/nav-header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function NavHeader() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  // Add scroll listener to handle background transparency
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    if (isLandingPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isLandingPage]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const theme = useTheme();

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
        isLandingPage && !isScrolled
          ? 'bg-transparent border-transparent'
          : 'bg-light/80 dark:bg-dark/80 border-b border-light dark:border-dark backdrop-blur-sm',
        isMenuOpen && 'bg-light dark:bg-dark border-b border-light dark:border-dark'
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={cn(
              "text-2xl font-bold transition-colors duration-200",
              isLandingPage && !isScrolled
                ? 'text-white'
                : 'text-primary-500 dark:text-primary-400'
            )}
            onClick={closeMenu}
          >
         <img src= {isLandingPage && !isScrolled || theme.theme === 'dark' ? 'logo_dark.png' : 'logo_light.png'} alt="Lindfors Foundry" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isLandingPage && !isScrolled
                    ? 'text-white/80 hover:text-white'
                    : cn(
                      'hover:text-primary-500 dark:hover:text-primary-400',
                      location.pathname === item.href
                        ? 'text-primary-500 dark:text-primary-400'
                        : 'text-light-secondary dark:text-dark-secondary'
                    )
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <ThemeToggle
              className={cn(
                isLandingPage && !isScrolled && 'text-white hover:bg-white/10'
              )}
            />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "md:hidden",
                isLandingPage && !isScrolled && 'text-white hover:bg-white/10'
              )}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-light dark:border-dark bg-light dark:bg-dark">
          <Container>
            <nav className="flex flex-col py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary-500 dark:hover:text-primary-400 px-2 py-1 rounded-md',
                    location.pathname === item.href
                      ? 'text-primary-500 dark:text-primary-400 bg-light-surface dark:bg-dark-surface'
                      : 'text-light-secondary dark:text-dark-secondary'
                  )}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}