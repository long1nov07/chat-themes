import { expect, test } from 'claude-code/testing'

import { scene, SCENE_IDS, thumbnail } from '../hooks/scenes'

test('a card picture is still and lighter than its scene', () => {
  for (const id of SCENE_IDS) {
    const card = thumbnail(id)
    expect(card).not.toContain('@keyframes')
    expect(card).not.toContain('animation')
    expect(card.length).toBeLessThan(scene(id).svg.length * 0.7)
    expect(card).toContain('<text')
  }
})

test('the pond card shows the goldfish school in view', () => {
  expect(thumbnail('pond')).toContain('translateX(1100px)')
})
