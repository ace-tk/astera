import { describe, expect, it } from 'vitest'
import { buildKeyActionsData } from './KeyActions'

describe('buildKeyActionsData', () => {
  it('formats shorthand deadlines into more natural executive language', () => {
    const report = {
      commitments: [
        { text: 'Finalize the hiring roadmap', owner: 'COO', due: 'Fri', priority: 'High', status: 'Pending' },
        { text: 'Approve the budget deck', owner: 'CFO', due: 'Q3', priority: 'Medium', status: 'In Progress' },
      ],
    }

    const actions = buildKeyActionsData(report)

    expect(actions[0].deadline).toBe('Due Friday')
    expect(actions[1].deadline).toBe('Q3 2026')
  })
})
