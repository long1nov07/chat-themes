import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Choice, SceneId } from '../types'
import { makeColors } from './make-colors.js'
import { SCENES } from './scenes'

const PLUGIN = 'chat-themes'
const OLD_PANE = 'chat-themes'
const STORE_KEY = 'scene'

const current = atom({ plugin: 'chat-themes', key: 'current' } as const, 'off')

type Entry = {
  id: SceneId
  icon: string
  name: string
  blurb: string
  preview: string[]
  look: ThemeSetArgs
}

const look = (
  id: SceneId,
  label: string,
  tint: string,
  roles: { accent: string; danger: string; success: string; warning: string; pro: string },
  anchors: Record<'surface-0' | 'surface-1' | 'surface-2' | 'surface-3' | 'text-primary' | 'text-secondary' | 'text-muted', string>,
): ThemeSetArgs => ({
  colors: makeColors({ label, id, only: 'dark', roles, dark: { gray: { anchors } } }).theme,
  backdrop: { scene: id, glass: { blur: 12, tint, opacity: 0.55 } },
  overrideColorScheme: 'dark',
})

const THEMES: Entry[] = [
  {
    id: 'underwater',
    icon: '🌊',
    name: 'Dưới nước',
    blurb: 'Bong bóng, cá bơi, rong biển đung đưa',
    preview: ['~ ~~ ~~~ ~ ~~ ~', '  o    ><>   O ', ' (  .    o  ) ', ' ) <>< (   (  ', '_.,-:._.,-:._.,'],
    look: look(
      'underwater',
      'Chat themes: Underwater',
      '#06182a',
      { accent: '#3fb6e0', danger: '#e0605a', success: '#4cc38a', warning: '#e0a83f', pro: '#a08be8' },
      {
        'surface-0': '#06182a',
        'surface-1': '#0a2033',
        'surface-2': '#0d263c',
        'surface-3': '#102b43',
        'text-primary': '#e6f4fb',
        'text-secondary': '#b9d6e6',
        'text-muted': '#8fb3c8',
      },
    ),
  },
  {
    id: 'pond',
    icon: '🐟',
    name: 'Mặt nước',
    blurb: 'Đàn cá vàng bơi chéo, phao trôi, sóng nhẹ mỗi 30 giây',
    preview: ['~  ~~   ~  .^. ', "><(((('>  (###)", "  ><(((('> '-' ", ' ~ ~~  ~  ~~ ~ ', '~~  ~  ~~~  ~ '],
    look: look(
      'pond',
      'Chat themes: Pond',
      '#06262e',
      { accent: '#f5a531', danger: '#e5564c', success: '#52c48c', warning: '#e8b04a', pro: '#9d8cf0' },
      {
        'surface-0': '#06262e',
        'surface-1': '#0a2d36',
        'surface-2': '#0d333d',
        'surface-3': '#103843',
        'text-primary': '#e8f6f7',
        'text-secondary': '#bcd9dd',
        'text-muted': '#92b5ba',
      },
    ),
  },
  {
    id: 'night-sky',
    icon: '🌙',
    name: 'Bầu trời đêm',
    blurb: 'Sao lấp lánh, trăng, sao băng',
    preview: [" .  *   .  _.._ ", "   +   .  :::::", " *  .-~-.  `''' ", '  ^    ^^   .  ', ' ^#^^ ^##^^^ ^^ '],
    look: look(
      'night-sky',
      'Chat themes: Night sky',
      '#0a0d1f',
      { accent: '#8ea2ff', danger: '#e86a6a', success: '#5fc98f', warning: '#e6b450', pro: '#c08cf0' },
      {
        'surface-0': '#0a0d1f',
        'surface-1': '#0f1329',
        'surface-2': '#131832',
        'surface-3': '#171c39',
        'text-primary': '#eef0ff',
        'text-secondary': '#c4c8e8',
        'text-muted': '#9aa0c8',
      },
    ),
  },
  {
    id: 'fireflies',
    icon: '✨',
    name: 'Đom đóm',
    blurb: 'Đom đóm phát sáng trên đồng cỏ',
    preview: ['  .     .    . ', ' ^^^  ^^  ^^^  ', '  *    .   *   ', '    *     *  . ', "|/',v|Y|/',v|Y|"],
    look: look(
      'fireflies',
      'Chat themes: Fireflies',
      '#08140d',
      { accent: '#c9df4f', danger: '#e2675c', success: '#62c47a', warning: '#e5ad45', pro: '#b48be0' },
      {
        'surface-0': '#08140d',
        'surface-1': '#0c1a11',
        'surface-2': '#0f2015',
        'surface-3': '#122518',
        'text-primary': '#eef6e4',
        'text-secondary': '#c6d6bb',
        'text-muted': '#9cb091',
      },
    ),
  },
]

const isScene = (v: unknown): v is SceneId => THEMES.some(t => t.id === v)

const apply = async ($: EngineInterface, choice: Choice) => {
  const entry = THEMES.find(t => t.id === choice)

  if (entry === undefined) {
    // Off: clear only because the person pressed it.
    await $.theme.clear()
  } else {
    // Not drawn yet only means no app is attached now; the theme stands and
    // draws once one attaches.
    await $.theme.set(entry.look)
  }
  await update($, current, () => choice)
  await $.store.set(STORE_KEY, choice)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'chat-themes',
      description: 'Đổi hình nền ASCII: /chat-themes underwater | pond | night-sky | fireflies | off',
    })

    // The picker used to be a pane; close one an earlier version opened.
    await $.ui.close({ id: OLD_PANE }).catch(() => undefined)

    const saved = await $.store.get(STORE_KEY)

    if (isScene(saved)) {
      const entry = THEMES.find(t => t.id === saved)!
      await $.theme.set(entry.look)
      await update($, current, () => saved)
    }

    return next(e)
  })

  on('command.run', { command: 'chat-themes' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg === 'off' || isScene(arg)) {
      await apply($, arg)
      const name = THEMES.find(t => t.id === arg)?.name ?? 'Tắt hình nền'

      return { text: `Chat themes: ${name}` }
    }

    return { text: 'Chọn hình nền ở thanh Chat themes ngay trên ô chat, hoặc gõ /chat-themes underwater | pond | night-sky | fireflies | off.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Text, Button } = $.ui.resolve(e)
    const chosen = await read($, current)
    const drawsBackdrops = e.surface === 'desktop' || e.surface === 'mobile'

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={1}>
          <Text dimColor>Chat themes</Text>
          {THEMES.map(t => (
            <Button
              key={`use-${t.id}`}
              label={`${t.icon} ${t.name}`}
              variant={chosen === t.id ? 'primary' : 'secondary'}
              onPress={() => apply($, t.id)}
            />
          ))}
          <Button
            key="off"
            label="Tắt"
            variant={chosen === 'off' ? 'primary' : 'secondary'}
            dimColor={chosen !== 'off'}
            onPress={() => apply($, 'off')}
          />
        </Box>
        {!drawsBackdrops && <Text dimColor>Hình nền chỉ hiện trong app desktop và mobile.</Text>}
      </Box>
    )
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    if (e.props.plugin !== PLUGIN || !isScene(e.props.scene)) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const scene = SCENES[e.props.scene]

    return <Svg source={scene.svg} alt={scene.alt} isInteractive />
  })
}
