import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { FeatureCard } from '@/components/ui/feature-card';
import { Card, CardContent } from '@/components/ui/card';

import { Microchip, Brain, Fish, Github, Linkedin } from 'lucide-react';
import Hero from '@/components/page-components/hero';
import { FormField, FormLabel, FormControl, FormMessage, FormRoot, FormSubmit, TextArea, Select } from '@/components/ui/form';
import { Input } from '@/components/ui/input';



const LandingPage = () => {
  return (
    <>
      <section className="relative min-h-[600px] bg-gradient-to-r from-secondary-900 to-secondary-700">
        {/* Hero Section */}
        <Hero />
      </section>

      {/* Expertise Section */}
      <Section variant="alt">
        <Container>
          <h2 className="text-3xl font-bold mb-12 text-center">Core Expertise</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Microchip className="w-8 h-8" />}
              title="Rust Development"
              description="High-performance, memory-safe solutions built with Rust for mission-critical aquaculture systems."
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Integration"
              description="Custom AI solutions for monitoring, prediction, and optimization of aquaculture operations."
            />
            <FeatureCard
              icon={<Fish className="w-8 h-8" />}
              title="Aquaculture Focus"
              description="Deep understanding of Norwegian aquaculture industry needs and challenges."
            />
          </div>
        </Container>
      </Section>

      {/* About Section */}
      <Section>
        <Container>
          <div className="md:grid md:grid-cols-2 gap-12 items-center">
            <div className="mb-8 md:mb-0">
              <div className="aspect-square rounded-layout overflow-hidden bg-light-surface dark:bg-dark-surface">
                <img
                  src="/api/placeholder/800/800"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">About Lindfors Foundry</h2>
              <div className="space-y-4 text-light-secondary dark:text-dark-secondary">
                <p>
                  As an independent consultant, I specialize in developing cutting-edge AI solutions
                  for the Norwegian aquaculture industry. With expertise in Rust programming and
                  artificial intelligence, I help fish farming operations optimize their processes
                  and embrace sustainable technologies.
                </p>
                <p>
                  Every project is handled personally, ensuring direct communication and
                  tailored solutions that precisely match your needs.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Contact Section */}
      <Section variant="alt" id="contact">
        <Container size="sm">
          <h2 className="text-3xl font-bold mb-12 text-center">Get in Touch</h2>
          <Card>
            <CardContent className="space-y-6">
              <FormRoot>
                <FormField name="email" className='py-4'>
                  <div className="flex justify-between items-baseline">
                    <FormLabel>Email</FormLabel>
                    <FormMessage match="valueMissing">Please enter your email</FormMessage>
                    <FormMessage match="typeMismatch">Please provide a valid email</FormMessage>
                  </div>
                  <FormControl>
                    <Input type="email" required name="email" />
                  </FormControl>
                </FormField>
                <FormField name="enquiryType" className='py-4'>
                  <div className="flex justify-between items-baseline">
                    <FormLabel>Type of Enquiry</FormLabel>
                    <FormMessage match="valueMissing">Please enter your type of enquiry</FormMessage>
                    <FormMessage match="typeMismatch">Please provide a valid enquiry</FormMessage>
                  </div>
                  <FormControl>
                    <Select
                      name="enquiryType"
                      options={[
                        { value: 'general', label: 'General Enquiry' },
                        { value: 'project', label: 'Project Inquiry' },
                        { value: 'question', label: 'Question' },
                      ]}
                      required
                    />
                  </FormControl>
                </FormField>
                <FormField name="question">
                  <div className="flex justify-between items-baseline">
                    <FormLabel>Question</FormLabel>
                    <FormMessage match="valueMissing">Please enter a question</FormMessage>
                  </div>
                  <FormControl>
                    <TextArea name="question" className="Textarea" required />
                  </FormControl>
                </FormField>

                <div className="flex justify-end mt-4">
                <FormSubmit type="submit" >
                  Send Message
                </FormSubmit>
                </div>
              </FormRoot>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white">Lindfors Foundry</h3>
              <p className="mt-2 text-secondary-100">AI Solutions for Norwegian Aquaculture</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-100 hover:text-white transition-theme duration-theme">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-secondary-100 hover:text-white transition-theme duration-theme">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-secondary-300">
            © 2024 Lindfors Foundry. All rights reserved.
          </div>
        </Container>
      </footer>
    </>
  );
};

export default LandingPage;