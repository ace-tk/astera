/**
 * Plain-text teaser for listing cards: the first real paragraph of a Markdown body,
 * syntax stripped, truncated. Same rule as the frontend's own `excerpt()` (utils/
 * contentMarkdown.js) so a CMS page's card reads like every other card.
 */
export function excerptOf(body, maxLen = 160) {
  const firstParagraph = String(body || '')
    .split('\n')
    .find((line) => line.trim() && !line.trim().startsWith('#') && !line.trim().startsWith('!') && !line.trim().startsWith('['))
  if (!firstParagraph) return ''
  const plain = firstParagraph
    .replace(/<\/?u>/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim()
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain
}
