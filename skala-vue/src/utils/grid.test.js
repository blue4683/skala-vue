import { describe, it, expect } from 'vitest'
import { toGrid } from './grid'

describe('toGrid', () => {
  it('서울시청 → nx:60, ny:127', () => {
    expect(toGrid(37.5665, 126.978)).toEqual({ nx: 60, ny: 127 })
  })
})
