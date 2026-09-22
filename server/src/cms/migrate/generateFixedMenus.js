// Regenerates cms/fixedMenus.json: the FIXED skeleton of the main menu, taken from the
// website's built-in navigation (client/src/constants/content.js).
//
// The menus themselves (which exist, their names, order, type, colour, illustration,
// groups and group headings) are part of the website's design, so the CMS refuses any
// change to them. Only the content inside — the links in each group, the mobile list and
// the texts/links of the call-to-action panels — is editable.
//
// Usage: npm run cms:fixed-menus   (run locally after the built-in navigation changes;
// a test fails if this file is out of date)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const clientSrc = path.resolve(here, '../../../../client/src')
const load = (rel) => import(pathToFileURL(path.join(clientSrc, rel)))

/** The locked skeleton of the built-in navigation. */
export async function buildFixedMenus() {
  const { ATOOPV_NAV } = await load('constants/content.js')
  const { toMenuItems } = await load('cms/navConvert.js')
  return toMenuItems(ATOOPV_NAV).map((it) => ({
    id: it.id,
    label: it.label,
    kind: it.kind,
    link: it.link,
    ...(it.color ? { color: it.color } : {}),
    visual: it.visual || it.id,
    groups: it.groups?.map((g) => ({ id: g.id, heading: g.heading })) ?? [],
    cta: it.cta ? { tone: it.cta.tone } : null,
    cities: Boolean(it.cities),
  }))
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  const menus = await buildFixedMenus()
  fs.writeFileSync(path.resolve(here, '../fixedMenus.json'), `${JSON.stringify(menus, null, 2)}\n`)
  console.log(`Wrote ${menus.length} fixed menus: ${menus.map((m) => m.label).join(', ')}`)
}
