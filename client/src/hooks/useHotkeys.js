import { useEffect } from 'react'

/**
 * Register global keyboard shortcuts. Each binding is `{ combo, handler }`
 * where combo is like 'mod+k', 'shift+?', 'g h', or 'escape'. `mod` maps to
 * ⌘ on macOS and Ctrl elsewhere. Bindings that aren't plain letters fire even
 * inside inputs only when they include a modifier; bare keys are ignored while
 * typing so shortcuts never hijack a text field.
 */
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function matches(combo, e) {
  const parts = combo.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  const needMod = parts.includes('mod')
  const modActive = isMac ? e.metaKey : e.ctrlKey
  const eventKey = e.key.toLowerCase()

  if (needMod !== modActive) return false
  // '?' already implies Shift on every layout, so match on the produced char
  // rather than fighting the shift flag (which varies by keyboard).
  if (key === '?') return eventKey === '?' || (e.shiftKey && eventKey === '/')

  if (parts.includes('shift') !== e.shiftKey) return false
  return eventKey === key
}

export function useHotkeys(bindings, deps = []) {
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      for (const b of bindings) {
        const hasMod = b.combo.includes('mod')
        if (typing && !hasMod && b.combo !== 'escape') continue
        if (matches(b.combo, e)) {
          e.preventDefault()
          b.handler(e)
          break
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export const MOD_LABEL = isMac ? '⌘' : 'Ctrl'
