import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { User } from './models/User.js'
import { Report } from './models/Report.js'
import { DEMO_REPORTS } from './seed-data.js'

/**
 * Seeds a demo account and its reports. Safe to re-run — it upserts the user
 * and replaces their reports. Usage: `npm run seed`.
 */
async function seed() {
  const ok = await connectDB()
  if (!ok) {
    console.error('Cannot seed without a database connection.')
    process.exit(1)
  }

  const email = 'maya@northwind.co'
  const passwordHash = await User.hashPassword('astera-demo')
  const user = await User.findOneAndUpdate(
    { email },
    { name: 'Maya Okafor', email, passwordHash, workspace: 'Northwind', role: 'VP Product' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  await Report.deleteMany({ owner: user._id })
  await Report.insertMany(
    DEMO_REPORTS.map((r) => ({ ...r, slug: r.id, owner: user._id, id: undefined })),
  )

  console.log(`✓ Seeded ${DEMO_REPORTS.length} report(s) for ${email} (password: astera-demo)`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
