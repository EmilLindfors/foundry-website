export interface Post {
    title: string;
    date: string;
    slug: string;
    content: string;
    description?: string;
    tags: string[];
    cover?: PostCover;
  }

  export interface PostCover {
    original: string;
    cover: string;
    thumbnail: string;
  }
  
  export interface PostSummary {
    title: string;
    date: string;
    slug: string;
    description?: string;
    tags: string[];
  }
  
  export interface PostIndex {
    posts: PostSummary[];
  }