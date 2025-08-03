#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;
use syntect::parsing::SyntaxSet;
use std::sync::OnceLock;
use pulldown_cmark::{Event, Options, Parser as MarkdownParser, Tag, TagEnd, CodeBlockKind};
use syntect::html::{ClassedHTMLGenerator, ClassStyle};
use syntect::util::LinesWithEndings;

static SYNTAX_SET: OnceLock<SyntaxSet> = OnceLock::new();

fn get_syntax_set() -> &'static SyntaxSet {
    SYNTAX_SET.get_or_init(|| SyntaxSet::load_defaults_newlines())
}

fn render_code_block_wasm(syntax_set: &SyntaxSet, language: &str, code: &str) -> String {
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

#[cfg(target_arch = "wasm32")]
mod wasm_bindings {
    use super::*;
    
    #[wasm_bindgen]
    pub fn parse_markdown_with_highlighting(content: &str) -> String {
        console_error_panic_hook::set_once();
        
        let syntax_set = get_syntax_set();
        
        let mut options = Options::empty();
        options.insert(Options::ENABLE_STRIKETHROUGH);
        options.insert(Options::ENABLE_TABLES);
        options.insert(Options::ENABLE_FOOTNOTES);
        options.insert(Options::ENABLE_TASKLISTS);

        let parser = MarkdownParser::new_ext(content, options);
        let mut html_output = String::new();
        let mut in_code_block = false;
        let mut code_block_lang = String::new();
        let mut code_block_content = String::new();
        
        for event in parser {
            match event {
                Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) => {
                    in_code_block = true;
                    code_block_lang = lang.to_string();
                    code_block_content.clear();
                }
                Event::End(TagEnd::CodeBlock) if in_code_block => {
                    in_code_block = false;
                    let rendered = render_code_block_wasm(syntax_set, &code_block_lang, &code_block_content);
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

        html_output
    }

    #[wasm_bindgen]
    pub fn parse_markdown_simple(content: &str) -> String {
        console_error_panic_hook::set_once();
        
        let mut options = Options::empty();
        options.insert(Options::ENABLE_STRIKETHROUGH);
        options.insert(Options::ENABLE_TABLES);
        options.insert(Options::ENABLE_FOOTNOTES);
        options.insert(Options::ENABLE_TASKLISTS);

        let parser = MarkdownParser::new_ext(content, options);
        let mut html_output = String::new();
        pulldown_cmark::html::push_html(&mut html_output, parser);
        
        html_output
    }
}

#[cfg(target_arch = "wasm32")]
pub use wasm_bindings::*;