import { useState, useMemo } from 'react';

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PostCard } from '@/components/ui/post-card';
import { FilterButton } from '@/components/ui/filter-button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import allPosts from '@/assets/content/index.json';

export default function BlogIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allPosts.posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, []);

  // Filter posts based on search and tags
  const filteredPosts = useMemo(() => {
    return allPosts.posts.filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  return (
    <Section>
      <Container size="lg">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Posts Grid */}
          <div className="md:w-3/4 grid gap-8">
            {filteredPosts.map(post => (
              <PostCard
                key={post.slug}
                href={`/blog/${post.slug}`}
                title={post.title}
                date={new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                description={post.description}
                tags={post.tags}
                imageUrl={post.cover?.thumbnail || undefined}
              />
            ))}

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-light-secondary dark:text-dark-secondary text-lg mb-4">
                  No posts found matching your criteria
                </p>
                <FilterButton onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}>
                  Clear filters
                </FilterButton>
              </div>
            )}
          </div>
          {/* Aside for Search and Filters */}
          <aside className="md:w-1/4 space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-light-primary dark:text-dark-primary">
                Blog Posts
              </h1>
              <p className="text-light-secondary dark:text-dark-secondary text-lg">
                Thoughts and insights on AI, Rust, and aquaculture technology
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-tertiary dark:text-dark-tertiary h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <FilterButton
                  active={!selectedTag}
                  onClick={() => setSelectedTag(null)}
                >
                  All
                </FilterButton>
                {allTags.map(tag => (
                  <FilterButton
                    key={tag}
                    active={selectedTag === tag}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </FilterButton>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </Container>
    </Section>
  );
}