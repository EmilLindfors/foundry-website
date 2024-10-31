import { useParams } from 'react-router-dom';
import { ChevronLeft, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LinkButton } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { Article } from '@/components/ui/article';
import { Prose } from '@/components/ui/prose';
import { allPosts } from '@/lib/content';
import { calculateReadTime } from '@/lib/utils';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <Section>
        <Container size="md" className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4 text-light-primary dark:text-dark-primary">
            Post Not Found
          </h1>
          <p className="text-light-secondary dark:text-dark-secondary mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <LinkButton
            to="/blog"
            variant="ghost"
            leftIcon={<ChevronLeft />}
          >
            Back to Blog
          </LinkButton>
        </Container>
      </Section>
    );
  }
  const imageUrl = post.cover?.cover;
  const thumbnailUrl = post.cover?.thumbnail;
  const readTime = calculateReadTime(post.content);

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <Section>
        <Container size="md">

          <Article>
            {/* Header */}
            <header className="mb-12">
              <div className="flex items-center gap-4 mb-4 text-sm text-light-tertiary dark:text-dark-tertiary">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{readTime}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-light-primary dark:text-dark-primary">
                {post.title}
              </h1>

              {post.description && (
                <p className="text-xl text-light-secondary dark:text-dark-secondary mb-6">
                  {post.description}
                </p>
              )}

              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map(tag => (
                    <Tag key={tag} variant="default">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </header>

            {/* Cover Image */}
            {imageUrl && (
              <div className="mb-12 rounded-xl overflow-hidden bg-light-surface dark:bg-dark-surface border border-light dark:border-dark">
                <img
                  src={imageUrl}
                  alt={post.title}
                  loading="lazy"
                  srcSet={`${thumbnailUrl} 400w, ${imageUrl} 1200w`}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="w-full h-auto aspect-[2/1] object-cover"
                />
              </div>
            )}

            {/* Content */}
            <Prose dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Footer */}
            <footer>
              <div className="flex justify-between">
                <LinkButton
                  to="/blog"
                  variant="ghost"
                  leftIcon={<ChevronLeft />}
                >
                  Previous Post
                </LinkButton>
                <LinkButton
                  to="/blog"
                  variant="ghost"
                  leftIcon={<ChevronRight />}
                >
                  Next Post
                </LinkButton>
              </div>
            </footer>
          </Article>
        </Container>
      </Section>
    </div>
  );
}