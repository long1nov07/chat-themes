import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

const BAND = {
  plugin: 'chat-themes',
  component: 'AbovePrompt',
  requestId: 'chat-themes',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const engine = (on: Parameters<TestBody>[1], sets: unknown[]) => {
  on('command.register', () => ({ value: { command: 'chat-themes' } }))
  on('ui.close', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', (_, e) => {
    sets.push(e)
    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('theme.clear', () => ({ value: { isDrawn: false, reason: 'cleared' } }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
}

test('the band above the prompt lists the four themes on every surface', async ($, on) => {
  engine(on, [])
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })

    for (const name of ['Dưới nước', 'Mặt nước', 'Bầu trời đêm', 'Đom đóm']) {
      expect((await ui.find({ type: 'Button', text: new RegExp(name) }))?.text).toContain(name)
    }
    await ui.unmount()
  }
})

test('pressing a theme sets its scene and marks it in use', async ($, on) => {
  const sets: unknown[] = []
  engine(on, sets)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'use-pond' })

  expect(JSON.stringify(sets.at(-1))).toContain('"scene":"pond"')
  expect((await ui.find({ key: 'use-pond' }))?.props?.variant).toBe('primary')
  await ui.unmount()
})

test('the backdrop draws the chosen scene as an Svg', async ($, on) => {
  engine(on, [])
  const ui = await $.ui.mount({
    plugin: 'chat-themes',
    component: 'Backdrop',
    requestId: 'backdrop',
    surface: 'desktop',
    props: { scene: 'night-sky', plugin: 'chat-themes', glass: { blur: 12, opacity: 0.55 } },
  })

  const svg = await ui.find({ type: 'Svg' })
  expect(svg).toBeDefined()
  await ui.unmount()
})
