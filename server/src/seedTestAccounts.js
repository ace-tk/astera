import mongoose from 'mongoose'
import crypto from 'node:crypto'
import { connectDB } from './config/db.js'
import { User } from './models/User.js'

/**
 * Seeds the two RBAC test accounts (director/admin + customer). Safe to
 * re-run — upserts by email, never touches any other user. Uses the same
 * hashing/auth path every real account goes through (User.hashPassword,
 * the normal login flow) — no second auth system, no DEV bypass.
 *
 * There is no "director" role in this codebase — `role` is a free-text,
 * display-only string; only role === 'admin' (or an ADMIN_EMAILS entry)
 * grants admin access (see isAdminUser() in config/env.js). So the director
 * account is seeded with role: 'admin' directly, rather than inventing a
 * new role that authorization logic wouldn't recognize.
 *
 * Passwords are never hardcoded here. Set DIRECTOR_TEST_PASSWORD /
 * CUSTOMER_TEST_PASSWORD in server/.env (gitignored) to pick them yourself;
 * otherwise a random password is generated per run and printed once below
 * — save it, it is not stored anywhere in the repo or the database.
 *
 * Usage: `npm run seed:test-accounts`
 */

function resolvePassword(envVar, label) {
  const fromEnv = process.env[envVar]
  if (fromEnv) return fromEnv
  const generated = crypto.randomBytes(12).toString('base64url')
  console.log(`  (${envVar} not set — generated a random password for ${label})`)
  return generated
}

const ACCOUNTS = [
  {
    email: 'director@atoopv.com',
    name: 'AtoopV Director',
    role: 'admin', // the only string that satisfies isAdminUser() by role
    envVar: 'DIRECTOR_TEST_PASSWORD',
    label: 'director/admin',
  },
  {
    email: 'customer@test.com',
    name: 'AtoopV Test Customer',
    role: 'Customer', // cosmetic only — anything other than 'admin' is customer-tier
    envVar: 'CUSTOMER_TEST_PASSWORD',
    label: 'customer',
  },
]

async function seedTestAccounts() {
  const ok = await connectDB()
  if (!ok) {
    console.error('Cannot seed without a database connection.')
    process.exit(1)
  }

  console.log('Seeding RBAC test accounts...\n')
  const results = []
  for (const acc of ACCOUNTS) {
    const password = resolvePassword(acc.envVar, acc.label)
    const passwordHash = await User.hashPassword(password)
    await User.findOneAndUpdate(
      { email: acc.email },
      {
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: acc.role,
        emailVerified: true,
        status: 'active',
        accountType: 'guest',
        // Every field these accounts need is supplied explicitly above.
        // setDefaultsOnInsert is explicitly disabled below (mongoose defaults
        // it to true): User.js's accountType function-default throws on
        // insert (`this` is incomplete inside mongoose's internal
        // setDefaultsOnInsert helper) — a pre-existing bug in shared model
        // code, out of scope to fix here. The remaining schema defaults we
        // skip (workspace, theme, plan) are cosmetic only and not required
        // for auth/RBAC.
      },
      { upsert: true, new: true, setDefaultsOnInsert: false },
    )
    results.push({ ...acc, password })
    console.log(`✓ ${acc.email}  (role: ${acc.role})  password: ${password}`)
  }

  console.log('\nSave these credentials now — they are printed here only, never written to source or committed.')
  await mongoose.disconnect()
  process.exit(0)
}

seedTestAccounts().catch((err) => {
  console.error(err)
  process.exit(1)
})
