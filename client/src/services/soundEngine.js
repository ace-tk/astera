/**
 * A tiny synthesized sound engine built on the Web Audio API — no asset files,
 * nothing to download, everything generated at runtime. Sounds are deliberately
 * soft and short (Apple/Arc territory), muted by default, and lazily create the
 * AudioContext on first real interaction to satisfy autoplay policies.
 */
let ctx = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** Play one shaped sine/triangle tone with a gentle attack + exponential tail. */
function tone(freq, { duration = 0.16, type = 'sine', gain = 0.05, glide = 0 } = {}) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  if (glide) osc.frequency.exponentialRampToValueAtTime(freq * glide, ac.currentTime + duration)

  amp.gain.setValueAtTime(0.0001, ac.currentTime)
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)

  osc.connect(amp).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration + 0.02)
}

/** Short filtered noise burst — used for the "paper" texture. */
function noise({ duration = 0.14, gain = 0.03, cutoff = 1600 } = {}) {
  const ac = audio()
  if (!ac) return
  const frames = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = cutoff
  const amp = ac.createGain()
  amp.gain.value = gain
  src.connect(filter).connect(amp).connect(ac.destination)
  src.start()
}

// The named palette of interface sounds.
export const SOUNDS = {
  tick: () => tone(880, { duration: 0.05, type: 'sine', gain: 0.03 }),
  click: () => tone(520, { duration: 0.07, type: 'triangle', gain: 0.04, glide: 1.4 }),
  hover: () => tone(1320, { duration: 0.04, type: 'sine', gain: 0.015 }),
  open: () => tone(440, { duration: 0.18, type: 'sine', gain: 0.04, glide: 1.5 }),
  close: () => tone(660, { duration: 0.16, type: 'sine', gain: 0.035, glide: 0.6 }),
  paper: () => noise({ duration: 0.16, gain: 0.035, cutoff: 1800 }),
  step: () => tone(720, { duration: 0.09, type: 'sine', gain: 0.03, glide: 1.25 }),
  // A small rising three-note chime for completions.
  chime: () => {
    ;[523.25, 659.25, 783.99].forEach((f, i) =>
      setTimeout(() => tone(f, { duration: 0.5, type: 'sine', gain: 0.045 }), i * 90),
    )
  },
}
