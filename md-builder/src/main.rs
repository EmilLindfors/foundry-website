use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use citations::{parse_markdown_with_citations, CitationConfig};
#[cfg(feature = "cli")]
use clap::Parser;
use config::Config;
use image::ImageFormat;
use indicatif::{ProgressBar, ProgressStyle};
use pulldown_cmark::{Event, MetadataBlockKind, Options, Parser as MarkdownParser, Tag, TagEnd, CodeBlockKind};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::BufWriter;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use syntect::html::{ClassedHTMLGenerator, ClassStyle};
use syntect::parsing::SyntaxSet;
use syntect::util::LinesWithEndings;
use walkdir::WalkDir;
mod citations;
mod config;
mod csl_client;
mod zotero;

pub fn render_code_block(syntax_set: &SyntaxSet, language: &str, code: &str) -> String {
    if language.is_empty() {
        return format!("<pre><code>{}</code></pre>", html_escape::encode_text(code));
    }
    
    let syntax = syntax_set
        .find_syntax_by_token(language)
        .or_else(|| syntax_set.find_syntax_by_extension(language))
        .unwrap_or_else(|| syntax_set.find_syntax_plain_text());
    
    let mut html_generator = ClassedHTMLGenerator::new_with_class_style(
        syntax, 
        syntax_set, 
        ClassStyle::Spaced
    );
    
    for line in LinesWithEndings::from(code) {
        html_generator
            .parse_html_for_line_which_includes_newline(line)
            .unwrap_or_default();
    }
    
    format!(
        "<pre class=\"highlight\"><code class=\"language-{}\">{}</code></pre>",
        language,
        html_generator.finalize()
    )
}


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

#[derive(Debug)]
struct ProcessingTask {
    source_path: std::path::PathBuf,
    output_path: std::path::PathBuf,
}

struct ProcessingStats {
    processed: usize,
    skipped: usize,
}

#[cfg(feature = "cli")]
#[derive(Parser)]
#[command(name = "site-builder")]
#[command(about = "A fast static site generator for markdown content with citation support")]
#[command(version = "0.1.0")]
pub struct Cli {
    /// Configuration file path
    #[arg(short, long, default_value = "config.yaml")]
    pub config: PathBuf,
    
    /// Enable verbose output
    #[arg(short, long)]
    pub verbose: bool,
    
    /// Disable progress bars
    #[arg(long)]
    pub no_progress: bool,
    
    /// Force rebuild all files (ignore incremental processing)
    #[arg(short, long)]
    pub force: bool,
}

fn sanitize_filename(filename: &str) -> String {
    // Remove the file extension if present
    if let Some(stem) = Path::new(filename).file_stem() {
        stem.to_string_lossy().to_string()
    } else {
        filename.to_string()
    }
}

fn get_filter_type(filter_type: &str) -> image::imageops::FilterType {
    match filter_type {
        "Nearest" => image::imageops::FilterType::Nearest,
        "Triangle" => image::imageops::FilterType::Triangle,
        "CatmullRom" => image::imageops::FilterType::CatmullRom,
        "Gaussian" => image::imageops::FilterType::Gaussian,
        "Lanczos3" | _ => image::imageops::FilterType::Lanczos3,
    }
}

fn should_process_file(source_path: &Path, output_path: &Path, force: bool) -> Result<bool> {
    // If force rebuild is requested, always process
    if force {
        return Ok(true);
    }
    
    // If output doesn't exist, we need to process
    if !output_path.exists() {
        return Ok(true);
    }
    
    // Get modification times
    let source_modified = fs::metadata(source_path)?.modified()?;
    let output_modified = fs::metadata(output_path)?.modified()?;
    
    // Process if source is newer than output
    Ok(source_modified > output_modified)
}

fn check_image_needs_processing(
    source_path: &Path,
    output_dir: &Path,
    slug: &str,
    filename: &str,
) -> Result<bool> {
    let base_name = sanitize_filename(filename);
    let final_name = format!("{slug}-{base_name}");
    
    // Get the extension from the source file, defaulting to jpg
    let ext = source_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg");
    
    // Check if any of the output images need updating
    let original_path = output_dir.join(format!("{final_name}.{ext}"));
    let cover_path = output_dir.join(format!("{final_name}-cover.{ext}"));
    let thumb_path = output_dir.join(format!("{final_name}-thumb.{ext}"));
    
    // If any output file doesn't exist or is older than source, we need to process
    for output_path in [&original_path, &cover_path, &thumb_path] {
        if should_process_file(source_path, output_path, false)? {
            return Ok(true);
        }
    }
    
    Ok(false)
}

fn create_cover_image_paths(slug: &str, filename: &str, source_path: &Path) -> CoverImage {
    let base_name = sanitize_filename(filename);
    let final_name = format!("{slug}-{base_name}");
    let ext = source_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg");
    
    CoverImage {
        original: format!("/images/blog/{final_name}.{ext}"),
        cover: format!("/images/blog/{final_name}-cover.{ext}"),
        thumbnail: format!("/images/blog/{final_name}-thumb.{ext}"),
    }
}

fn process_single_image(
    source_path: &Path,
    output_path: &Path,
    target_width: u32,
    target_height: u32,
    filter_type: image::imageops::FilterType,
) -> Result<()> {
    let img = image::open(source_path)
        .with_context(|| format!("Failed to open image for processing: {}", source_path.display()))?;
    
    let resized = img.resize(target_width, target_height, filter_type);
    
    // Ensure parent directory exists
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create output directory: {}", parent.display()))?;
    }
    
    let output_file = File::create(output_path)
        .with_context(|| format!("Failed to create image output file: {}", output_path.display()))?;
    let mut writer = BufWriter::new(output_file);
    
    let format = output_path
        .extension()
        .and_then(|e| e.to_str())
        .and_then(|e| ImageFormat::from_extension(e))
        .unwrap_or(ImageFormat::Jpeg);
    
    resized.write_to(&mut writer, format)
        .with_context(|| format!("Failed to write processed image to: {}", output_path.display()))?;
    
    Ok(())
}

fn process_image(source_path: &Path, slug: &str, filename: &str, config: &Config) -> Result<Option<CoverImage>> {
    // Create image output directory in public folder
    let image_dir = config.public_dir.join("images/blog");
    fs::create_dir_all(&image_dir)?;

    // Check if image processing is needed (incremental processing)
    if !check_image_needs_processing(source_path, &image_dir, slug, filename)? {
        // Return existing paths without processing
        return Ok(Some(create_cover_image_paths(slug, filename, source_path)));
    }

    // Note: We can't access CLI here easily, so we'll always show this message for now
    
    let base_name = sanitize_filename(filename);
    let final_name = format!("{slug}-{base_name}");
    let ext = source_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg");

    // Define output paths
    let original_path = image_dir.join(format!("{final_name}.{ext}"));
    let cover_path = image_dir.join(format!("{final_name}-cover.{ext}"));
    let thumb_path = image_dir.join(format!("{final_name}-thumb.{ext}"));

    let filter_type = get_filter_type(&config.images.filter_type);

    // Process images in parallel
    let processing_tasks = vec![
        (source_path, &original_path, None), // Original (no resize)
        (source_path, &cover_path, Some((config.images.cover_width, config.images.cover_height))),
        (source_path, &thumb_path, Some((config.images.thumbnail_width, config.images.thumbnail_height))),
    ];

    processing_tasks
        .into_par_iter()
        .try_for_each(|(src, dst, resize_params)| -> Result<()> {
            if let Some((width, height)) = resize_params {
                process_single_image(src, dst, width, height, filter_type)
            } else {
                // Copy original
                fs::copy(src, dst).context("Failed to copy original image")?;
                Ok(())
            }
        })?;

    Ok(Some(create_cover_image_paths(slug, filename, source_path)))
}

pub fn parse_metadata_and_content(content: &str, syntax_set: &SyntaxSet) -> Result<(PostMetadata, String)> {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_YAML_STYLE_METADATA_BLOCKS);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_TASKLISTS);

    let parser = MarkdownParser::new_ext(content, options);
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

    // Process content with custom code block handling
    let mut html_output = String::new();
    let mut in_code_block = false;
    let mut code_block_lang = String::new();
    let mut code_block_content = String::new();
    
    for event in content_events {
        match event {
            Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) => {
                in_code_block = true;
                code_block_lang = lang.to_string();
                code_block_content.clear();
            }
            Event::End(TagEnd::CodeBlock) if in_code_block => {
                in_code_block = false;
                let rendered = render_code_block(syntax_set, &code_block_lang, &code_block_content);
                html_output.push_str(&rendered);
            }
            Event::Text(text) if in_code_block => {
                code_block_content.push_str(&text);
            }
            Event::Code(code) => {
                html_output.push_str(&format!("<code>{}</code>", html_escape::encode_text(&code)));
            }
            _ => {
                if !in_code_block {
                    pulldown_cmark::html::push_html(&mut html_output, std::iter::once(event));
                }
            }
        }
    }

    Ok((metadata, html_output))
}

fn process_file(
    path: &Path,
    config: &Config,
    syntax_set: &SyntaxSet,
) -> Result<Post> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read file: {}", path.display()))?;

    let (metadata, html_content) = parse_metadata_and_content(&content, syntax_set)?;

    // Process the content with citations if configuration is available
    let html_content = match (&config.citations.bibliography_path, config.get_zotero_config()) {
        (Some(bib_path), None) => {
            let cache_dir = if config.cache.enabled {
                Some(config.cache.directory.clone())
            } else {
                None
            };
            let citation_config = CitationConfig::new(
                &config.citations.style,
                &config.citations.language_code,
                bib_path,
                cache_dir,
            )?;
            let citation_result = parse_markdown_with_citations(&html_content, &citation_config)?;
            if citation_result.has_citations {
                format!(
                    "{}\n{}",
                    citation_result.html_content, citation_result.references_html
                )
            } else {
                citation_result.html_content
            }
        }
        (None, Some((api_key, user_id, collection_key))) => {
            let cache_dir = if config.cache.enabled {
                Some(config.cache.directory.clone())
            } else {
                None
            };
            let citation_config = CitationConfig::from_zotero(
                &config.citations.style,
                &config.citations.language_code,
                &api_key,
                &user_id,
                collection_key.as_deref(),
                cache_dir,
            )?;
            let citation_result = parse_markdown_with_citations(&html_content, &citation_config)?;
            if citation_result.has_citations {
                format!(
                    "{}\n{}",
                    citation_result.html_content, citation_result.references_html
                )
            } else {
                citation_result.html_content
            }
        }
        _ => {
            // No citation configuration provided, use content as-is
            html_content
        }
    };

    let slug = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("untitled")
        .to_string();

    let cover = if let Some(cover_filename) = metadata.cover {
        let image_path = path.parent().unwrap_or(&config.content_dir).join(&cover_filename);
        if image_path.exists() {
            process_image(&image_path, &slug, &cover_filename, config)?
        } else {
            None
        }
    } else {
        None
    };

    // Extract and process metadata with defaults
    let title = metadata.title.unwrap_or_else(|| "Untitled".to_string());
    let date = metadata.date.unwrap_or_else(Utc::now);
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

fn collect_processing_tasks(config: &Config) -> Result<Vec<ProcessingTask>> {
    let mut tasks = Vec::new();
    
    for entry in WalkDir::new(&config.content_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("md"))
    {
        let source_path = entry.path().to_path_buf();
        let slug = source_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("untitled")
            .to_string();
        let output_path = config.output_dir.join(format!("{slug}.json"));
        
        tasks.push(ProcessingTask {
            source_path,
            output_path,
        });
    }
    
    Ok(tasks)
}

fn process_task(task: &ProcessingTask, config: &Config, cli: &Cli, syntax_set: &SyntaxSet) -> Result<(Post, bool)> {
    let needs_processing = should_process_file(&task.source_path, &task.output_path, cli.force)
        .with_context(|| format!("Failed to check if file needs processing: {}", task.source_path.display()))?;
    
    if needs_processing {
        if cli.verbose {
            println!("📝 Processing: {}", task.source_path.display());
        }
        let post = process_file(&task.source_path, config, syntax_set)
            .with_context(|| format!("Failed to process markdown file: {}", task.source_path.display()))?;
        
        // Write individual post file
        let post_file = File::create(&task.output_path)
            .with_context(|| format!("Failed to create output file: {}", task.output_path.display()))?;
        serde_json::to_writer_pretty(post_file, &post)
            .with_context(|| format!("Failed to write JSON to: {}", task.output_path.display()))?;
        
        Ok((post, true)) // true = processed
    } else {
        // File hasn't changed, load existing
        match fs::read_to_string(&task.output_path) {
            Ok(content) => {
                match serde_json::from_str::<Post>(&content) {
                    Ok(post) => Ok((post, false)), // false = skipped
                    Err(json_err) => {
                        // JSON is corrupted, reprocess
                        if cli.verbose {
                            eprintln!("⚠️  Warning: Corrupted JSON file ({}), reprocessing: {}", 
                                    json_err, task.source_path.display());
                        }
                        let post = process_file(&task.source_path, config, syntax_set)
                            .with_context(|| format!("Failed to reprocess markdown file: {}", task.source_path.display()))?;
                        let post_file = File::create(&task.output_path)
                            .with_context(|| format!("Failed to recreate output file: {}", task.output_path.display()))?;
                        serde_json::to_writer_pretty(post_file, &post)
                            .with_context(|| format!("Failed to write JSON to: {}", task.output_path.display()))?;
                        Ok((post, true))
                    }
                }
            }
            Err(_) => {
                // Output doesn't exist, process
                if cli.verbose {
                    println!("📝 Processing (missing output): {}", task.source_path.display());
                }
                let post = process_file(&task.source_path, config, syntax_set)
                    .with_context(|| format!("Failed to process markdown file: {}", task.source_path.display()))?;
                let post_file = File::create(&task.output_path)
                    .with_context(|| format!("Failed to create output file: {}", task.output_path.display()))?;
                serde_json::to_writer_pretty(post_file, &post)
                    .with_context(|| format!("Failed to write JSON to: {}", task.output_path.display()))?;
                Ok((post, true))
            }
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    
    // Parse CLI arguments
    let cli = Cli::parse();
    
    if cli.verbose {
        println!("🔧 Loading configuration from: {}", cli.config.display());
    }
    
    // Load configuration from file or use defaults
    let config = Arc::new(Config::load(&cli.config)
        .context("Failed to load configuration. Check that config.yaml is valid or remove it to use defaults")?);
    
    // Initialize syntax set for code highlighting
    let syntax_set = Arc::new(SyntaxSet::load_defaults_newlines());
    
    // Create output directory if it doesn't exist
    fs::create_dir_all(&config.output_dir)
        .with_context(|| format!("Failed to create output directory: {}", config.output_dir.display()))?;

    // Collect all processing tasks
    let tasks = collect_processing_tasks(&config)?;
    
    if cli.verbose {
        println!("📁 Content directory: {}", config.content_dir.display());
        println!("📤 Output directory: {}", config.output_dir.display());
        println!("🖼️  Image directory: {}", config.public_dir.join("images/blog").display());
    }
    
    println!("Found {} markdown files", tasks.len());
    
    if cli.force {
        println!("🔄 Force rebuild enabled - processing all files");
    }

    // Process tasks in parallel
    let stats = Arc::new(Mutex::new(ProcessingStats { processed: 0, skipped: 0 }));
    
    // Create progress bar if not disabled
    let progress = if cli.no_progress {
        None
    } else {
        let pb = ProgressBar::new(tasks.len() as u64);
        pb.set_style(
            ProgressStyle::default_bar()
                .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({eta}) {msg}")
                .unwrap()
                .progress_chars("█▉▊▋▌▍▎▏  ")
        );
        pb.set_message("Processing files...");
        Some(pb)
    };
    
    let results: Vec<Result<Post>> = tasks
        .par_iter()
        .map(|task| {
            let result = process_task(task, &config, &cli, &syntax_set);
            
            // Update progress bar
            if let Some(ref pb) = progress {
                pb.inc(1);
            }
            
            match result {
                Ok((post, was_processed)) => {
                    let mut stats = stats.lock().unwrap();
                    if was_processed {
                        stats.processed += 1;
                    } else {
                        stats.skipped += 1;
                    }
                    Ok(post)
                }
                Err(e) => {
                    if !cli.no_progress {
                        eprintln!("Error processing {}: {}", task.source_path.display(), e);
                    } else {
                        eprintln!("Error processing {}: {}", task.source_path.display(), e);
                    }
                    // Continue processing other files instead of failing completely
                    Err(e)
                }
            }
        })
        .collect();
    
    // Finish progress bar
    if let Some(pb) = progress {
        pb.finish_with_message("Processing complete!");
    }

    // Separate successful and failed results
    let mut posts = Vec::new();
    let mut errors = Vec::new();
    
    for result in results {
        match result {
            Ok(post) => posts.push(post),
            Err(e) => errors.push(e),
        }
    }

    // Report errors but continue if we have some successful posts
    if !errors.is_empty() {
        eprintln!("⚠️  {} file(s) failed to process:", errors.len());
        for (i, error) in errors.iter().enumerate() {
            eprintln!("  {}: {}", i + 1, error);
        }
        
        if posts.is_empty() {
            return Err(anyhow::anyhow!("All files failed to process"));
        } else {
            eprintln!("⚠️  Continuing with {} successfully processed posts", posts.len());
        }
    }
    let stats = stats.lock().unwrap();
    let (processed_count, skipped_count) = (stats.processed, stats.skipped);

    // Convert to PostSummary for index
    let mut post_summaries: Vec<PostSummary> = posts
        .into_iter()
        .map(|post| PostSummary {
            title: post.title,
            date: post.date,
            slug: post.slug,
            description: post.description,
            tags: post.tags,
            cover: post.cover,
        })
        .collect();

    // Sort posts by date (newest first)
    post_summaries.sort_by(|a, b| b.date.cmp(&a.date));

    let len = post_summaries.len();

    // Write index file
    let index = PostIndex { posts: post_summaries };
    let index_path = config.output_dir.join("index.json");
    let index_file = File::create(&index_path)
        .with_context(|| format!("Failed to create index file: {}", index_path.display()))?;
    serde_json::to_writer_pretty(index_file, &index)
        .with_context(|| format!("Failed to write index JSON to: {}", index_path.display()))?;

    println!("✨ Generated {len} posts ({processed_count} processed, {skipped_count} skipped)");
    
    if !errors.is_empty() {
        eprintln!("⚠️  Build completed with {} errors", errors.len());
        // Exit with error code if there were processing errors
        std::process::exit(1);
    }
    
    Ok(())
}
