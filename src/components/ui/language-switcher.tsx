import { useLanguage } from '@/contexts/language-context';
import { Button } from './button';

interface LanguageSwitcherProps {
  className?: string;
}


export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
      aria-label={language === 'en' ? 'Switch to Norwegian' : 'Switch to English'}
    >
      {language === 'en' ? '🇳🇴' : '🇬🇧'}
    </Button>
  );
}
