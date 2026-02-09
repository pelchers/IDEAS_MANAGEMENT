# Content Extraction Patterns

Advanced patterns and strategies for extracting structured information from academic documents.

## Pattern Recognition Strategies

### 1. Heading Detection

#### Font-Based Detection (PDF)

```javascript
// Identify headings by font properties
const headingIndicators = {
  fontSize: (size, baseFontSize) => size >= baseFontSize * 1.2,
  fontWeight: (weight) => weight >= 700 || weight === 'bold',
  fontFamily: (family) => family.includes('Bold') || family.includes('Heavy')
};

function detectHeadingFromFont(textItem, baseFont) {
  return headingIndicators.fontSize(textItem.fontSize, baseFont.size) ||
         headingIndicators.fontWeight(textItem.fontWeight) ||
         headingIndicators.fontFamily(textItem.fontFamily);
}
```

#### Pattern-Based Detection

```regex
# Chapter patterns
^Chapter\s+(\d+|[IVXLCDM]+):?\s+(.+)$
^CHAPTER\s+(\d+)\s*[-–—]\s*(.+)$

# Section patterns
^(\d+\.)+\s+(.+)$                    # 1.2.3 Section Name
^Section\s+(\d+(?:\.\d+)*):?\s+(.+)$ # Section 1.2: Name
^[A-Z]\.\s+(.+)$                      # A. Section Name

# Subsection patterns
^(\d+\.){2,}\d+\s+(.+)$              # 1.2.3.4 Subsection
^[a-z]\)\s+(.+)$                      # a) Subsection
```

#### Style-Based Detection (DOCX)

```javascript
// Extract from Word styles
const headingStyles = [
  'Heading 1', 'Heading 2', 'Heading 3',
  'Heading 4', 'Heading 5', 'Heading 6',
  'Title', 'Subtitle'
];

function extractHeadingsFromStyles(paragraphs) {
  return paragraphs
    .filter(p => headingStyles.includes(p.style))
    .map(p => ({
      level: parseInt(p.style.match(/\d+/)?.[0] || '1'),
      text: p.text,
      style: p.style
    }));
}
```

---

### 2. Citation Extraction

#### Common Citation Styles

**APA Style**
```regex
# In-text: (Author, Year)
\(([A-Z][a-z]+(?:\s+(?:&|and)\s+[A-Z][a-z]+)?),\s+(\d{4})\)

# Reference: Author, A. A. (Year). Title. Journal, vol(issue), pages.
^([A-Z][a-z]+,\s+[A-Z]\.\s*(?:[A-Z]\.\s*)?)\((\d{4})\)\.\s+(.+?)\.\s+(.+?),\s+(\d+)(?:\((\d+)\))?,\s+(\d+[-–]\d+)\.
```

**MLA Style**
```regex
# In-text: (Author page)
\(([A-Z][a-z]+)\s+(\d+)\)

# Works Cited: Author. "Title." Publication, Date, pages.
^([A-Z][a-z]+,\s+[A-Z][a-z]+)\.\s+"(.+?)"\.\s+(.+?),\s+(\d+\s+[A-Z][a-z]+\.\s+\d{4}),\s+pp\.\s+(\d+[-–]\d+)\.
```

**Chicago Style**
```regex
# Footnote: Author, Title (Place: Publisher, Year), page.
^(\d+)\.\s+([A-Z][a-z\s]+),\s+(.+?)\s+\((.+?):\s+(.+?),\s+(\d{4})\),\s+(\d+)\.
```

**IEEE Style**
```regex
# [1] Author, "Title," Journal, vol. X, no. Y, pp. Z-Z, Year.
^\[(\d+)\]\s+([A-Z]\.(?:\s+[A-Z]\.)*\s+[A-Z][a-z]+),\s+"(.+?)"\s+(.+?),\s+vol\.\s+(\d+),\s+no\.\s+(\d+),\s+pp\.\s+(\d+[-–]\d+),\s+(\d{4})\.
```

#### Citation Extraction Function

```javascript
function extractCitations(text) {
  const citations = [];
  const styles = {
    APA: /\(([A-Z][a-z]+(?:\s+(?:&|and)\s+[A-Z][a-z]+)?),\s+(\d{4})\)/g,
    MLA: /\(([A-Z][a-z]+)\s+(\d+)\)/g,
    IEEE: /\[(\d+)\]/g,
    Chicago: /(\d+)\.\s+([A-Z][a-z\s]+),/g
  };

  // Try each style
  Object.entries(styles).forEach(([style, pattern]) => {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      matches.forEach(match => {
        citations.push({
          style: style,
          raw: match[0],
          parsed: parseByStyle(match, style)
        });
      });
    }
  });

  return citations;
}
```

---

### 3. Question/Problem Detection

#### Pattern Library

```regex
# Numbered questions
^(?:Question|Problem|Exercise|Q)\s*[#:]?\s*(\d+)[:.]\s+(.+)$

# Lettered questions
^([a-z])\)\s+(.+)$

# Point values
^(\d+)\s+(?:points?|pts?|marks?)\s*[:.]\s+(.+)$

# Multiple choice
^([A-D])\)\s+(.+)$

# True/False
^(?:True|False|T/F)[:.]\s+(.+)$
```

#### Question Extraction Function

```javascript
function extractQuestions(text) {
  const questions = [];
  const lines = text.split('\n');

  const patterns = {
    numbered: /^(?:Question|Problem|Exercise|Q)\s*[#:]?\s*(\d+)[:.]\s+(.+)$/i,
    points: /\((\d+)\s+(?:points?|pts?|marks?)\)/i,
    multipleChoice: /^([A-D])\)\s+(.+)$/
  };

  let currentQuestion = null;

  lines.forEach(line => {
    const numberedMatch = line.match(patterns.numbered);
    const pointsMatch = line.match(patterns.points);

    if (numberedMatch) {
      if (currentQuestion) questions.push(currentQuestion);

      currentQuestion = {
        number: numberedMatch[1],
        text: numberedMatch[2],
        points: pointsMatch ? parseInt(pointsMatch[1]) : null,
        choices: []
      };
    } else if (currentQuestion) {
      const choiceMatch = line.match(patterns.multipleChoice);
      if (choiceMatch) {
        currentQuestion.choices.push({
          letter: choiceMatch[1],
          text: choiceMatch[2]
        });
      } else if (line.trim()) {
        currentQuestion.text += ' ' + line.trim();
      }
    }
  });

  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}
```

---

### 4. Definition Extraction

#### Definition Patterns

```regex
# Pattern 1: "Term is defined as..."
^([A-Z][a-z\s]+)\s+is\s+defined\s+as\s+(.+)\.

# Pattern 2: "Term: definition"
^([A-Z][a-z\s]+):\s+(.+)\.

# Pattern 3: "Term refers to..."
^([A-Z][a-z\s]+)\s+refers\s+to\s+(.+)\.

# Pattern 4: "Definition: Term - explanation"
^Definition:\s+([A-Z][a-z\s]+)\s+[-–—]\s+(.+)\.

# Pattern 5: Bold term followed by explanation (HTML/MD)
<(?:strong|b)>([^<]+)</(?:strong|b)>:\s+(.+?)(?:\.|$)
\*\*([^*]+)\*\*:\s+(.+?)(?:\.|$)
```

#### Context-Aware Definition Extraction

```javascript
function extractDefinitions(text, format = 'plain') {
  const definitions = [];

  // For formatted text (HTML, Markdown)
  if (format === 'html' || format === 'markdown') {
    // Look for bold/strong terms followed by explanations
    const boldPattern = format === 'html'
      ? /<(?:strong|b)>([^<]+)<\/(?:strong|b)>:?\s+([^<.]+)/g
      : /\*\*([^*]+)\*\*:?\s+([^*.]+)/g;

    let match;
    while ((match = boldPattern.exec(text)) !== null) {
      definitions.push({
        term: match[1].trim(),
        definition: match[2].trim(),
        context: 'formatted',
        confidence: 0.9
      });
    }
  }

  // Plain text patterns
  const patterns = [
    {
      regex: /^([A-Z][a-z\s]+)\s+is\s+defined\s+as\s+(.+?)(?:\.|$)/gm,
      confidence: 0.95
    },
    {
      regex: /^([A-Z][a-z\s]+):\s+(.+?)(?:\.|$)/gm,
      confidence: 0.7
    },
    {
      regex: /^([A-Z][a-z\s]+)\s+refers\s+to\s+(.+?)(?:\.|$)/gm,
      confidence: 0.85
    }
  ];

  patterns.forEach(({ regex, confidence }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      definitions.push({
        term: match[1].trim(),
        definition: match[2].trim(),
        context: 'pattern',
        confidence: confidence
      });
    }
  });

  return definitions;
}
```

---

### 5. Table of Contents Extraction

#### TOC Pattern Detection

```javascript
function extractTableOfContents(text) {
  const tocPatterns = [
    // "Chapter 1 ... 5" style
    /^(?:Chapter|CHAPTER)\s+(\d+)\s+(.+?)\s+\.{2,}\s+(\d+)$/gm,

    // "1. Introduction ... 5" style
    /^(\d+(?:\.\d+)*)\s+(.+?)\s+\.{2,}\s+(\d+)$/gm,

    // "Section 1.1 Title 5" style
    /^Section\s+(\d+\.\d+)\s+(.+?)\s+(\d+)$/gm,

    // Indented TOC
    /^(\s+)(\d+(?:\.\d+)*)\s+(.+?)\s+(\d+)$/gm
  ];

  const toc = [];

  tocPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const indent = match[1]?.length || 0;
      const number = match[1] === undefined ? match[1] : match[2];
      const title = match[1] === undefined ? match[2] : match[3];
      const page = match[1] === undefined ? match[3] : match[4];

      toc.push({
        number: number,
        title: title.trim(),
        page: parseInt(page),
        level: number.split('.').length,
        indent: indent
      });
    }
  });

  return toc;
}
```

---

### 6. Code Block Extraction

#### Markdown Code Blocks

```javascript
function extractCodeBlocks(markdown) {
  const codeBlocks = [];

  // Fenced code blocks with language
  const fencedPattern = /```(\w+)?\n([\s\S]+?)```/g;
  let match;

  while ((match = fencedPattern.exec(markdown)) !== null) {
    codeBlocks.push({
      language: match[1] || 'plain',
      code: match[2].trim(),
      type: 'fenced'
    });
  }

  // Indented code blocks
  const indentedPattern = /\n((?:    .+\n)+)/g;
  while ((match = indentedPattern.exec(markdown)) !== null) {
    codeBlocks.push({
      language: 'plain',
      code: match[1].replace(/^    /gm, '').trim(),
      type: 'indented'
    });
  }

  return codeBlocks;
}
```

#### HTML Code Extraction

```javascript
function extractCodeFromHTML(html) {
  const codeBlocks = [];

  // <pre><code> blocks
  const preCodePattern = /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]+?)<\/code><\/pre>/g;
  let match;

  while ((match = preCodePattern.exec(html)) !== null) {
    codeBlocks.push({
      language: match[1] || 'plain',
      code: decodeHTML(match[2]).trim()
    });
  }

  // Inline code
  const inlinePattern = /<code>([^<]+)<\/code>/g;
  while ((match = inlinePattern.exec(html)) !== null) {
    codeBlocks.push({
      type: 'inline',
      code: decodeHTML(match[1])
    });
  }

  return codeBlocks;
}
```

---

### 7. Math Equation Detection

#### LaTeX Math Patterns

```regex
# Inline math: $...$
\$([^\$]+)\$

# Display math: $$...$$
\$\$([^\$]+)\$\$

# LaTeX environments
\\begin{(equation|align|gather|matrix)}([\s\S]+?)\\end{\1}

# Numbered equations
\\begin{equation}([\s\S]+?)\\end{equation}
```

#### Math Extraction Function

```javascript
function extractMathEquations(text) {
  const equations = [];

  const patterns = {
    inline: /\$([^\$]+)\$/g,
    display: /\$\$([\s\S]+?)\$\$/g,
    environment: /\\begin{(equation|align|gather|matrix)}([\s\S]+?)\\end{\1}/g
  };

  Object.entries(patterns).forEach(([type, pattern]) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      equations.push({
        type: type,
        latex: match[1] || match[2],
        environment: match[1],
        raw: match[0]
      });
    }
  });

  return equations;
}
```

---

### 8. Metadata Extraction

#### PDF Metadata

```javascript
function extractPDFMetadata(pdfDoc) {
  return {
    title: pdfDoc.info.Title || inferTitleFromFirstPage(pdfDoc),
    author: pdfDoc.info.Author,
    subject: pdfDoc.info.Subject,
    keywords: pdfDoc.info.Keywords?.split(',').map(k => k.trim()),
    creator: pdfDoc.info.Creator,
    producer: pdfDoc.info.Producer,
    creationDate: pdfDoc.info.CreationDate,
    modificationDate: pdfDoc.info.ModDate,
    pageCount: pdfDoc.numPages
  };
}

function inferTitleFromFirstPage(pdfDoc) {
  const firstPage = pdfDoc.getPage(1);
  const textItems = firstPage.getTextContent();

  // Find largest font size (likely title)
  const largestText = textItems.items
    .sort((a, b) => b.fontSize - a.fontSize)[0];

  return largestText?.str || 'Untitled';
}
```

#### HTML Metadata (Open Graph, Meta Tags)

```javascript
function extractHTMLMetadata(html) {
  const metadata = {
    openGraph: {},
    twitter: {},
    general: {}
  };

  // Open Graph tags
  const ogPattern = /<meta\s+property="og:(\w+)"\s+content="([^"]+)"/g;
  let match;
  while ((match = ogPattern.exec(html)) !== null) {
    metadata.openGraph[match[1]] = match[2];
  }

  // Twitter Card tags
  const twitterPattern = /<meta\s+name="twitter:(\w+)"\s+content="([^"]+)"/g;
  while ((match = twitterPattern.exec(html)) !== null) {
    metadata.twitter[match[1]] = match[2];
  }

  // General meta tags
  const metaPattern = /<meta\s+name="(\w+)"\s+content="([^"]+)"/g;
  while ((match = metaPattern.exec(html)) !== null) {
    metadata.general[match[1]] = match[2];
  }

  return {
    title: metadata.openGraph.title || metadata.general.title,
    description: metadata.openGraph.description || metadata.general.description,
    author: metadata.general.author,
    keywords: metadata.general.keywords?.split(','),
    image: metadata.openGraph.image,
    publishedTime: metadata.openGraph.published_time,
    modifiedTime: metadata.openGraph.modified_time
  };
}
```

---

## Best Practices

### Pattern Matching Strategy

1. **Start Broad**: Use general patterns first
2. **Refine Iteratively**: Test against sample documents
3. **Handle Variations**: Account for formatting differences
4. **Validate Results**: Check extraction quality
5. **Fall Back Gracefully**: Provide defaults when patterns fail

### Performance Optimization

```javascript
// Compile regex patterns once
const COMPILED_PATTERNS = {
  chapter: /^Chapter\s+(\d+)/gm,
  section: /^(\d+\.)+\s+(.+)$/gm,
  citation: /\(([A-Z][a-z]+),\s+(\d{4})\)/g
};

// Reuse compiled patterns
function extractWithCompiledPatterns(text) {
  return {
    chapters: [...text.matchAll(COMPILED_PATTERNS.chapter)],
    sections: [...text.matchAll(COMPILED_PATTERNS.section)],
    citations: [...text.matchAll(COMPILED_PATTERNS.citation)]
  };
}
```

### Error Handling

```javascript
function safeExtract(text, pattern, defaultValue = []) {
  try {
    const matches = [...text.matchAll(pattern)];
    return matches.length > 0 ? matches : defaultValue;
  } catch (error) {
    console.warn(`Pattern matching failed: ${error.message}`);
    return defaultValue;
  }
}
```

---

## Testing Extraction Patterns

### Sample Test Suite

```javascript
const testCases = {
  chapters: [
    { input: "Chapter 1: Introduction", expected: { number: "1", title: "Introduction" } },
    { input: "Chapter 2 Data Structures", expected: { number: "2", title: "Data Structures" } },
    { input: "CHAPTER 3 - Algorithms", expected: { number: "3", title: "Algorithms" } }
  ],
  citations: [
    { input: "(Smith, 2023)", expected: { author: "Smith", year: "2023" } },
    { input: "(Jones & Brown, 2022)", expected: { author: "Jones & Brown", year: "2022" } }
  ]
};

function runTests() {
  Object.entries(testCases).forEach(([category, tests]) => {
    tests.forEach(({ input, expected }) => {
      const result = extractByCategory(category, input);
      console.assert(
        JSON.stringify(result) === JSON.stringify(expected),
        `Failed: ${input}`
      );
    });
  });
}
```

---

## References

- Regular Expression Reference: https://regex101.com
- Unicode Categories: https://unicode.org/reports/tr44/
- PDF.js Text Extraction: https://mozilla.github.io/pdf.js/
- Readability Algorithm: https://github.com/mozilla/readability

