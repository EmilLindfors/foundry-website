use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use image::ImageFormat;
use pulldown_cmark::{Event, MetadataBlockKind, Options, Parser, Tag, TagEnd};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::BufWriter;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Serialize, Deserialize)]
struct Post {
    title: String,
    date: DateTime<Utc>,
    slug: String,
    content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    cover: Option<CoverImage>,
}

#[derive(Serialize, Deserialize)]
struct CoverImage {
    original: String,
    cover: String,
    thumbnail: String,
}

#[derive(Default, Deserialize)]
struct PostMetadata {
    title: Option<String>,
    date: Option<DateTime<Utc>>,
    description: Option<String>,
    tags: Option<String>,
    cover: Option<String>,
}

#[derive(Serialize)]
struct PostIndex {
    posts: Vec<PostSummary>,
}

#[derive(Serialize)]
struct PostSummary {
    title: String,
    date: DateTime<Utc>,
    slug: String,
    description: Option<String>,
    tags: Vec<String>,
    cover: Option<CoverImage>,
}

fn sanitize_filename(filename: &str) -> String {
    // Remove the file extension if present
    if let Some(stem) = Path::new(filename).file_stem() {
        stem.to_string_lossy().to_string()
    } else {
        filename.to_string()
    }
}

fn process_image(
    source_path: &Path,
    slug: &str,
    filename: &str,
) -> Result<Option<CoverImage>> {
    let img = image::open(source_path)
        .with_context(|| format!("Failed to open image: {}", source_path.display()))?;

    // Create image output directory in public folder
    let image_dir = PathBuf::from("../public/images/blog");
    fs::create_dir_all(&image_dir)?;

    // Clean up the filename by removing extension
    let base_name = sanitize_filename(filename);
    
    // Get the extension from the source file, defaulting to jpg
    let ext = source_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg");
    
    // Construct the final base name with slug
    let final_name = format!("{}-{}", slug, base_name);
    
    // Define paths relative to public directory for serving
    let original_path = format!("/images/blog/{}.{}", final_name, ext);
    let cover_path = format!("/images/blog/{}-cover.{}", final_name, ext);
    let thumb_path = format!("/images/blog/{}-thumb.{}", final_name, ext);

    // Save original
    let original_file = File::create(image_dir.join(format!("{}.{}", final_name, ext)))?;
    let mut original_writer = BufWriter::new(original_file);
    img.write_to(&mut original_writer, ImageFormat::from_extension(ext).unwrap_or(ImageFormat::Jpeg))?;

    // Create and save cover (1200px wide)
    let cover = img.resize(1200, 800, image::imageops::FilterType::Lanczos3);
    let cover_file = File::create(image_dir.join(format!("{}-cover.{}", final_name, ext)))?;
    let mut cover_writer = BufWriter::new(cover_file);
    cover.write_to(&mut cover_writer, ImageFormat::from_extension(ext).unwrap_or(ImageFormat::Jpeg))?;

    // Create and save thumbnail (400px wide)
    let thumb = img.resize(400, 267, image::imageops::FilterType::Lanczos3);
    let thumb_file = File::create(image_dir.join(format!("{}-thumb.{}", final_name, ext)))?;
    let mut thumb_writer = BufWriter::new(thumb_file);
    thumb.write_to(&mut thumb_writer, ImageFormat::from_extension(ext).unwrap_or(ImageFormat::Jpeg))?;

    Ok(Some(CoverImage {
        original: original_path,
        cover: cover_path,
        thumbnail: thumb_path,
    }))
}

fn parse_metadata_and_content(content: &str) -> Result<(PostMetadata, String)> {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_YAML_STYLE_METADATA_BLOCKS);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);

    let parser = Parser::new_ext(content, options);
    let mut metadata_str = String::new();
    let mut content_events = Vec::new();
    let mut in_metadata = false;

    for event in parser {
        match &event {
            Event::Start(Tag::MetadataBlock(MetadataBlockKind::YamlStyle)) => {
                in_metadata = true;
            }
            Event::End(TagEnd::MetadataBlock(MetadataBlockKind::YamlStyle)) => {
                in_metadata = false;
            }
            Event::Text(text) if in_metadata => {
                metadata_str.push_str(text);
            }
            _ if !in_metadata => {
                content_events.push(event);
            }
            _ => {}
        }
    }

    // Parse metadata
    let metadata: PostMetadata =
        serde_yaml::from_str(&metadata_str).context("Failed to parse YAML metadata")?;

    // Convert content events back to HTML
    let mut html_output = String::new();
    pulldown_cmark::html::push_html(&mut html_output, content_events.into_iter());

    Ok((metadata, html_output))
}

fn process_file(path: &Path, content_dir: &Path) -> Result<Post> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read file: {}", path.display()))?;

    let (metadata, html_content) = parse_metadata_and_content(&content)?;

    let slug = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("untitled")
        .to_string();

    let cover = if let Some(cover_filename) = metadata.cover {
        let image_path = path.parent().unwrap_or(content_dir).join(&cover_filename);
        if image_path.exists() {
            process_image(&image_path, &slug, &cover_filename)?
        } else {
            None
        }
    } else {
        None
    };

    // Extract and process metadata with defaults
    let title = metadata.title.unwrap_or_else(|| "Untitled".to_string());
    let date = metadata.date.unwrap_or_else(|| Utc::now());
    let tags = metadata
        .tags
        .map(|t| t.split(',').map(|s| s.trim().to_string()).collect())
        .unwrap_or_default();

    Ok(Post {
        title,
        date,
        slug,
        content: html_content,
        description: metadata.description,
        tags,
        cover,
    })
}

fn main() -> Result<()> {
    let content_dir = PathBuf::from("../content");
    let output_dir = PathBuf::from("../src/assets/content");

    // Create output directory if it doesn't exist
    fs::create_dir_all(&output_dir)?;

    let mut posts = Vec::new();

    // Process all markdown files
    for entry in WalkDir::new(&content_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("md"))
    {
        let post = process_file(entry.path(), &content_dir)?;

        // Write individual post file
        let post_path = output_dir.join(format!("{}.json", post.slug));
        let post_file = File::create(&post_path)?;
        serde_json::to_writer_pretty(post_file, &post)?;

        // Add to index
        posts.push(PostSummary {
            title: post.title.clone(),
            date: post.date,
            slug: post.slug,
            description: post.description.clone(),
            tags: post.tags,
            cover: post.cover,
        });
    }

    // Sort posts by date (newest first)
    posts.sort_by(|a, b| b.date.cmp(&a.date));

    let len = posts.len();

    // Write index file
    let index = PostIndex { posts };
    let index_path = output_dir.join("index.json");
    let index_file = File::create(index_path)?;
    serde_json::to_writer_pretty(index_file, &index)?;

    println!("✨ Generated {} posts", len);
    Ok(())
}
