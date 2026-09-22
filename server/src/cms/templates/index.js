import { serviceArticle } from './serviceArticle.js'
import { ressourcesArticle } from './ressourcesArticle.js'

/**
 * The template registry. Templates are CODE: adding one is a reviewed code
 * change, never an admin action. There is intentionally no API that creates,
 * edits, or deletes a template.
 */
export const TEMPLATES = Object.freeze({
  [serviceArticle.key]: serviceArticle,
  [ressourcesArticle.key]: ressourcesArticle,
})

export const getTemplate = (key) =>
  typeof key === 'string' && Object.hasOwn(TEMPLATES, key) ? TEMPLATES[key] : null

export const getSection = (template, sectionKey) => template.sections.find((s) => s.key === sectionKey) || null

/** The client-safe description of a template (no zod internals, no functions). */
export function describeTemplate(t) {
  return {
    key: t.key,
    name: t.name,
    description: t.description,
    creatable: t.creatable,
    singleton: t.singleton,
    sections: t.sections,
    fields: t.fields,
    defaults: t.defaults,
    tagOptions: t.tagOptions || [],
    pathPattern: t.pathFor(':section', ':slug'),
  }
}

/** Every section key of every registered template (used for section navigation). */
export const allSectionKeys = () => [...new Set(Object.values(TEMPLATES).flatMap((t) => t.sections.map((s) => s.key)))]
