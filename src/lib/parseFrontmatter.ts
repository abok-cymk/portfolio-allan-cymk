/**
 * parseFrontmatter
 *
 * A minimal, browser-safe YAML frontmatter parser.
 * Handles the subset of YAML used in project Markdown files:
 *   - string scalars (quoted or unquoted)
 *   - boolean scalars (true / false)
 *   - block sequences (- item)
 *
 * Does NOT require Node's Buffer — safe for Vite browser bundles.
 */

interface ParseResult {
  data: Record<string, unknown>;
  content: string;
}

/** Parse a single YAML scalar value from a string. */
function parseScalar(raw: string): unknown {
  const s = raw.trim();
  // Quoted strings
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  // Booleans
  if (s === 'true') return true;
  if (s === 'false') return false;
  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  // Plain string
  return s;
}

export function parseFrontmatter(source: string): ParseResult {
  // Must start with ---
  if (!source.startsWith('---')) {
    return { data: {}, content: source };
  }

  const end = source.indexOf('\n---', 3);
  if (end === -1) {
    return { data: {}, content: source };
  }

  const yamlBlock = source.slice(4, end); // between first --- and closing ---
  const body = source.slice(end + 4).replace(/^\n/, ''); // content after closing ---

  const data: Record<string, unknown> = {};
  const lines = yamlBlock.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      i++;
      continue;
    }

    const key = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();

    if (rest === '' || rest === '|' || rest === '>') {
      // Block sequence — collect indented `- value` lines
      const items: string[] = [];
      i++;
      while (i < lines.length) {
        const itemLine = lines[i];
        const trimmed = itemLine.trim();
        if (trimmed.startsWith('- ')) {
          items.push(trimmed.slice(2).trim());
          i++;
        } else if (trimmed === '' || trimmed.startsWith('#')) {
          i++;
        } else {
          // Back to top-level
          break;
        }
      }
      data[key] = items;
    } else {
      data[key] = parseScalar(rest);
      i++;
    }
  }

  return { data, content: body };
}
