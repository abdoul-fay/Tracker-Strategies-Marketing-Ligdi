// Minimal safe HTML formatter for AI outputs.
// - Escapes HTML
// - Allows **bold** -> <strong>
// - Converts bullet lines starting with "• " or "- " into <ul><li>...
// - Preserves single line breaks as <br/>
// This avoids external deps and keeps rendering safe.

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function sanitizeAndFormat(raw) {
  if (!raw && raw !== 0) return ''
  const text = String(raw)
  const escaped = escapeHtml(text)

  // Split into paragraphs by 2+ newlines
  const paragraphs = escaped.split(/\n{2,}/g).map(par => par.trim())

  const htmlParts = paragraphs.map(par => {
    if (!par) return ''

    const lines = par.split(/\n/).map(l => l.trim())
    // bullet list if every line starts with • or -
    const isList = lines.length > 1 && lines.every(l => /^([•\-])\s+/.test(l))
    if (isList) {
      const lis = lines.map(l => '<li>' + l.replace(/^([•\-])\s+/, '') + '</li>').join('')
      return '<ul>' + lis + '</ul>'
    }

    // inline replacements: **bold**
    let inner = par.replace(/\*\*(.+?)\*\*/g, (_, m) => '<strong>' + m + '</strong>')
    // single newlines to <br/>
    inner = inner.replace(/\n/g, '<br/>')
    return '<p>' + inner + '</p>'
  }).filter(Boolean)

  return htmlParts.join('')
}

export default sanitizeAndFormat
