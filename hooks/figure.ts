import type { Pose } from '../types'

// The mini-figure: a little orange Claude in a hard hat and a hi-vis vest,
// drawn in chunky 4px blocks on an 80 by 80 picture. It chills or sleeps while
// Claude Code is idle and works on a laptop while a turn runs.
//
// One picture per change of pose. Its intro plays the move from the pose
// before (a yawn and a tip over, a hop awake, the laptop sliding in or shut and
// away) once, then the pose's own loop takes over. The plain markup holds the
// pose it ends in, so with motion turned off it still shows where it landed.

const U = 4
const rect = (x: number, y: number, w: number, h: number, fill: string, cls = '') =>
  `<rect${cls ? ` class="${cls}"` : ''} x="${x * U}" y="${y * U}" width="${w * U}" height="${h * U}" fill="${fill}"/>`

const ORANGE = '#d97757'
const SHADE = '#b85f43'

const HAT =
  rect(7, 3, 6, 1, '#f2c230') + rect(8, 3, 2, 1, '#ffe27a') + rect(6, 4, 8, 1, '#f2c230') + rect(5, 5, 10, 1, '#d9a520')
const BODY = rect(6, 6, 8, 9, ORANGE)
const VEST = rect(6, 11.5, 8, 3.5, '#c8e64a') + rect(6, 12.8, 8, 0.7, '#f1f5f7') + rect(9.5, 11.5, 1, 3.5, ORANGE)
const ARMS = `<g class="arms">${rect(4.5, 10, 1.5, 2, ORANGE)}${rect(14, 10, 1.5, 2, ORANGE)}</g>`
const LEGS = [7, 8.75, 10.25, 12].map(x => rect(x, 15, 1, 2, SHADE)).join('')
const EYES_OPEN = `<g class="eo">${rect(8, 8, 1, 2, '#1d1d1f')}${rect(11, 8, 1, 2, '#1d1d1f')}</g>`
const EYES_SHUT = `<g class="es">${rect(7.5, 9.25, 1.75, 0.5, '#1d1d1f')}${rect(10.75, 9.25, 1.75, 0.5, '#1d1d1f')}</g>`
const YAWN = rect(9.25, 10.1, 1.5, 1.3, '#5a1f14', 'yawn')
const GLOW = rect(6, 6, 8, 6, '#7fe0ff', 'glow')
const LAPTOP =
  `<g class="lap"><g class="lid">${rect(5.5, 12, 9, 4, '#c9d1d9')}${rect(9.5, 13.5, 1, 1, ORANGE)}</g>` +
  `${rect(4.5, 16, 11, 1.5, '#8f99a4')}</g>`
const ZZZ =
  '<g class="zzz" font-family="monospace" font-weight="bold" fill="#cfe3ff">' +
  '<text class="z1" x="14" y="46" font-size="9">z</text>' +
  '<text class="z2" x="20" y="38" font-size="11">z</text>' +
  '<text class="z3" x="27" y="29" font-size="13">Z</text></g>'
const NOTE = '<text class="note" x="58" y="22" font-size="12" font-family="monospace" fill="#f5d77e">♪</text>'
const BANG = '<text class="bang" x="54" y="18" font-size="16" font-weight="bold" font-family="monospace" fill="#ffd34d">!</text>'

// Where the whole figure stands in each pose, turned about its feet.
const ORIGIN = '40px 68px'
const POSE: Record<Pose, string> = {
  chill: 'translate(0px,0px) rotate(0deg) scale(1,1)',
  sleep: 'translate(26px,-16px) rotate(-90deg) scale(1,1)',
  work: 'translate(0px,4px) rotate(0deg) scale(1,1)',
}
const at = (x: number, y: number, deg = 0, sx = 1, sy = 1) =>
  `translate(${x}px,${y}px) rotate(${deg}deg) scale(${sx},${sy})`

type Move = {
  seconds: number
  // the figure's path, as keyframe stops
  body: string
  // the other parts' moves: class name to keyframe stops
  parts?: Record<string, string>
}

// The moves between poses. Each part not named keeps its pose's look.
const MOVES: Partial<Record<`${Pose}>${Pose}`, Move>> = {
  'chill>sleep': {
    seconds: 1.9,
    body:
      `0%{transform:${POSE.chill}}28%{transform:${at(0, 0, 0, 1.06, 1.1)}}44%{transform:${POSE.chill}}` +
      `62%{transform:${at(4, -2, -22)}}100%{transform:${POSE.sleep}}`,
    parts: {
      yawn: '0%{opacity:0}14%{opacity:1}42%{opacity:1}52%{opacity:0}100%{opacity:0}',
      eo: '0%{opacity:1}50%{opacity:1}56%{opacity:0}100%{opacity:0}',
      es: '0%{opacity:0}50%{opacity:0}56%{opacity:1}100%{opacity:1}',
      shadow: '0%{transform:scaleX(1)}60%{transform:scaleX(1)}100%{transform:scaleX(1.9)}',
      zzz: '0%{opacity:0}90%{opacity:0}100%{opacity:1}',
    },
  },
  'sleep>chill': {
    seconds: 1.6,
    body:
      `0%{transform:${POSE.sleep}}34%{transform:${at(18, -9, -45)}}64%{transform:${at(0, -9)}}` +
      `80%{transform:${at(0, 0, 0, 1.06, 0.94)}}100%{transform:${POSE.chill}}`,
    parts: {
      eo: '0%{opacity:0}24%{opacity:0}30%{opacity:1}100%{opacity:1}',
      es: '0%{opacity:1}24%{opacity:1}30%{opacity:0}100%{opacity:0}',
      zzz: '0%{opacity:1}18%{opacity:0}100%{opacity:0}',
      bang: '0%{opacity:0}20%{opacity:1;transform:translateY(0)}60%{opacity:1;transform:translateY(-4px)}72%{opacity:0}100%{opacity:0}',
      shadow: '0%{transform:scaleX(1.9)}50%{transform:scaleX(1)}100%{transform:scaleX(1)}',
    },
  },
  'chill>work': {
    seconds: 1.6,
    body: `0%{transform:${POSE.chill}}24%{transform:${at(0, -6)}}44%{transform:${POSE.chill}}100%{transform:${POSE.work}}`,
    parts: {
      lap: '0%{transform:translateX(56px);opacity:0}20%{opacity:1}52%{transform:translateX(0)}100%{transform:translateX(0);opacity:1}',
      lid: '0%{transform:scaleY(.08)}56%{transform:scaleY(.08)}86%{transform:scaleY(1)}100%{transform:scaleY(1)}',
      glow: '0%{opacity:0}84%{opacity:0}100%{opacity:.16}',
    },
  },
  'sleep>work': {
    seconds: 2.1,
    body:
      `0%{transform:${POSE.sleep}}12%{transform:${at(26, -22, -90)}}22%{transform:${POSE.sleep}}` +
      `52%{transform:${at(0, -8)}}66%{transform:${POSE.chill}}100%{transform:${POSE.work}}`,
    parts: {
      eo: '0%{opacity:0}12%{opacity:0}16%{opacity:1}100%{opacity:1}',
      es: '0%{opacity:1}12%{opacity:1}16%{opacity:0}100%{opacity:0}',
      zzz: '0%{opacity:1}12%{opacity:0}100%{opacity:0}',
      bang: '0%{opacity:0}10%{opacity:1}46%{opacity:1}56%{opacity:0}100%{opacity:0}',
      shadow: '0%{transform:scaleX(1.9)}50%{transform:scaleX(1)}100%{transform:scaleX(1)}',
      lap: '0%{transform:translateX(56px);opacity:0}56%{transform:translateX(56px);opacity:0}62%{opacity:1}80%{transform:translateX(0)}100%{transform:translateX(0);opacity:1}',
      lid: '0%{transform:scaleY(.08)}82%{transform:scaleY(.08)}98%{transform:scaleY(1)}100%{transform:scaleY(1)}',
      glow: '0%{opacity:0}96%{opacity:0}100%{opacity:.16}',
    },
  },
  'work>chill': {
    seconds: 1.8,
    body:
      `0%{transform:${POSE.work}}52%{transform:${POSE.work}}70%{transform:${at(0, 0, 0, 0.95, 1.1)}}` +
      `86%{transform:${POSE.chill}}100%{transform:${POSE.chill}}`,
    parts: {
      lid: '0%{transform:scaleY(1)}24%{transform:scaleY(.08)}100%{transform:scaleY(.08)}',
      lap: '0%{transform:translateX(0);opacity:1}26%{transform:translateX(0);opacity:1}54%{transform:translateX(56px);opacity:0}100%{transform:translateX(56px);opacity:0}',
      glow: '0%{opacity:.16}20%{opacity:0}100%{opacity:0}',
      arms: '0%{transform:translateY(0)}58%{transform:translateY(0)}72%{transform:translateY(-6px)}88%{transform:translateY(0)}100%{transform:translateY(0)}',
    },
  },
  'work>sleep': {
    seconds: 2.6,
    body:
      `0%{transform:${POSE.work}}40%{transform:${POSE.work}}54%{transform:${POSE.chill}}66%{transform:${at(0, 0, 0, 1.06, 1.1)}}` +
      `78%{transform:${at(4, -2, -22)}}100%{transform:${POSE.sleep}}`,
    parts: {
      lid: '0%{transform:scaleY(1)}18%{transform:scaleY(.08)}100%{transform:scaleY(.08)}',
      lap: '0%{transform:translateX(0);opacity:1}20%{transform:translateX(0);opacity:1}42%{transform:translateX(56px);opacity:0}100%{transform:translateX(56px);opacity:0}',
      glow: '0%{opacity:.16}16%{opacity:0}100%{opacity:0}',
      yawn: '0%{opacity:0}56%{opacity:0}62%{opacity:1}74%{opacity:1}80%{opacity:0}100%{opacity:0}',
      eo: '0%{opacity:1}80%{opacity:1}84%{opacity:0}100%{opacity:0}',
      es: '0%{opacity:0}80%{opacity:0}84%{opacity:1}100%{opacity:1}',
      shadow: '0%{transform:scaleX(1)}76%{transform:scaleX(1)}100%{transform:scaleX(1.9)}',
      zzz: '0%{opacity:0}94%{opacity:0}100%{opacity:1}',
    },
  },
}

// Each pose's look at rest, and the loops it keeps up once it got there.
// The loops move in steps, as a pixel sprite does: a few changes a second
// instead of sixty, which cuts what the figure costs to draw by about 70%.
const REST: Record<Pose, { look: string; loops: Record<string, string> }> = {
  chill: {
    look: '.eo{opacity:1}.es,.yawn,.zzz,.lap,.glow,.bang,.note{opacity:0}',
    loops: { idle: 'breathe 3.4s steps(4,jump-none) infinite', eo: 'blink 4.6s steps(1,end) infinite', note: 'note 7s steps(6,jump-none) infinite' },
  },
  sleep: {
    look: '.es,.zzz{opacity:1}.eo,.yawn,.lap,.glow,.bang,.note{opacity:0}.shadow{transform:scaleX(1.9)}',
    loops: { idle: 'snore 4.2s steps(4,jump-none) infinite', z1: 'zfloat 3.6s steps(6,jump-none) infinite', z2: 'zfloat 3.6s steps(6,jump-none) 1.2s infinite', z3: 'zfloat 3.6s steps(6,jump-none) 2.4s infinite' },
  },
  work: {
    look: '.eo,.lap{opacity:1}.glow{opacity:.16}.es,.yawn,.zzz,.bang,.note{opacity:0}',
    loops: { idle: 'bob 1.6s steps(2,jump-none) infinite', arms: 'type .36s steps(1,end) infinite alternate', glow: 'screen 2.6s steps(3,jump-none) infinite alternate' },
  },
}

const LOOPS =
  '@keyframes breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.02,1.035)}}' +
  '@keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.15)}}' +
  '@keyframes note{0%{opacity:0;transform:translate(0,0)}15%{opacity:.9}60%{opacity:0;transform:translate(6px,-14px)}100%{opacity:0;transform:translate(6px,-14px)}}' +
  '@keyframes snore{0%,100%{transform:scale(1,1)}50%{transform:scale(1.035,1)}}' +
  '@keyframes zfloat{0%{opacity:0;transform:translate(0,0)}20%{opacity:1}100%{opacity:0;transform:translate(10px,-14px)}}' +
  '@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}' +
  '@keyframes type{from{transform:translateY(0)}to{transform:translateY(-2px)}}' +
  '@keyframes screen{from{opacity:.12}to{opacity:.2}}'

const ORIGINS =
  `.pose,.idle{transform-origin:${ORIGIN}}` +
  '.shadow{transform-origin:40px 70px}.lid{transform-origin:40px 64px}' +
  '.eo{transform-origin:40px 36px}'

// Adds a delay to one animation's shorthand: its first time is the duration,
// so a second time, if any, is the delay to add to.
const later = (spec: string, by: number) => {
  const times = [...spec.matchAll(/(\d*\.?\d+)s/g)]
  if (times.length < 2) return spec.replace(/(\d*\.?\d+s)/, `$1 ${by}s`)
  const delay = times[1]!
  return spec.slice(0, delay.index) + `${(Number(delay[1]) + by).toFixed(2)}s` + spec.slice(delay.index! + delay[0].length)
}

const made = new Map<string, string>()

/**
 * The figure's picture for arriving at `to`, from `from` (null: it is simply
 * there). Built once for each of the few pairs and kept.
 */
export const figure = (to: Pose, from: Pose | null): string => {
  const key = `${from ?? '-'}>${to}`
  const cached = made.get(key)
  if (cached !== undefined) return cached

  const move = from === null || from === to ? undefined : MOVES[`${from}>${to}`]
  const rest = REST[to]
  // Every part's animations, in one list each: the move first, then the
  // pose's loop, held back until the move is done.
  const lists: Record<string, string[]> = {}
  let keyframes = LOOPS
  if (move !== undefined) {
    const s = move.seconds
    keyframes += `@keyframes intro{${move.body}}`
    lists.pose = [`intro ${s}s ease-in-out both`]
    for (const [part, stops] of Object.entries(move.parts ?? {})) {
      keyframes += `@keyframes m-${part}{${stops}}`
      lists[part] = [`m-${part} ${s}s ease-in-out both`]
    }
  }
  for (const [part, loop] of Object.entries(rest.loops)) {
    ;(lists[part] ??= []).push(move === undefined ? loop : later(loop, move.seconds))
  }
  const animations = Object.entries(lists)
    .map(([part, list]) => `.${part}{animation:${list.join(',')}}`)
    .join('')

  const css = `${ORIGINS}.pose{transform:${POSE[to]}}${rest.look}${keyframes}${animations}`
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" shape-rendering="crispEdges">' +
    `<style>${css}</style>` +
    '<ellipse class="shadow" cx="40" cy="70" rx="14" ry="2.5" fill="#000" opacity=".25"/>' +
    `<g class="pose"><g class="idle">${HAT}${BODY}${VEST}${ARMS}${LEGS}${EYES_OPEN}${EYES_SHUT}${YAWN}${GLOW}</g></g>` +
    LAPTOP +
    ZZZ +
    NOTE +
    BANG +
    '</svg>'
  made.set(key, svg)
  return svg
}

export const FIGURE_ALT: Record<Pose, string> = {
  chill: 'Claude nhỏ đội mũ bảo hộ đang đứng thư giãn',
  sleep: 'Claude nhỏ đội mũ bảo hộ đang nằm ngủ',
  work: 'Claude nhỏ đội mũ bảo hộ đang gõ laptop',
}
