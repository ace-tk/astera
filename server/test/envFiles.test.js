import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { envFileCandidates } from '../src/config/env.js'

describe('envFileCandidates', () => {
  it('reads ENV_FILE first, then the home directory file, then ./.env', () => {
    const list = envFileCandidates({ ENV_FILE: '/home/u/secrets/api.env' }, '/home/u')
    expect(list).toEqual(['/home/u/secrets/api.env', '/home/u/.astera-api.env', path.resolve('.env')])
  })
  it('skips what is not set', () => {
    expect(envFileCandidates({}, '')).toEqual([path.resolve('.env')])
  })
})
