import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Tag } from './tag';

export interface PostCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  imageUrl?: string;
  readTime?: string;
  href: string;
}

const PostCard = React.forwardRef<HTMLDivElement, PostCardProps>(({
  className,
  title,
  date,
  description,
  tags,
  imageUrl,
  readTime,
  href,
  ...props
}, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        'group overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-secondary-900/50',
        className
      )}
      {...props}
    >
 <a href={href} className="block h-full">
        <div className={cn(
          'grid',
          imageUrl ? 'grid-rows-[auto_1fr]' : 'h-full'
        )}>
          {imageUrl && (
            <div className="aspect-[1.91/1] w-full overflow-hidden bg-light-surface dark:bg-dark-surface">
              <img 
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className={cn(
            'p-6',
            !imageUrl && 'h-full flex flex-col'
          )}>
             <div className="flex items-center gap-2 text-sm text-light-tertiary dark:text-dark-tertiary mb-2">
              <time dateTime={new Date(date).toISOString()}>
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              {readTime && (
                <>
                  <span>•</span>
                  <span>{readTime}</span>
                </>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2 text-light-primary dark:text-dark-primary group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
              {title}
            </h2>
            {description && (
              <p className={cn(
               "text-light-secondary dark:text-dark-secondary",
                imageUrl ? 'line-clamp-2' : 'line-clamp-3 mb-4'
              )}>
                {description}
              </p>
            )}
            {tags && tags.length > 0 && (
              <div className={cn(
                "flex gap-2 flex-wrap",
                imageUrl ? 'mt-4' : 'mt-auto pt-4'
              )}>
                {tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
        </div>
      </a>
    </Card>
  );
});
PostCard.displayName = 'PostCard';

export { PostCard };

export default PostCard;