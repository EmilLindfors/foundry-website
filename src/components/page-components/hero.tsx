import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import AnimatedBackground from '@/components/ui/animated-background';

const Hero = () => {
  return (
    <Section className="relative overflow-hidden min-h-[600px] flex items-center">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-700" />
      
      {/* Animated Background */}
      <AnimatedBackground 
        className="absolute inset-0 opacity-20" 
        dotColor="rgb(255,255,255)"
        dotCount={75}
      />

      {/* Content */}
      <Container className="relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white [text-wrap:balance]">
            AI Solutions for Norwegian Aquaculture
          </h1>
          <p className="text-xl mb-8 text-secondary-50">
            Specialized Rust-based AI consulting for the future of sustainable fish farming
          </p>
          <div className="flex gap-4">
            <Button variant="primary" size="lg">
              Learn More
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
              Contact Us
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Hero;
