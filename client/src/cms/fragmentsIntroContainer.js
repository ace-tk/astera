import { FORMATION_ECONOMIQUE_FRAGMENTS, COMMUNICATION_FRAGMENTS } from '@/constants/fragmentsIntros'

/*
 * `FragmentsToDocument` (components/atoopv/FragmentsToDocument.jsx) is a purely decorative,
 * animated intro that two Service Article pages render ABOVE their hero, fed by a hardcoded JS
 * object (constants/fragmentsIntros.js) that mixes real editorial text (module names, duration,
 * financing, the closing statement) with pure animation geometry — five coordinate sets and a
 * rotation per fragment, plus the phase list — which IS the component's motion design, not content.
 *
 * Option A here: only the TEXT is admin-editable, as a small fixed-shape CMS field
 * (`content.fragmentsIntro`, added to the Service Article schema). The geometry, phase list, ids,
 * `kind` and `group` associations always come from the hardcoded base object below — never from the
 * CMS — so this can never become a layout/animation editor. `mergeFragmentsIntro` overlays the
 * CMS text (by array position) onto the hardcoded base; with no override at all (every page today,
 * and every page whose admin never touches this block) it returns `base` untouched.
 */

export const FRAGMENTS_INTRO_BASE = {
  'formation-economique-elus-cse': FORMATION_ECONOMIQUE_FRAGMENTS,
  'communication-cse': COMMUNICATION_FRAGMENTS,
}

/** The current hardcoded TEXT ONLY (no geometry/ids) — the admin form's starting point before any edit. */
export function editorialTextOf(base) {
  return {
    eyebrow: base.eyebrow,
    titleLines: [...base.titleLines],
    fragments: base.fragments.map((f) => ({ role: f.role, text: f.text, tag: f.tag })),
    groups: base.groups.map((g) => ({ label: g.label })),
    documentLabel: base.documentLabel,
    documentRows: base.documentRows.map((r) => ({ ...r })),
    annotations: [...base.annotations],
    documentMeta: base.documentMeta,
    statement: [...base.statement],
  }
}

/**
 * `base` (hardcoded, full shape incl. geometry) + `overrides` (CMS text-only, or nothing) → the full
 * shape `FragmentsToDocument` expects. Missing overrides — or a page with none at all — fall back to
 * `base` exactly, so the page can never break. Every geometry/id/kind/group/phase field always comes
 * from `base`; only `role`/`text`/`tag`/`label`/`eyebrow`/`titleLines`/`documentLabel`/`documentMeta`/
 * `annotations`/`statement` can be overridden, each by array position.
 */
export function mergeFragmentsIntro(base, overrides) {
  if (!overrides) return base
  return {
    ...base,
    eyebrow: overrides.eyebrow ?? base.eyebrow,
    titleLines: overrides.titleLines ?? base.titleLines,
    fragments: base.fragments.map((f, i) => ({
      ...f,
      role: overrides.fragments?.[i]?.role ?? f.role,
      text: overrides.fragments?.[i]?.text ?? f.text,
      tag: overrides.fragments?.[i]?.tag ?? f.tag,
    })),
    groups: base.groups.map((g, i) => ({ ...g, label: overrides.groups?.[i]?.label ?? g.label })),
    documentLabel: overrides.documentLabel ?? base.documentLabel,
    documentRows: base.documentRows.map((r, i) => ({
      label: overrides.documentRows?.[i]?.label ?? r.label,
      text: overrides.documentRows?.[i]?.text ?? r.text,
    })),
    annotations: base.annotations.map((a, i) => overrides.annotations?.[i] ?? a),
    documentMeta: overrides.documentMeta ?? base.documentMeta,
    statement: base.statement.map((s, i) => overrides.statement?.[i] ?? s),
  }
}
