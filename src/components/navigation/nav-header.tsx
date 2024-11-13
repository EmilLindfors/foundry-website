import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { NavigationMenu } from '@/components/ui/navigation-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslation } from '@/hooks/useTranslation';

export function NavHeader() {
  const { t } = useTranslation();
  const navItems: Record<string, any> = t('nav');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const location = useLocation();

  const isLandingPage: boolean = location.pathname === '/';

  // Add scroll listener to handle background transparency
  useEffect(() => {
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
        <div className="pt-4 md:pt-0 h-auto gap-4 md:h-16 flex-row flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={cn(
              "flex gap-2 items-center text-2xl font-bold transition-colors duration-200 sm:min-w-auto md:min-w-[200px], z-10",
              isLandingPage && !isScrolled || theme.theme === 'dark'
                ? 'text-white hover:text-light-teritary'
                : 'text-dark hover:text-dark-tertiary',
            )}
            onClick={closeMenu}
          >
            <img width={36} height={36} src={isLandingPage && !isScrolled || theme.theme === 'dark' ? './LF_180_white.svg' : './LF_180.svg'} alt="LF" />

            <span className="text-lg font-bold hidden md:block text-nowrap">Lindfors Foundry</span>
          </Link>

          <NavigationMenu landingPage={isLandingPage && !isScrolled} items={Object.values(navItems)} />

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <ThemeToggle
              className={cn(
                isLandingPage && !isScrolled && 'text-white hover:bg-white/10', "z-10"
              )}
            />
            <LanguageSwitcher
              className={cn(
                isLandingPage && !isScrolled && 'text-white hover:bg-white/10', "z-10"
              )}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}