use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    /// Input directory containing markdown files
    #[serde(default = "default_content_dir")]
    pub content_dir: PathBuf,
    
    /// Output directory for generated JSON files
    #[serde(default = "default_output_dir")]
    pub output_dir: PathBuf,
    
    /// Public directory for processed images
    #[serde(default = "default_public_dir")]
    pub public_dir: PathBuf,
    
    /// Citation settings
    #[serde(default)]
    pub citations: CitationSettings,
    
    /// Image processing settings
    #[serde(default)]
    pub images: ImageSettings,
    
    /// Cache settings
    #[serde(default)]
    pub cache: CacheSettings,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CitationSettings {
    /// Citation style (e.g., "apa-6th-edition.csl")
    #[serde(default = "default_citation_style")]
    pub style: String,
    
    /// Language code for citations (e.g., "en-US")
    #[serde(default = "default_language_code")]
    pub language_code: String,
    
    /// Optional bibliography file path
    pub bibliography_path: Option<PathBuf>,
    
    /// Zotero API settings
    pub zotero: Option<ZoteroSettings>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ZoteroSettings {
    /// Zotero API key (can be overridden by environment variable)
    pub api_key: Option<String>,
    
    /// Zotero user ID (can be overridden by environment variable)
    pub user_id: Option<String>,
    
    /// Optional collection key to limit to specific collection
    pub collection_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageSettings {
    /// Cover image width in pixels
    #[serde(default = "default_cover_width")]
    pub cover_width: u32,
    
    /// Cover image height in pixels
    #[serde(default = "default_cover_height")]
    pub cover_height: u32,
    
    /// Thumbnail width in pixels
    #[serde(default = "default_thumb_width")]
    pub thumbnail_width: u32,
    
    /// Thumbnail height in pixels
    #[serde(default = "default_thumb_height")]
    pub thumbnail_height: u32,
    
    /// Image quality/filter type
    #[serde(default = "default_filter_type")]
    pub filter_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CacheSettings {
    /// Cache directory for CSL styles and locales
    #[serde(default = "default_cache_dir")]
    pub directory: PathBuf,
    
    /// Enable caching
    #[serde(default = "default_cache_enabled")]
    pub enabled: bool,
}

// Default value functions
fn default_content_dir() -> PathBuf {
    PathBuf::from("../content")
}

fn default_output_dir() -> PathBuf {
    PathBuf::from("../src/assets/content")
}

fn default_public_dir() -> PathBuf {
    PathBuf::from("../public")
}

fn default_citation_style() -> String {
    "apa-6th-edition.csl".to_string()
}

fn default_language_code() -> String {
    "en-US".to_string()
}

fn default_cover_width() -> u32 {
    1200
}

fn default_cover_height() -> u32 {
    800
}

fn default_thumb_width() -> u32 {
    400
}

fn default_thumb_height() -> u32 {
    267
}

fn default_filter_type() -> String {
    "Lanczos3".to_string()
}

fn default_cache_dir() -> PathBuf {
    PathBuf::from(".cache")
}

fn default_cache_enabled() -> bool {
    true
}

impl Default for Config {
    fn default() -> Self {
        Self {
            content_dir: default_content_dir(),
            output_dir: default_output_dir(),
            public_dir: default_public_dir(),
            citations: CitationSettings::default(),
            images: ImageSettings::default(),
            cache: CacheSettings::default(),
        }
    }
}

impl Default for CitationSettings {
    fn default() -> Self {
        Self {
            style: default_citation_style(),
            language_code: default_language_code(),
            bibliography_path: None,
            zotero: None,
        }
    }
}

impl Default for ImageSettings {
    fn default() -> Self {
        Self {
            cover_width: default_cover_width(),
            cover_height: default_cover_height(),
            thumbnail_width: default_thumb_width(),
            thumbnail_height: default_thumb_height(),
            filter_type: default_filter_type(),
        }
    }
}

impl Default for CacheSettings {
    fn default() -> Self {
        Self {
            directory: default_cache_dir(),
            enabled: default_cache_enabled(),
        }
    }
}

impl Config {
    /// Load configuration from a YAML file, or return default if file doesn't exist
    pub fn load(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref();
        
        if path.exists() {
            let content = fs::read_to_string(path)
                .with_context(|| format!("Failed to read config file: {}", path.display()))?;
            
            let mut config: Config = serde_yaml::from_str(&content)
                .with_context(|| format!("Failed to parse config file: {}", path.display()))?;
            
            // Override Zotero settings with environment variables if present
            if let Some(ref mut zotero) = config.citations.zotero {
                if let Ok(api_key) = std::env::var("ZOTERO_API_KEY") {
                    zotero.api_key = Some(api_key);
                }
                if let Ok(user_id) = std::env::var("ZOTERO_USER_ID") {
                    zotero.user_id = Some(user_id);
                }
                if let Ok(collection_key) = std::env::var("ZOTERO_COLLECTION_KEY") {
                    zotero.collection_key = Some(collection_key);
                }
            } else if std::env::var("ZOTERO_API_KEY").is_ok() && std::env::var("ZOTERO_USER_ID").is_ok() {
                // Create Zotero config from environment variables if none exists in config
                config.citations.zotero = Some(ZoteroSettings {
                    api_key: std::env::var("ZOTERO_API_KEY").ok(),
                    user_id: std::env::var("ZOTERO_USER_ID").ok(),
                    collection_key: std::env::var("ZOTERO_COLLECTION_KEY").ok(),
                });
            }
            
            Ok(config)
        } else {
            // Create default config with environment variable override
            let mut config = Config::default();
            
            if std::env::var("ZOTERO_API_KEY").is_ok() && std::env::var("ZOTERO_USER_ID").is_ok() {
                config.citations.zotero = Some(ZoteroSettings {
                    api_key: std::env::var("ZOTERO_API_KEY").ok(),
                    user_id: std::env::var("ZOTERO_USER_ID").ok(),
                    collection_key: std::env::var("ZOTERO_COLLECTION_KEY").ok(),
                });
            }
            
            Ok(config)
        }
    }
    
    /// Save configuration to a YAML file
    pub fn save(&self, path: impl AsRef<Path>) -> Result<()> {
        let path = path.as_ref();
        let content = serde_yaml::to_string(self)
            .context("Failed to serialize config to YAML")?;
        
        fs::write(path, content)
            .with_context(|| format!("Failed to write config file: {}", path.display()))?;
        
        Ok(())
    }
    
    /// Get Zotero configuration as a tuple for compatibility with existing code
    pub fn get_zotero_config(&self) -> Option<(String, String, Option<String>)> {
        self.citations.zotero.as_ref().and_then(|z| {
            match (&z.api_key, &z.user_id) {
                (Some(api_key), Some(user_id)) => Some((
                    api_key.clone(),
                    user_id.clone(),
                    z.collection_key.clone(),
                )),
                _ => None,
            }
        })
    }
}