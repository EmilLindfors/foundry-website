use anyhow::{anyhow, Context, Result};
use hayagriva::citationberg::{IndependentStyle, Locale, LocaleFile};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};

const CSL_LOCALES_BASE: &str = "https://raw.githubusercontent.com/citation-style-language/locales/master/locales-";
const CSL_STYLES_BASE: &str = "https://raw.githubusercontent.com/citation-style-language/styles/master/";
const STYLES_LIST_URL: &str = "https://raw.githubusercontent.com/citation-style-language/styles/master/style-metadata.json";

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct StyleMetadata {
    pub name: String,
    pub title: String,
    pub published: i64,
    #[serde(rename = "dependent-style")]
    pub is_dependent: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
#[allow(dead_code)]
struct CacheMetadata {
    downloaded_at: SystemTime,
    etag: Option<String>,
}


#[derive(Clone)]
#[allow(dead_code)]
pub struct CitationConfig {
    pub style: IndependentStyle,
    pub locales: Vec<Locale>,
    pub bibliography: hayagriva::Library,
}

#[derive(Debug)]
pub struct CslClient {
    client: Client,
    cache_dir: PathBuf,
    cache_duration: Duration,
}

impl CslClient {
    pub fn new(cache_dir: impl Into<PathBuf>) -> Result<Self> {
        let cache_dir = cache_dir.into();
        fs::create_dir_all(&cache_dir)?;
        fs::create_dir_all(cache_dir.join("locales"))?;
        fs::create_dir_all(cache_dir.join("styles"))?;
        
        Ok(CslClient {
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .build()?,
            cache_dir,
            cache_duration: Duration::from_secs(24 * 60 * 60), // 24 hours default
        })
    }

    #[allow(dead_code)]
    pub fn with_cache_duration(mut self, duration: Duration) -> Self {
        self.cache_duration = duration;
        self
    }

    // Fetch and parse a locale file
    pub fn get_locale(&self, lang_code: &str) -> Result<LocaleFile> {
        let cache_path = self.cache_dir.join("locales").join(format!("{lang_code}.xml"));
        let meta_path = cache_path.with_extension("meta");

        // Check cache first
        if let Ok(meta) = self.read_cache_metadata(&meta_path) {
            if SystemTime::now().duration_since(meta.downloaded_at)? < self.cache_duration {
                if let Ok(cached_content) = fs::read_to_string(&cache_path) {
                    return LocaleFile::from_xml(&cached_content)
                        .context("Failed to parse cached locale file");
                }
            }
        }

        // Fetch from GitHub
        let url = format!("{CSL_LOCALES_BASE}{lang_code}.xml");
        let response = self.client.get(&url)
            .send()
            .context("Failed to fetch locale file")?;

        if !response.status().is_success() {
            return Err(anyhow!("Failed to download locale file: HTTP {}", response.status()));
        }

        let _headers = response.headers();

        let content = response.text()
            .context("Failed to read locale file content")?;

        // Cache the content
        fs::write(&cache_path, &content)
            .context("Failed to cache locale file")?;
        
        // Save metadata
        //self.write_cache_metadata(&meta_path, headers)?;

        LocaleFile::from_xml(&content)
            .context("Failed to parse downloaded locale file")
    }

    // Fetch and parse a style file
    pub fn get_style(&self, style_name: &str) -> Result<IndependentStyle> {
        let style_name = if !style_name.ends_with(".csl") {
            format!("{style_name}.csl")
        } else {
            style_name.to_string()
        };

        let cache_path = self.cache_dir.join("styles").join(&style_name);
        let meta_path = cache_path.with_extension("meta");

        // Check cache first
        if let Ok(meta) = self.read_cache_metadata(&meta_path) {
            if SystemTime::now().duration_since(meta.downloaded_at)? < self.cache_duration {
                if let Ok(cached_content) = fs::read_to_string(&cache_path) {
                    return IndependentStyle::from_xml(&cached_content)
                        .context("Failed to parse cached style file");
                }
            }
        }

        // Fetch from GitHub
        let url = format!("{CSL_STYLES_BASE}{style_name}");
        let response = self.client.get(&url)
            .send()
            .context("Failed to fetch style file")?;

        if !response.status().is_success() {
            return Err(anyhow!("Failed to download style file: HTTP {}", response.status()));
        }

        let content = response.text()
            .context("Failed to read style file content")?;

        // Cache the content
        fs::write(&cache_path, &content)
            .context("Failed to cache style file")?;
        
        // Save metadata
        //self.write_cache_metadata(&meta_path, response.headers())?;

        IndependentStyle::from_xml(&content)
            .context("Failed to parse downloaded style file")
    }

    // Get list of available styles with metadata
    #[allow(dead_code)]
    pub fn list_styles(&self) -> Result<Vec<StyleMetadata>> {
        let cache_path = self.cache_dir.join("styles-list.json");
        let meta_path = cache_path.with_extension("meta");

        // Check cache first
        if let Ok(meta) = self.read_cache_metadata(&meta_path) {
            if SystemTime::now().duration_since(meta.downloaded_at)? < self.cache_duration {
                if let Ok(cached_content) = fs::read_to_string(&cache_path) {
                    return serde_json::from_str(&cached_content)
                        .context("Failed to parse cached styles list");
                }
            }
        }

        // Fetch from GitHub
        let response = self.client.get(STYLES_LIST_URL)
            .send()
            .context("Failed to fetch styles list")?;

        if !response.status().is_success() {
            return Err(anyhow!("Failed to download styles list: HTTP {}", response.status()));
        }

        let content = response.text()
            .context("Failed to read styles list content")?;

        // Cache the content
        fs::write(&cache_path, &content)
            .context("Failed to cache styles list")?;
        
        // Save metadata
        //self.write_cache_metadata(&meta_path, response.headers())?;

        serde_json::from_str(&content)
            .context("Failed to parse downloaded styles list")
    }

    // Find a style by name or title (case-insensitive partial match)
    #[allow(dead_code)]
    pub fn find_styles(&self, query: &str) -> Result<Vec<StyleMetadata>> {
        let query = query.to_lowercase();
        let styles = self.list_styles()?;
        
        Ok(styles.into_iter()
            .filter(|style| {
                style.name.to_lowercase().contains(&query) ||
                style.title.to_lowercase().contains(&query)
            })
            .collect())
    }

    // Clean up old cache entries
    #[allow(dead_code)]
    pub fn clean_cache(&self) -> Result<()> {
        self.clean_cache_dir(self.cache_dir.join("locales"))?;
        self.clean_cache_dir(self.cache_dir.join("styles"))?;
        Ok(())
    }

    // Helper function to clean a cache directory
    #[allow(dead_code)]
    fn clean_cache_dir(&self, dir: PathBuf) -> Result<()> {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.extension().and_then(|s| s.to_str()) == Some("meta") {
                if let Ok(meta) = self.read_cache_metadata(&path) {
                    if SystemTime::now().duration_since(meta.downloaded_at)? > self.cache_duration {
                        // Remove both the meta file and the corresponding cache file
                        fs::remove_file(&path)?;
                        if let Some(cache_path) = path.with_extension("").parent() {
                            if cache_path.exists() {
                                fs::remove_file(cache_path)?;
                            }
                        }
                    }
                }
            }
        }
        Ok(())
    }

    // Helper function to read cache metadata
    fn read_cache_metadata(&self, path: &Path) -> Result<CacheMetadata> {
        let content = fs::read_to_string(path)?;
        Ok(serde_json::from_str(&content)?)
    }

    // Helper function to write cache metadata
    #[allow(dead_code)]
    fn write_cache_metadata(&self, path: &Path, headers: &reqwest::header::HeaderMap) -> Result<()> {
        let metadata = CacheMetadata {
            downloaded_at: SystemTime::now(),
            etag: headers.get(reqwest::header::ETAG)
                .and_then(|h| h.to_str().ok())
                .map(String::from),
        };
        
        fs::write(path, serde_json::to_string(&metadata)?)?;
        Ok(())
    }
}

