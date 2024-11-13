use anyhow::{anyhow, Context, Result};
use hayagriva::{citationberg::{IndependentStyle, LocaleFile}, Library};
use reqwest::{blocking::Client, header};
use std::{fs, path::{Path, PathBuf}, sync::Arc};

use crate::{citations::CitationConfig, csl_client::CslClient};

const ZOTERO_API_BASE: &str = "https://api.zotero.org/";

#[derive(Debug, Clone)]
pub struct ZoteroClient {
    client: Arc<Client>,
    api_key: String,
    library_id: String,
    library_type: LibraryType,
}

#[derive(Debug, Clone)]
enum LibraryType {
    User,
    Group,
}

impl ZoteroClient {
    pub fn new(api_key: String, user_id: String) -> Result<Self> {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            "Zotero-API-Version",
            header::HeaderValue::from_static("3"),
        );

        let client = Client::builder()
            .default_headers(headers)
            .build()
            .context("Failed to build HTTP client")?;

        Ok(ZoteroClient {
            client: Arc::new(client),
            api_key,
            library_id: user_id,
            library_type: LibraryType::User,
        })
    }

    pub fn with_group(api_key: String, group_id: String) -> Result<Self> {
        let mut client = Self::new(api_key, group_id)?;
        client.library_type = LibraryType::Group;
        Ok(client)
    }

    pub fn fetch_library(&self, collection_key: Option<&str>) -> Result<Library> {
        // Construct the API endpoint
        let endpoint = match self.library_type {
            LibraryType::User => {
                if let Some(collection) = collection_key {
                    format!("{}users/{}/collections/{}/items", 
                        ZOTERO_API_BASE, self.library_id, collection)
                } else {
                    format!("{}users/{}/items", 
                        ZOTERO_API_BASE, self.library_id)
                }
            },
            LibraryType::Group => {
                if let Some(collection) = collection_key {
                    format!("{}groups/{}/collections/{}/items", 
                        ZOTERO_API_BASE, self.library_id, collection)
                } else {
                    format!("{}groups/{}/items", 
                        ZOTERO_API_BASE, self.library_id)
                }
            }
        };

        // Add format parameter and limit
        let endpoint = format!("{}?format=biblatex&limit=100", endpoint);

        // Fetch the BibTeX data
        let response = self.client
            .get(&endpoint)
            .header("Zotero-API-Key", &self.api_key)
            .send()
            .context("Failed to fetch Zotero library")?;

        if !response.status().is_success() {
            return Err(anyhow!(
                "Zotero API request failed with status: {}",
                response.status()
            ));
        }

        // Get the BibTeX content
        let bibtex_str = response
            .text()
            .context("Failed to get response text")?;

        println!("Fetched Zotero library: {:?}", bibtex_str);

        // Parse the BibTeX into a Bibliography
        hayagriva::io::from_biblatex_str(&bibtex_str)
            .map_err(|e| anyhow!("Failed to parse BibTeX from Zotero: {:?}", e))
    }

    pub fn fetch_library_with_pagination(&self, collection_key: Option<&str>) -> Result<Library> {
        let mut bibliography = Library::new();
        let mut start = 0;
        const LIMIT: u32 = 100;

        loop {
            // Construct the API endpoint with pagination
            let endpoint = match self.library_type {
                LibraryType::User => {
                    if let Some(collection) = collection_key {
                        format!("{}users/{}/collections/{}/items?start={}&limit={}&format=bibtex", 
                            ZOTERO_API_BASE, self.library_id, collection, start, LIMIT)
                    } else {
                        format!("{}users/{}/items?start={}&limit={}&format=bibtex", 
                            ZOTERO_API_BASE, self.library_id, start, LIMIT)
                    }
                },
                LibraryType::Group => {
                    if let Some(collection) = collection_key {
                        format!("{}groups/{}/collections/{}/items?start={}&limit={}&format=bibtex", 
                            ZOTERO_API_BASE, self.library_id, collection, start, LIMIT)
                    } else {
                        format!("{}groups/{}/items?start={}&limit={}&format=bibtex", 
                            ZOTERO_API_BASE, self.library_id, start, LIMIT)
                    }
                }
            };

            let response = self.client
                .get(&endpoint)
                .header("Zotero-API-Key", &self.api_key)
                .send()
                .context("Failed to fetch Zotero library page")?;

            if !response.status().is_success() {
                return Err(anyhow!(
                    "Zotero API request failed with status: {}",
                    response.status()
                ));
            }

            println!("Fetched page {} of Zotero library", start / LIMIT + 1);

            // Get total results from header
            let total_results: u32 = response
                .headers()
                .get("Total-Results")
                .and_then(|h| h.to_str().ok())
                .and_then(|s| s.parse().ok())
                .unwrap_or(0);

            // Get the BibTeX content
            let bibtex_str = response
                .text()
                .context("Failed to get response text")?;

            println!("Fetched Zotero library page: {:?}", bibtex_str);

            // Parse the BibTeX and add to our bibliography
            if !bibtex_str.is_empty() {
                let page_bib = hayagriva::io::from_biblatex_str(&bibtex_str)
                    .map_err(|e| anyhow!("Failed to parse BibTeX from Zotero: {:?}", e))?;
                
                for entry in page_bib.iter() {
                    bibliography.push(&entry.clone());
                }
            }

            // Check if we've got all items
            start += LIMIT;
            if start >= total_results {
                break;
            }
        }

        Ok(bibliography)
    }
}

// Extension to CitationConfig to support Zotero
impl CitationConfig {
    pub fn from_zotero(
        style: &str,
        lang_code: &str,
        api_key: &str,
        user_id: &str,
        collection_key: Option<&str>,
        cache_dir: Option<PathBuf>,
    ) -> Result<Self> {
       

        // Set up locale manager
        let cache_dir = cache_dir.unwrap_or_else(|| PathBuf::from(".cache/csl-locales"));
        let locale_manager = CslClient::new(cache_dir)?;

        let style = locale_manager.get_style(style)?;

        // Load locales
        let locales = locale_manager.get_locale(lang_code)?;

        let locales = vec![locales.into()];

        // Fetch bibliography from Zotero
        let zotero = ZoteroClient::new(api_key.to_string(), user_id.to_string())?;
        let bibliography = zotero.fetch_library_with_pagination(collection_key)?;

        // save the library to a file
        let bib_path = Path::new("bib.yaml");
        let bib_str = hayagriva::io::to_yaml_str(&bibliography).unwrap();
        fs::write(bib_path, bib_str).unwrap();

        Ok(CitationConfig {
            style,
            locales,
            bibliography,
        })
    }

    pub async fn from_zotero_group(
        style_path: &Path,
        locale_path: &Path,
        api_key: &str,
        group_id: &str,
        collection_key: Option<&str>,
    ) -> Result<Self> {
        let style_str = fs::read_to_string(style_path)
            .context("Failed to read style file")?;
        let style = IndependentStyle::from_xml(&style_str)
            .context("Failed to parse style file")?;

        let locale_str = fs::read_to_string(locale_path)
            .context("Failed to read locale file")?;
        let locale = LocaleFile::from_xml(&locale_str)
            .context("Failed to parse locale file")?;

        let zotero = ZoteroClient::with_group(api_key.to_string(), group_id.to_string())?;
        let bibliography = zotero.fetch_library_with_pagination(collection_key)?;

        Ok(CitationConfig {
            style,
            locales: vec![locale.into()],
            bibliography,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fetch_library() {
    
        let api_key = std::env::var
            ("ZOTERO_API_KEY").expect
            ("ZOTERO_API_KEY must be set");
        let user_id = std::env::var
            ("ZOTERO_USER_ID").expect
            ("ZOTERO_USER_ID must be set");

        let zotero = ZoteroClient::new(api_key, user_id
            .to_string()).unwrap();

        let endpoint = format!("{}users/{}/items", 
            ZOTERO_API_BASE, user_id);


        let response = zotero.client
        .get(&endpoint)
        .header("Zotero-API-Key", &api_key)
        .send()
        .context("Failed to fetch Zotero library").unwrap();

        assert!(!response.status().is_server_error());
    }
}