/**
 * Maps a semantic feature color (see constants/content.js) to fully-static
 * Tailwind classes. Static strings are required so Tailwind's JIT can see
 * them — never build `bg-${color}` at runtime.
 */
export const ACCENT = {
  royal: {
    text: 'text-royal',
    bg: 'bg-royal',
    softBg: 'bg-royal/10',
    ring: 'ring-royal/30',
    border: 'border-royal/25',
    dot: 'bg-royal',
    gradient: 'from-royal/20 to-royal/0',
    hex: '#365DF5',
  },
  coral: {
    text: 'text-coral', bg: 'bg-coral', softBg: 'bg-coral/10', ring: 'ring-coral/30',
    border: 'border-coral/25', dot: 'bg-coral', gradient: 'from-coral/20 to-coral/0', hex: '#FF6B6B',
  },
  golden: {
    text: 'text-golden', bg: 'bg-golden', softBg: 'bg-golden/15', ring: 'ring-golden/30',
    border: 'border-golden/30', dot: 'bg-golden', gradient: 'from-golden/25 to-golden/0', hex: '#F6C453',
  },
  emerald: {
    text: 'text-emerald', bg: 'bg-emerald', softBg: 'bg-emerald/10', ring: 'ring-emerald/30',
    border: 'border-emerald/25', dot: 'bg-emerald', gradient: 'from-emerald/20 to-emerald/0', hex: '#16B364',
  },
  orange: {
    text: 'text-orange', bg: 'bg-orange', softBg: 'bg-orange/10', ring: 'ring-orange/30',
    border: 'border-orange/25', dot: 'bg-orange', gradient: 'from-orange/20 to-orange/0', hex: '#FF9F43',
  },
  sky: {
    text: 'text-sky', bg: 'bg-sky', softBg: 'bg-sky/10', ring: 'ring-sky/30',
    border: 'border-sky/25', dot: 'bg-sky', gradient: 'from-sky/20 to-sky/0', hex: '#38BDF8',
  },
  rose: {
    text: 'text-rose', bg: 'bg-rose', softBg: 'bg-rose/10', ring: 'ring-rose/30',
    border: 'border-rose/25', dot: 'bg-rose', gradient: 'from-rose/20 to-rose/0', hex: '#F43F5E',
  },
  purple: {
    text: 'text-purple', bg: 'bg-purple', softBg: 'bg-purple/10', ring: 'ring-purple/30',
    border: 'border-purple/25', dot: 'bg-purple', gradient: 'from-purple/20 to-purple/0', hex: '#7C3AED',
  },
  mint: {
    text: 'text-mint', bg: 'bg-mint', softBg: 'bg-mint/10', ring: 'ring-mint/30',
    border: 'border-mint/25', dot: 'bg-mint', gradient: 'from-mint/20 to-mint/0', hex: '#4ADE80',
  },
}

export const accent = (name) => ACCENT[name] || ACCENT.royal
