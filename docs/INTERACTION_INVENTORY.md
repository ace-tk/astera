# Interaction Inventory

Every interactive element in Astera, its purpose, expected behavior, and QA
status. Verified by driving the running app in a real browser (headless Chrome)
across all routes, all three themes, mobile, and reduced-motion — asserting the
correct behavior and **zero console errors**.

Legend: ✅ = verified working · 🗑️ = removed as dead UI (no meaningful value).

> **Result: 100% of shipped interactions are working. Zero placeholders, zero
> dead controls, zero fake loading, zero console errors.**

## Global chrome

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Sidebar nav (Workspace/Demos/Reports/Upload/Analytics/Settings) | Primary navigation | Route change + animated active indicator | ✅ |
| Sidebar collapse | Reclaim space | Springs width 264↔84, labels fade | ✅ |
| Mobile bottom tab bar | Primary nav on small screens | Route change, active tint, safe-area aware | ✅ |
| Topbar search / ⌘K | Open command palette | Opens palette, focuses input | ✅ |
| Sound toggle | Enable/disable UI audio | Persists; pulses when on; plays confirm cue | ✅ |
| Notifications (bell) | Recent-intelligence feed | Popover of recent reports; unread badge clears on open; items navigate | ✅ |
| Theme switcher | Change palette | Dropdown of 3 themes; re-skins entire product incl. charts | ✅ |
| New report | Start an upload | Navigates to Upload Studio | ✅ |
| Skip-to-content link | Accessibility | Focus jumps to `<main>` | ✅ |

## Command palette & shortcuts

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| ⌘K palette | Navigate / search / act | Fuzzy filter, ↑↓/↵ keys, grouped, sound cues | ✅ |
| Palette: meetings | Jump to a report | Navigates to the report | ✅ |
| Palette: themes | Switch theme inline | Applies theme | ✅ |
| Palette: actions | Restart tour, shortcuts, sound, generate | Each performs its action | ✅ |
| `?` shortcut overlay | Show shortcut guide | Opens; Esc/`?` toggles | ✅ |
| `g` chords (g w/r/u/a/s) | Vim-style nav | Navigates to section | ✅ |

## Workspace (React Flow canvas)

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Node click | Inspect a stage | Opens rich floating panel for that node | ✅ |
| Node panel: Open report / Replay | Deep links | Navigate to report / replay | ✅ |
| Re-run intelligence | Replay the pipeline | Lights each node active→done with sound + chime | ✅ |
| Fit | Recentre the graph | Animated `fitView` | ✅ |
| Report switcher | Change the analyzed meeting | Swaps nodes/edges data | ✅ |
| Canvas pan/zoom + controls | Explore the graph | Standard pan/zoom, styled controls | ✅ |
| ⓘ Interview badge | Explain React Flow choice | Popover with engineering notes (Interview Mode only) | ✅ |

## Report

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Report cover reveal | Make the report the hero | Paper assembles, title rises, confidence ring animates | ✅ |
| Cover confidence ring | Open confidence details | Opens Confidence Details modal | ✅ |
| Read / Replay | Open reader / replay | Navigate | ✅ |
| **Review** | Edit the report | Slide-in Review Mode (title, priority, summary, actions, notes); saves locally + reflects live | ✅ |
| **Share** | Copy a link | Writes report URL to clipboard + toast (graceful fallback) | ✅ |
| **Listen (narration)** | Read summary aloud | Web Speech play/pause/resume/restart/speed/mute; highlights spoken word | ✅ |
| AI confidence · view breakdown | Confidence details | Modal with six animated radial gauges | ✅ |
| **Feedback: Yes** | Mark useful | Celebrates, persists, toast, shows Undo | ✅ |
| **Feedback: Not quite** | Capture what's missing | Modal with reasons; persists; toast | ✅ |
| Meeting DNA | Signature fingerprint | Animated radial; theme-aware color | ✅ |
| Scrubbable timeline markers | Inspect moments | Hover lifts labels; drawn on view | ✅ |

## Replay

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Cinematic / Interactive toggle | Switch replay modes | Segmented control, shared-layout indicator | ✅ |
| Cinematic: Replay / Open reader | Re-run / read | Re-plays build / navigates | ✅ |
| Interactive timeline nodes | Scrub the meeting | Selecting a moment updates every synced panel | ✅ |
| Play/pause | Auto-advance | Advances through moments | ✅ |

## Reader (reading mode)

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Section nav / minimap | Jump to a section | Smooth-scrolls; scroll-spy tracks position | ✅ |
| In-report search | Find text | Highlights matches inline | ✅ |
| Bookmarks (ribbon + tab) | Save a section | Toggles; persists; shown in Bookmarks tab | ✅ |
| Sticky notes | Annotate a section | Add/edit note; persists per report | ✅ |
| Highlight paragraph | Emphasize text | Toggles a highlight | ✅ |
| Zoom Aa −/＋ | Reading size | Three levels | ✅ |
| Focus mode | Distraction-free | Hides sidebar/minimap, narrows column | ✅ |
| Paper texture toggle | Reading feel | Toggles grain | ✅ |

## Upload Studio

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Drop zone / browse | Provide a recording | Accepts file; shows ready state | ✅ |
| Create intelligence | Run the pipeline | Staged live processing animation | ✅ |
| Watch it build / Open report / Upload another | Post-run actions | Navigate / reset | ✅ |

## ASTRA assistant

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Orb (open) | Summon Astra | Expands into panel; memory-aware greeting | ✅ |
| Suggestion chips | Preset questions | Streams a grounded answer | ✅ |
| Free-text ask | Ask anything | Intent-matched answer from report data | ✅ |
| State moods | Feel alive | Orb shifts color/speed by state | ✅ |
| Close | Dismiss | Collapses to orb | ✅ |

## Settings, Status, About, Onboarding

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Settings section tabs | Navigate settings | Animated section switch | ✅ |
| Theme gallery | Pick a theme | Applies theme | ✅ |
| Accessibility toggles | Reduce motion / large text / focus | Apply globally, persist | ✅ |
| Audio toggle | Sound on/off | Toggles sound | ✅ |
| Keyboard: open guide / palette | Shortcuts | Opens overlay / palette | ✅ |
| Interview Mode toggle | Presenter notes | Enables ⓘ badges; toast | ✅ |
| Restart tour | Replay onboarding | Re-launches guided tour | ✅ |
| About / Status / Source links | Navigate / external | Navigate / open GitHub | ✅ |
| Status: service rows | Health feed | Pulsing indicators, sparklines | ✅ |
| Onboarding: tour steps / take-me-there / skip | First-run | Navigate / dismiss; dot nav | ✅ |

## Demo Workspace & Reports

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Demo cards | Open a demo meeting | Navigate to report; cursor tilt; DNA motif | ✅ |
| Report cards | Open a report | Navigate; hover lift + spotlight | ✅ |
| Empty state CTA | Guide first upload | Illustrated; navigates to upload | ✅ |

## Easter eggs

| Component | Purpose | Expected behavior | Verified |
| --- | --- | --- | --- |
| Konami code | Delight | Confetti + toast | ✅ |
| Double-click wordmark | Delight | Paper airplane flies across | ✅ |
| Theme change | Delight | Gentle confetti puff | ✅ |

## Removed as dead UI

| Element | Reason |
| --- | --- |
| Static bell button (did nothing) | 🗑️ Replaced with a real notifications feed |
| Placeholder "👍 Yes / Refine" feedback | 🗑️ Replaced with a real feedback loop (Yes + reasons modal) |
| Report "Export" button (no export target) | 🗑️ Removed; Share (copy link) + Read cover the real need |
| Three surplus themes (Aurora/Ocean/Forest) | 🗑️ Retired to focus on three exceptional palettes |
