import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import AnimatedBackground from '@/components/ui/animated-background';
import { useTranslation } from '@/hooks/useTranslation';

const Hero = () => {
  const { t } = useTranslation();
  const heroTranslations = t('hero');

  return (
    <Section className="relative min-h-[100vh] flex items-center pt-16"> 
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-700" />
      
      {/* Animated Background */}
      <AnimatedBackground 
        className="absolute inset-0 opacity-20" 
        dotColor="rgb(255,255,255)"
        dotCount={75}
      />

      {/* Content */}
      <Container className="relative z-10 text-center md:text-left">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white [text-wrap:balance]">
            {heroTranslations.title}
          </h1>
          <p className="text-xl mb-8 text-secondary-50">
            {heroTranslations.description}
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Button variant="primary" size="lg">
              {heroTranslations.learnMore}
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
              {heroTranslations.contactUs}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Hero;
