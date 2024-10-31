# Blog Compiler

A robust Rust-based static blog compiler that transforms Markdown content into a full-featured blog with image optimization.

## Features

### 📝 Markdown Processing
- Supports YAML frontmatter for post metadata
- Converts Markdown to HTML while preserving formatting
- Handles advanced Markdown features including tables, footnotes, and strikethrough

### 🖼️ Image Processing
- Automatic cover image processing with three variants:
  - Original: Preserves the source image
  - Cover (1200px): Optimized for article headers
  - Thumbnail (400px): Perfect for previews and listings
- Smart filename handling with clean, consistent naming patterns
- Maintains aspect ratios during resizing
- Outputs web-optimized images

### 📄 Content Management
- Generates a full content index for easy navigation
- Creates individual JSON files for each post
- Supports tags for content organization
- Includes post metadata such as:
  - Title
  - Publication date
  - Description
  - Tags
  - Cover image paths

### 🗂️ Output Structure
```
public/
  └── images/
      └── blog/
          ├── post-slug-image.jpg
          ├── post-slug-image-cover.jpg
          └── post-slug-image-thumb.jpg
src/
  └── assets/
      └── content/
          ├── index.json
          └── post-slug.json
```

## Usage

### Post Format
```markdown
---
title: My First Post
date: 2024-03-20T12:00:00Z
description: A brief introduction
tags: intro, welcome
cover: header-image.jpg
---

Your markdown content here...
```

### Building
```bash
cargo run
```

The compiler will:
1. Process all Markdown files in the `content` directory
2. Generate optimized images in the `public/images/blog` directory
3. Create JSON files in `src/assets/content`
4. Build a complete index of all posts

## Integration

Works seamlessly with React/Vite projects, providing:
- Optimized image loading with srcSet support
- Lazy loading for better performance
- Responsive image handling
- Clean URL paths for both development and production

## Requirements

- Rust 2021 edition or later
- Image processing libraries (specified in Cargo.toml)
- Source markdown files in the `content` directory