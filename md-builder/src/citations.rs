use anyhow::{Context, Result};
use hayagriva::{
    citationberg::{IndependentStyle, Locale, LocaleFile},
    BibliographyDriver, BibliographyRequest, CitationItem, CitationRequest, ElemChild, Library,
};
use pulldown_cmark::{Event, Options, Parser};
use std::{
    cell::{Ref, RefCell},
    collections::{HashMap, HashSet},
    fs,
    path::{Path, PathBuf},
    rc::Rc,
};

use crate::csl_client::CslClient;

// New struct to hold citation configuration
#[derive(Clone)]
pub struct CitationConfig {
    pub style: IndependentStyle,
    pub locales: Vec<Locale>,
    pub bibliography: Library,
}

#[derive(Default)]
pub struct CitationResult {
    pub html_content: String,
    pub references_html: String,
    pub has_citations: bool,
}

impl CitationConfig {
    pub fn new(
        style: &str,
        lang_codes: &str,
        bib_path: &Path,
        cache_dir: Option<PathBuf>,
    ) -> Result<Self> {

        // Set up locale manager with default or provided cache directory
        let cache_dir = cache_dir.unwrap_or_else(|| PathBuf::from(".cache/csl-locales"));


        
        let locale_manager = CslClient::new(cache_dir)?;

        let style = locale_manager.get_style(style)?;

        // Load locales
        let locales = locale_manager.get_locale(lang_codes)?;

        let locales = vec![locales.into()];


        // Load the bibliography
        let bib_str = fs::read_to_string(bib_path).context("Failed to read bibliography file")?;
        let bibliography = if bib_path.extension().and_then(|s| s.to_str()) == Some("yml") {
            hayagriva::io::from_yaml_str(&bib_str).context("Failed to parse YAML bibliography")?
        } else {
            hayagriva::io::from_biblatex_str(&bib_str).map_err(|e| anyhow::anyhow!("{:?}", e))?
        };

        Ok(CitationConfig {
            style,
            locales,
            bibliography,
        })
    }
}

impl Default for CitationConfig {
    fn default() -> Self {
        let style_str = fs::read_to_string("../content/style.csl")
            .context("Failed to read style file")
            .unwrap();
        let style = IndependentStyle::from_xml(&style_str)
            .context("Failed to parse style file")
            .unwrap();

        // Load the locale
        let locale_str = fs::read_to_string("../content/locale.csl")
            .context("Failed to read locale file")
            .unwrap();
        let locale = LocaleFile::from_xml(&locale_str)
            .context("Failed to parse locale file")
            .unwrap();

        let bibliography = hayagriva::io::from_yaml_str("../content/bib.yaml")
            .context("Failed to parse YAML bibliography")
            .unwrap();

        Self {
            style,
            locales: vec![locale.into()],
            bibliography,
        }
    }
}

pub fn parse_markdown_with_citations(
    content: &str,
    config: &CitationConfig,
) -> Result<CitationResult> {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_YAML_STYLE_METADATA_BLOCKS);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);

    // Create citation driver for in-text citations
    let mut in_text_driver = BibliographyDriver::new();
    // Create citation driver for references
    let mut ref_driver = BibliographyDriver::new();

    // Regex for matching citation keys
    let citation_regex = regex_lite::Regex::new(r"@\[([^\]]+)\]").unwrap();

    // Track used citations to build reference list
    let mut cited_keys = HashSet::new();

    // First pass: collect all citations and register them with the drivers
    let content_with_placeholders =
        citation_regex.replace_all(content, |caps: &regex_lite::Captures| {
            let key = &caps[1];
            if let Some(entry) = config.bibliography.get(key) {
                cited_keys.insert(key.to_string());
                let items = vec![CitationItem::with_entry(entry)];

                // Register with both drivers
                in_text_driver.citation(CitationRequest::from_items(
                    items.clone(),
                    &config.style,
                    config.locales.as_slice(),
                ));
                ref_driver.citation(CitationRequest::from_items(
                    items,
                    &config.style,
                    &config.locales,
                ));

                format!("CITATION_PLACEHOLDER_{}", key)
            } else {
                format!("[Unknown citation: {}]", key)
            }
        });

    // Generate in-text citations
    let in_text_result = in_text_driver.finish(BibliographyRequest {
        style: &config.style,
        locale: None,
        locale_files: &config.locales,
    });

    // Generate bibliography
    let ref_result = ref_driver.finish(BibliographyRequest {
        style: &config.style,
        locale: None,
        locale_files: &config.locales,
    });

    // Create a map of citation keys to their formatted in-text citations
    let mut citations = HashMap::new();
    for cite in in_text_result.citations {
        let key = cite
            .citation
            .0
            .iter()
            .map(|c| match c {
                ElemChild::Transparent { cite_idx, format } => {
                    let key = &cite.citation.0[*cite_idx];
                    Some(format!("{}", key))
                }
                _ => None,
            })
            .collect::<Option<String>>();

        if let Some(key) = key {
            citations.insert(
                format!("CITATION_PLACEHOLDER_{}", key),
                format!(
                    "<a href=\"#ref-{}\" class=\"citation\">{}</a>",
                    key,
                    cite.citation.to_string()
                ),
            );
        }
    }

    // Second pass: parse markdown and replace citation placeholders
    let parser = Parser::new_ext(&content_with_placeholders, options);
    let mut html_output = String::new();
    let current_text = RefCell::new(String::new());

    for event in parser {
        match event {
            Event::Text(text) => {
                let text = text.to_string();
                let mut processed_text = text.clone();

                // Replace citation placeholders with formatted citations
                for (placeholder, citation) in &citations {
                    processed_text = processed_text.replace(placeholder, citation);
                }

                current_text.borrow_mut().push_str(&processed_text);
            }
            Event::End(tag) => {
                let text = current_text.borrow().clone();
                if !text.is_empty() {
                    pulldown_cmark::html::push_html(
                        &mut html_output,
                        vec![Event::Text(text.into())].into_iter(),
                    );
                    current_text.borrow_mut().clear();
                }
                pulldown_cmark::html::push_html(
                    &mut html_output,
                    vec![Event::End(tag)].into_iter(),
                );
            }
            event => {
                let text = current_text.borrow().clone();
                if !text.is_empty() {
                    pulldown_cmark::html::push_html(
                        &mut html_output,
                        vec![Event::Text(text.into())].into_iter(),
                    );
                    current_text.borrow_mut().clear();
                }
                pulldown_cmark::html::push_html(&mut html_output, vec![event].into_iter());
            }
        }
    }

    // Generate references section if there are citations
    let mut references_html = String::new();
    if !cited_keys.is_empty() {
        references_html.push_str("<div class=\"references\">\n");
        references_html.push_str("<h2>References</h2>\n");
        references_html.push_str("<div class=\"references-list\">\n");

        for entry in ref_result.bibliography.unwrap().items.iter() {
            references_html.push_str(&format!(
                "<div id=\"ref-{}\" class=\"reference-item\">{}</div>\n",
                entry.key, entry.content
            ));
        }

        references_html.push_str("</div>\n");
        references_html.push_str("</div>\n");
    }

    Ok(CitationResult {
        html_content: html_output,
        references_html,
        has_citations: !cited_keys.is_empty(),
    })
}
