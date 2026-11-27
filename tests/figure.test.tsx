import { expect, mock, test } from 'claude-code/testing'
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

const engine = (on: Parameters<TestBody>[1]) => {
  on('command.register', () => ({ value: { command: 'chat-themes' } }))
  on('ui.close', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'backdrop' } }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  mock.store(on)
  return mock.clock(on)
}

type Found = { props?: Record<string, unknown> }
const figureAlt = async (ui: { findAll: (q: { type: 'Svg' }) => Promise<readonly Found[]> }) =>
  (await ui.findAll({ type: 'Svg' })).map(svg => String(svg.props?.alt ?? '')).find(alt => alt.startsWith('Claude nhỏ')) ?? ''

test('the figure chills, works through a turn, and naps while idle', async ($, on) => {
  const clock = engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await figureAlt(ui)).toContain('thư giãn')

  await $.turn.start({ text: 'hi', turnId: 't1' })
  expect(await figureAlt(ui)).toContain('laptop')
  // A long turn: the figure keeps working, whatever the idle clock would say.
  await clock.advance(200_000)
  expect(await figureAlt(ui)).toContain('laptop')
  // The picker folds once the conversation goes on.
  expect(await ui.find({ key: 'open' })).toBeDefined()

  await $.turn.complete({ turnId: 't1', reason: 'answer', text: 'done' } as never)
  expect(await figureAlt(ui)).toContain('thư giãn')

  // Idle long enough, it falls asleep; later it wakes up again.
  // Time moves in steps of the figure's tick until the pose comes, at most
  // as long as the longest stint.
  const until = async (words: string, ms: number) => {
    for (let t = 0; t < ms && !(await figureAlt(ui)).includes(words); t += 10_000) await clock.advance(10_000)
    return figureAlt(ui)
  }
  expect(await until('ngủ', 70_000)).toContain('ngủ')
  expect(await until('thư giãn', 90_000)).toContain('thư giãn')
  await ui.unmount()
})

test('the figure works while the band says a turn runs', async ($, on) => {
  engine(on)
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, isWorking: true }, surface: 'desktop' })
  expect(await figureAlt(ui)).toContain('laptop')
  await ui.unmount()
})

test('the terminal shows the figure as a little face', async ($, on) => {
  engine(on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /\(•‿•\)/ }))?.text).toContain('♪')
  await ui.unmount()
})
