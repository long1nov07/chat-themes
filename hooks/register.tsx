import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren, ThemeSetArgs } from 'claude-code'

import type { Choice, SceneId } from '../types'
import { makeColors } from './make-colors.js'
import { scene, thumbnail } from './scenes'

const PLUGIN = 'chat-themes'
const OLD_PANE = 'chat-themes'
const STORE_KEY = 'scene'

const current = atom({ plugin: 'chat-themes', key: 'current' } as const, 'off')
// Whether the picker is open: open with its cards, or folded to one line.
const isOpen = atom({ plugin: 'chat-themes', key: 'isOpen' } as const, true)

type Entry = {
  id: SceneId
  icon: string
  accent: string
  name: string
  blurb: string
  preview: string[]
  look: () => ThemeSetArgs
}

// A theme's look, worked out the first time it is used: makeColors is the
// costly part, and a session needs one theme, not all of them.
const look = (
  id: SceneId,
  label: string,
  tint: string,
  roles: { accent: string; danger: string; success: string; warning: string; pro: string },
  anchors: Record<'surface-0' | 'surface-1' | 'surface-2' | 'surface-3' | 'text-primary' | 'text-secondary' | 'text-muted', string>,
): (() => ThemeSetArgs) => {
  let made: ThemeSetArgs | undefined
  return () =>
    (made ??= {
      colors: makeColors({ label, id, only: 'dark', roles, dark: { gray: { anchors } } }).theme,
      backdrop: { scene: id, glass: { blur: 12, tint, opacity: 0.55 } },
      overrideColorScheme: 'dark',
    })
}

const THEMES: Entry[] = [
  {
    id: 'underwater',
    accent: '#3fb6e0',
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
    accent: '#f5a531',
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
    accent: '#8ea2ff',
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
    accent: '#c9df4f',
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

const byId = new Map(THEMES.map(t => [t.id, t]))
const isScene = (v: unknown): v is SceneId => byId.has(v as SceneId)

const apply = async ($: EngineInterface, choice: Choice) => {
  // The band marks the choice at once; the theme and the saved choice follow
  // together rather than one after the other.
  await update($, current, () => choice)
  const entry = choice === 'off' ? undefined : byId.get(choice)
  // Off clears only because the person pressed it. A set that is not drawn
  // yet only means no app is attached now: the theme stands and draws once
  // one attaches.
  await Promise.all([
    entry === undefined ? $.theme.clear() : $.theme.set(entry.look()),
    $.store.set(STORE_KEY, choice),
  ])
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // Independent calls go out together, so the session starts sooner.
    const [saved] = await Promise.all([
      $.store.get(STORE_KEY),
      $.command.register({
        name: 'chat-themes',
        description: 'Đổi hình nền ASCII: /chat-themes underwater | pond | night-sky | fireflies | off',
      }),
      // The picker used to be a pane; close one an earlier version opened.
      $.ui.close({ id: OLD_PANE }).catch(() => undefined),
    ])

    if (isScene(saved)) {
      // A theme already chosen: start with the picker folded to one line.
      await Promise.all([
        $.theme.set(byId.get(saved)!.look()),
        update($, current, () => saved),
        update($, isOpen, () => false),
      ])
    }

    return next(e)
  })

  on('command.run', { command: 'chat-themes' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg === 'off' || isScene(arg)) {
      await apply($, arg)
      const name = byId.get(arg as SceneId)?.name ?? 'Tắt hình nền'

      return { text: `Chat themes: ${name}` }
    }

    await update($, isOpen, () => true)

    return { text: 'Đã mở bảng chọn hình nền ngay trên ô chat. Cũng có thể gõ /chat-themes underwater | pond | night-sky | fireflies | off.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const chosen = await read($, current)
    const open = await read($, isOpen)
    const using = chosen === 'off' ? undefined : byId.get(chosen)
    const setOpen = (value: boolean) => () => update($, isOpen, () => value)

    if (!open) {
      return (
        <Box flexDirection="row" gap="sm" alignItems="center">
          <Text dimColor>Chat themes</Text>
          <Text>{using === undefined ? 'Không dùng hình nền' : `${using.icon} ${using.name}`}</Text>
          <Button key="open" variant="secondary" label="Đổi hình nền" onPress={setOpen(true)} />
        </Box>
      )
    }

    // The terminal has no Svg: its cards show the ASCII preview instead.
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : undefined
    const card = (key: string, label: string, isChosen: boolean, accent: string, face: RenderChildren, onPress: () => unknown) => (
      <Box
        key={`card-${key}`}
        flexDirection="column"
        alignItems="center"
        gap="xs"
        padding="xs"
        borderStyle="round"
        borderColor={isChosen ? accent : 'subtle'}
        hover={{ borderColor: accent }}
      >
        {face}
        <Button key={`use-${key}`} plain label={isChosen ? `${label} ✓` : label} onPress={onPress} />
      </Box>
    )

    return (
      <Box flexDirection="column" gap="sm" padding="sm" borderStyle="round" borderColor="subtle">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flexDirection="row" gap="sm" alignItems="center">
            <Text mono backgroundColor="subtle"> /chat-themes </Text>
            <Text dimColor>ASCII wallpapers</Text>
          </Box>
          <Button key="close" role="dismiss" label="Đóng" onPress={setOpen(false)} />
        </Box>
        <Box flexDirection="row" gap="sm" flexWrap="wrap">
          {THEMES.map(t =>
            card(
              t.id,
              t.name,
              chosen === t.id,
              t.accent,
              Svg !== undefined ? (
                <Svg source={thumbnail(t.id)} alt={`Xem trước: ${t.name}`} width={136} height={80} />
              ) : (
                <Text mono dimColor>{t.preview.join('\n')}</Text>
              ),
              () => apply($, t.id),
            ),
          )}
          {card(
            'off',
            'Không nền',
            chosen === 'off',
            '#9aa0a6',
            Svg !== undefined ? (
              <Box width={136} height={80} alignItems="center" justifyContent="center" backgroundColor="#16181c">
                <Text dimColor>Giao diện gốc</Text>
              </Box>
            ) : (
              <Text mono dimColor>{['               ', '  giao diện    ', '     gốc       ', '               ', '               '].join('\n')}</Text>
            ),
            () => apply($, 'off'),
          )}
        </Box>
        {e.surface !== 'desktop' && e.surface !== 'mobile' && (
          <Text dimColor>Hình nền chỉ hiện trong app desktop và mobile.</Text>
        )}
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
    const drawn = scene(e.props.scene)

    return <Svg source={drawn.svg} alt={drawn.alt} isInteractive />
  })
}
