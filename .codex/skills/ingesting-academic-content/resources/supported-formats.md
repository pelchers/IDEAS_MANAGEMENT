# Supported Formats Reference

Comprehensive guide to file formats supported by the academic content ingestion system.

## Document Formats

### PDF Documents

**Status**: ✅ Fully Supported

**Types**:
- Text-based PDFs (native text)
- Scanned PDFs (OCR required)
- Mixed content PDFs

**Extraction Capabilities**:
- Text content
- Document metadata (title, author, dates)
- Page structure
- Headings and formatting
- Tables (limited)
- Images (extraction only)
- Embedded fonts
- Bookmarks and TOC

**Limitations**:
- Complex multi-column layouts may require manual review
- Scanned PDFs require OCR preprocessing (slower, less accurate)
- Mathematical equations may not extract cleanly
- Form fields extraction varies by PDF structure

**Recommended Tools**:
- `pdf-parse` - Fast JavaScript parsing
- `pdf.js` - Mozilla's PDF renderer
- `PyPDF2` - Python PDF library
- `Tesseract OCR` - For scanned documents

---

### Microsoft Word (DOCX)

**Status**: ✅ Fully Supported

**Extraction Capabilities**:
- Full text content
- Heading styles (Heading 1-6)
- Document properties
- Comments and track changes
- Footnotes and endnotes
- Tables and lists
- Embedded images
- Hyperlinks
- Page breaks

**Limitations**:
- Legacy DOC format requires conversion
- Complex embedded objects may not extract
- Macro-enabled documents not supported

**Recommended Tools**:
- `mammoth.js` - Clean HTML extraction
- `docx` (Python) - Full document access
- `pandoc` - Universal converter

---

### Markdown (MD)

**Status**: ✅ Fully Supported

**Extraction Capabilities**:
- All markdown syntax
- Front matter (YAML)
- Code blocks with syntax highlighting
- Tables
- Links and images
- Nested lists
- Block quotes

**Extensions Supported**:
- GitHub Flavored Markdown (GFM)
- CommonMark
- Markdown Extra
- LaTeX math (via KaTeX/MathJax)

**Recommended Tools**:
- `marked` - Fast markdown parser
- `remark` - Markdown processor
- `gray-matter` - Front matter parser

---

### Plain Text (TXT)

**Status**: ✅ Supported

**Extraction Capabilities**:
- Raw text content
- Encoding detection (UTF-8, Latin-1, etc.)
- Line breaks and whitespace
- Basic structure inference

**Limitations**:
- No formatting information
- Structure must be inferred from patterns
- No metadata

---

### HTML/Web Pages

**Status**: ✅ Supported

**Extraction Capabilities**:
- Article content (via Readability)
- Headings and structure
- Meta tags (Open Graph, Twitter Cards)
- Author and date information
- Code examples
- Embedded media URLs
- Internal/external links

**Supported Sites**:
- Blog posts and articles
- Online documentation
- Tutorial sites
- News articles
- Academic journals (varies)

**Limitations**:
- Dynamic content (JavaScript-rendered)
- Paywalled content
- Login-required content
- Rate limiting

**Recommended Tools**:
- `@mozilla/readability` - Article extraction
- `jsdom` - HTML parsing
- `cheerio` - jQuery-like selector
- `playwright` - Dynamic content

---

### LaTeX (TEX)

**Status**: ⚠️ Partial Support

**Extraction Capabilities**:
- Plain text content
- Document structure (chapters, sections)
- Bibliography entries
- Mathematical notation (as text)

**Limitations**:
- Complex macros not interpreted
- Requires LaTeX distribution for full rendering
- Math equations stored as raw LaTeX
- Custom packages may not parse

**Recommended Tools**:
- `texparser` - LaTeX parser
- `pandoc` - LaTeX to other formats
- Manual review recommended

---

### EPUB

**Status**: ⚠️ Partial Support

**Extraction Capabilities**:
- Text content from chapters
- TOC (Table of Contents)
- Metadata (title, author)
- Chapter structure

**Limitations**:
- Fixed-layout EPUBs challenging
- DRM-protected content unsupported
- Complex styling may be lost

**Recommended Tools**:
- `epub` (npm) - EPUB parser
- `epubjs` - EPUB reader library

---

### PowerPoint (PPTX)

**Status**: ⚠️ Limited Support

**Extraction Capabilities**:
- Slide text content
- Slide titles
- Notes and comments
- Basic metadata

**Limitations**:
- No layout/positioning information
- Images extracted separately
- Animations not preserved
- Speaker notes may be incomplete

**Recommended Tools**:
- `pptx` (Python) - PPTX parser
- Manual conversion to PDF recommended

---

## Specialized Formats

### Jupyter Notebooks (IPYNB)

**Status**: ✅ Supported

**Extraction Capabilities**:
- Code cells
- Markdown cells
- Output cells
- Cell metadata
- Notebook metadata

**Use Cases**:
- Data science tutorials
- Programming assignments
- Research notebooks

---

### CSV/Excel (XLSX)

**Status**: ⚠️ Data Only

**Extraction Capabilities**:
- Tabular data
- Sheet names
- Cell values
- Basic formulas

**Limitations**:
- Not suitable for narrative content
- Better suited for data analysis tasks

---

### Rich Text Format (RTF)

**Status**: ⚠️ Limited Support

**Extraction Capabilities**:
- Basic text content
- Simple formatting

**Recommendation**: Convert to DOCX or PDF for better extraction

---

## Web-Based Formats

### Google Docs

**Status**: ⚠️ Requires Export

**Method**: Export to DOCX or PDF, then ingest

**Steps**:
1. Open Google Doc
2. File → Download → Microsoft Word (.docx)
3. Ingest downloaded file

---

### Notion Pages

**Status**: ⚠️ Requires Export

**Method**: Export to Markdown or HTML

**Steps**:
1. Open Notion page
2. ⋯ Menu → Export
3. Choose Markdown & CSV
4. Ingest exported files

---

### OneNote

**Status**: ❌ Not Supported

**Workaround**: Copy-paste to Word, export to DOCX

---

## Format Comparison Matrix

| Format | Text | Structure | Metadata | Images | Tables | Math | Speed |
|--------|------|-----------|----------|--------|--------|------|-------|
| PDF    | ✅   | ✅        | ✅       | ⚠️     | ⚠️     | ⚠️   | Medium |
| DOCX   | ✅   | ✅        | ✅       | ✅     | ✅     | ❌   | Fast |
| MD     | ✅   | ✅        | ⚠️       | ⚠️     | ✅     | ⚠️   | Fast |
| HTML   | ✅   | ✅        | ✅       | ⚠️     | ⚠️     | ❌   | Medium |
| TXT    | ✅   | ❌        | ❌       | ❌     | ❌     | ❌   | Fast |
| LaTeX  | ✅   | ✅        | ⚠️       | ❌     | ⚠️     | ✅   | Slow |
| EPUB   | ✅   | ✅        | ✅       | ⚠️     | ⚠️     | ❌   | Medium |

**Legend**:
- ✅ Full support
- ⚠️ Partial support / May require preprocessing
- ❌ Not supported

---

## Encoding Support

### Text Encodings

**Supported**:
- UTF-8 (recommended)
- UTF-16 (LE/BE)
- Latin-1 (ISO-8859-1)
- Windows-1252
- ASCII

**Detection**: Automatic encoding detection using charset detection libraries

**Recommendation**: UTF-8 for all new content

---

## File Size Limits

### Recommended Maximums

| Format | Max Size | Notes |
|--------|----------|-------|
| PDF    | 100 MB   | OCR PDFs process slower |
| DOCX   | 50 MB    | Large documents should be split |
| MD     | 10 MB    | Plain text, fast processing |
| HTML   | 5 MB     | Web pages typically smaller |
| TXT    | 50 MB    | No processing overhead |

**Performance Tips**:
- Split large documents by chapter
- Use batch processing for multiple files
- Enable caching for repeated processing

---

## Best Format for Each Use Case

### Textbooks
**Best**: PDF (if scanned) or DOCX (if digital)
**Alternative**: EPUB, HTML chapters

### Research Papers
**Best**: PDF
**Alternative**: LaTeX source files

### Lecture Notes
**Best**: Markdown or DOCX
**Alternative**: PDF (if professor provides)

### Assignments
**Best**: DOCX or PDF
**Alternative**: Plain text with structured formatting

### Programming Tutorials
**Best**: Markdown or HTML
**Alternative**: Jupyter notebooks for code

### Online Articles
**Best**: HTML (direct URL ingestion)
**Alternative**: PDF or Markdown export

---

## Troubleshooting

### Format Not Recognized

1. Check file extension matches actual format
2. Verify file is not corrupted
3. Try opening in native application
4. Use `file` command (Unix) to identify format

### Poor Extraction Quality

1. **PDF**: Convert to text-based if scanned
2. **DOCX**: Ensure consistent heading styles
3. **HTML**: Use direct URL ingestion vs saved HTML
4. **LaTeX**: Consider converting to PDF first

### Missing Content

1. Check if content is embedded (images, objects)
2. Verify text is selectable (not image-based)
3. Use format-specific debugging tools
4. Manual review may be needed

---

## Future Format Support

**Planned**:
- Audio transcripts (MP3, WAV with speech-to-text)
- Video lectures (MP4 with subtitle extraction)
- Interactive notebooks (Observable, Quarto)
- Specialized academic formats (BibTeX, EndNote)

**Request Support**: File an issue with format name, use case, and sample file

