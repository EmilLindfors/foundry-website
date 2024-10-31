import { Post } from "@/types/blog"

// Import all JSON files from assets - adjust the path according to your build output
const postFiles = import.meta.glob<Post>('/src/assets/content/*.json', { eager: true })

// Convert the imported object into an array and sort by date
export const allPosts = Object.entries(postFiles).map(([path, post]) => ({
  ...post,
  // Extract slug from filename (e.g., /src/assets/first-post.json -> first-post)
  slug: path.split('/').pop()?.replace('.json', '') ?? ''
})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// Debugging - remove this in production
console.log('Found posts:', allPosts)