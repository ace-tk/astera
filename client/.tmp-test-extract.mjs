import { extractStatStrip, extractTagMarquee, extractProcessSteps } from './src/utils/formationContent.js'
import { readFileSync, readdirSync } from 'fs'

const dirs = ['drafting', 'by-city', 'tarifs-infos']
for (const dir of dirs) {
  const files = readdirSync(`../content/${dir}`).filter(f => f.endsWith('.md'))
  for (const f of files) {
    const raw = readFileSync(`../content/${dir}/${f}`, 'utf8')
    const bodyLines = raw.split('\n')
    // crude: body starts after the "- Breadcrumb:" line + following blank
    const bIdx = bodyLines.findIndex(l => l.startsWith('- Breadcrumb'))
    const body = bodyLines.slice(bIdx + 1).join('\n').trim()

    const stat = extractStatStrip(body)
    const marquee = extractTagMarquee(body)
    const steps = extractProcessSteps(body)
    console.log(`${dir}/${f}: stat=${!!stat}(${stat?.stats.length}) marquee=${!!marquee}(${marquee?.tags.length}) steps=${!!steps}(${steps?.steps.length})`)
  }
}
