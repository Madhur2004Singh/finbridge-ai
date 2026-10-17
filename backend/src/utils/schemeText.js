/**
 * The source schemes.json stores each field as a "cascade": the description
 * contains eligibility/documents/steps appended with `\n\n\n\n- **Label:**`
 * separators, and `category` is polluted with the whole document body.
 *
 * These helpers extract a single clean section for each field. Markdown
 * emphasis (e.g. **bold**) is kept because the frontend renders it; only the
 * duplicated section headers/body are removed and stray escapes normalised.
 */

const SECTION_SPLIT = /\n{2,}-\s*\*\*[^*]+\*\*/;

export const cleanMarkdownEscapes = (text = "") =>
  String(text)
    .replace(/\\~/g, "~")
    .replace(/\\&/g, "&")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Keep only the text before the next "- **Section:**" block. */
export const firstSection = (text = "") =>
  cleanMarkdownEscapes(String(text).split(SECTION_SPLIT)[0]);

/** "Agriculture & Direct Income Support | Small, marginal..." -> "Agriculture & Direct Income Support" */
export const cleanCategory = (category = "") => {
  const firstLine = String(category).split("\n")[0];
  return firstLine.split("|")[0].trim();
};

/** Remove markdown syntax for contexts that render plain text (cards, search). */
export const stripMarkdown = (text = "") =>
  cleanMarkdownEscapes(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*-\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
