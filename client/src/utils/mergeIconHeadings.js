// Every Services markdown file (content/{drafting,by-city,tarifs-infos,
// guides,communication,training}/*.md) repeats the same source shape: a
// bare icon/emoji alone on its own line, then a blank line, then the
// heading it belongs to ("📋", blank, "### Rédaction PV de CSE"). Rendered
// through the generic markdown pipeline as-is, that's an icon paragraph
// stacked above a separate heading element — this rewrites the raw text
// (before it reaches ReactMarkdown) so the icon becomes part of the
// heading's own text, joined by an invisible separator MarkdownArticle's
// heading renderers can split back apart to lay the two out side by side.
// Nothing here changes what the content says — only which element it's
// attached to.
const ICON_HEADING_SEP = '⁣'
const EMOJI_LINE_RE = /^[\p{Extended_Pictographic}\u{2190}-\u{27BF}️‍\s]{1,10}$/u

function isEmojiOnlyLine(line) {
  const t = line.trim()
  return t.length > 0 && EMOJI_LINE_RE.test(t)
}

// Some pages use the same icon-then-label shape without a markdown heading
// at all — a short one-line paragraph standing in for one ("⚖️", blank,
// "Transcription complète", blank, next icon...). Recognized narrowly (a
// single short line, not itself another marker) so this never reaches into
// a real multi-line body paragraph that simply happens to follow an icon.
const MAX_LABEL_LEN = 60

function isShortLabelLine(line) {
  const t = line.trim()
  if (!t || t.length > MAX_LABEL_LEN) return false
  if (/^#{1,6}\s/.test(t) || /^[-*]\s/.test(t) || /^\d+[.)]\s/.test(t) || /^\[.+\]\(.+\)$/.test(t)) return false
  return true
}

export function mergeIconHeadings(markdown) {
  const lines = markdown.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (isEmojiOnlyLine(line)) {
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') j++
      const headingMatch = j < lines.length && lines[j].match(/^(#{1,6})\s+(.*)$/)
      if (headingMatch) {
        out.push(`${headingMatch[1]} ${line.trim()}${ICON_HEADING_SEP}${headingMatch[2]}`)
        i = j
        continue
      }
      // No heading — fall back to a plain short label line, only when it
      // really is standalone (blank or another icon right after it).
      if (j < lines.length && isShortLabelLine(lines[j]) && !isEmojiOnlyLine(lines[j])) {
        let k = j + 1
        const isStandalone = k >= lines.length || lines[k].trim() === ''
        if (isStandalone) {
          out.push(`${line.trim()} ${lines[j].trim()}`)
          i = j
          continue
        }
      }
    }
    out.push(line)
  }
  return out.join('\n')
}

export function splitIconHeading(text) {
  const sepIndex = text.indexOf(ICON_HEADING_SEP)
  if (sepIndex === -1) return null
  return { icon: text.slice(0, sepIndex), text: text.slice(sepIndex + 1) }
}
