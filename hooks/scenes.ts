import type { SceneId } from '../types'

// Animated ASCII backdrops. Every scene is one pure-vector SVG whose characters
// are <text> in the generic monospace font, moved by CSS alone. Each moving
// part has a resting place and opacity in the plain markup, so the scene still
// looks finished when motion is turned off.
//
// Kept light on purpose: a backdrop plays for hours. Characters that move
// alike share one animated group instead of one animation each, nothing is
// blurred by a filter, and a scene is built only when it is first drawn.

const W = 1600
const H = 1000

// A small seeded random source, so a scene is the same on every draw.
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const n = (v: number) => Math.round(v)
const pick = <T,>(r: () => number, list: readonly T[]): T => list[Math.floor(r() * list.length)]!

const svg = (defs: string, css: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs>${defs}</defs><style>text{font-family:monospace;white-space:pre;text-rendering:optimizeSpeed}${css}</style>${body}</svg>`

const sky = (id: string, top: string, bottom: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`

// One animated group: its class names the keyframes, the style its timing.
const group = (cls: string, seconds: number, delay: number, inner: string, attrs = '') =>
  `<g class="${cls}" style="animation-duration:${seconds.toFixed(1)}s;animation-delay:-${delay.toFixed(1)}s"${attrs}>${inner}</g>`

// ---------------------------------------------------------------- underwater

const underwater = (): string => {
  const r = rng(11)
  const parts: string[] = []

  parts.push(`<rect width="${W}" height="${H}" fill="url(#sea)"/>`)

  // light rays from the surface, held still: a full-screen shimmer would
  // repaint the whole window every frame
  let rays = ''
  for (let i = 0; i < 5; i++) {
    const x = 150 + i * 320 + r() * 80
    rays += `<polygon points="${n(x)},0 ${n(x + 90)},0 ${n(x + 260)},${H} ${n(x + 40)},${H}"/>`
  }
  parts.push(`<g fill="#9fe3ff" opacity=".06">${rays}</g>`)

  // the surface, rows of ASCII waves drifting side to side as one
  let waves = ''
  for (let row = 0; row < 3; row++) {
    let line = ''
    for (let i = 0; i < 150; i++) line += r() < 0.55 ? '~' : r() < 0.5 ? '-' : ' '
    waves += `<text x="-60" y="${40 + row * 26}" font-size="22" opacity="${(0.45 - row * 0.12).toFixed(2)}">${line}</text>`
  }
  parts.push(group('wave', 16, 0, waves, ' fill="#7cc8e6"'))

  // seaweed: the roots hold still while the middle and the tips of each bed
  // slide side to side, the tips further, so the strands look to bend. Sliding
  // is cheap to draw; skewing or turning text redraws every glyph each frame.
  const base = H - 50
  const roots: number[] = []
  const BEDS = 5
  const tiers = Array.from({ length: BEDS }, () => ['', '', ''])
  for (let i = 0; i < 14; i++) {
    const x = 40 + i * 112 + r() * 60
    const tall = 6 + Math.floor(r() * 9)
    const bed = tiers[Math.floor(i / 3)]!
    for (let k = 0; k < tall; k++) {
      const tier = k < tall * 0.34 ? 0 : k < tall * 0.67 ? 1 : 2
      bed[tier] += `<text x="${n(x + (k % 2) * 6)}" y="${base - k * 22}" font-size="24">${k % 2 === 0 ? '(' : ')'}</text>`
    }
    roots.push(x)
  }
  tiers.forEach(([low = "", mid = "", tip = ""], i) => {
    const seconds = 6 + i * 0.9
    const delay = i * 1.7
    parts.push(`<g class="weed">${low}${group('sway1', seconds, delay, mid)}${group('sway2', seconds, delay, tip)}</g>`)
  })

  // the sand
  for (let row = 0; row < 2; row++) {
    let line = ''
    for (let i = 0; i < 140; i++) line += pick(r, ['_', '.', ',', '-', ':', '.'])
    parts.push(`<text x="0" y="${H - 28 + row * 20}" font-size="20" fill="#b89a62" opacity="${(0.5 - row * 0.15).toFixed(2)}">${line}</text>`)
  }

  // fish crossing at different depths; the swim keyframes bob them too
  const colors = ['#f2b25c', '#8fd3e8', '#f08a7a', '#e8e08f']
  for (let i = 0; i < 6; i++) {
    const right = i % 2 === 0
    const shape = right ? pick(r, ['><>', '><(((*>', '>-)>']) : pick(r, ['<><', '<*)))><', '<(-<'])
    const fish = `<text x="${n(r() * W)}" y="${n(220 + r() * 560)}" font-size="${20 + Math.floor(r() * 16)}" fill="${colors[i % 4]}">${esc(shape)}</text>`
    parts.push(group(right ? 'swim-r' : 'swim-l', 55 + r() * 40, r() * 90, fish, ' opacity=".75"'))
  }

  // bubbles: narrow streams rising from the seaweed, each stream one animated
  // strip, drawn twice one screen apart so the loop is seamless
  for (let c = 0; c < 6; c++) {
    const root = roots[(c * 5 + 1) % roots.length]! + 10
    let column = ''
    for (let i = 0; i < 6; i++) {
      const x = root + (r() - 0.5) * 50
      const y = r() * H
      const size = 14 + Math.floor(r() * 16)
      const ch = pick(r, ['o', 'O', '.', 'o'])
      column += `<text x="${n(x)}" y="${n(y)}" font-size="${size}">${ch}</text>`
      column += `<text x="${n(x)}" y="${n(y + H)}" font-size="${size}">${ch}</text>`
    }
    parts.push(group('bub', 16 + c * 2.5, c * 4, column, ' fill="#bfe9fa" opacity=".45"'))
  }

  return svg(
    sky('sea', '#0b4468', '#020d18'),
    '.wave{animation:drift ease-in-out infinite alternate}' +
      '@keyframes drift{from{transform:translateX(-50px)}to{transform:translateX(30px)}}' +
      '.weed{fill:#2f8a5a;opacity:.7}' +
      '.sway1{animation:sway1 ease-in-out infinite alternate}' +
      '@keyframes sway1{from{transform:translateX(-4px)}to{transform:translateX(4px)}}' +
      '.sway2{animation:sway2 ease-in-out infinite alternate}' +
      '@keyframes sway2{from{transform:translateX(-11px)}to{transform:translateX(11px)}}' +
      '.swim-r{animation:swimr linear infinite}' +
      '@keyframes swimr{0%{transform:translate(-1900px,0)}25%{transform:translate(-950px,8px)}50%{transform:translate(0,-6px)}75%{transform:translate(950px,8px)}100%{transform:translate(1900px,0)}}' +
      '.swim-l{animation:swiml linear infinite}' +
      '@keyframes swiml{0%{transform:translate(1900px,0)}25%{transform:translate(950px,-8px)}50%{transform:translate(0,6px)}75%{transform:translate(-950px,-8px)}100%{transform:translate(-1900px,0)}}' +
      '.bub{animation:rise linear infinite}' +
      `@keyframes rise{from{transform:translateY(0)}to{transform:translateY(-${H}px)}}`,
    parts.join(''),
  )
}

// ---------------------------------------------------------------- night sky

const MOON = [
  '     .-oOOOOo-.',
  '   oOOOOOOo@OOOo',
  '  OOOo@@OOOOOOOOO',
  ' OOOOO@OOOOOOo@OOO',
  ' OOOOOOOOOOOOO@@OO',
  ' OOO@@OOOOOOOOOOOO',
  '  OOO@OOOOOO@OOOO',
  "   'OOOOOOOOOOOO'",
  "     '-OOOOOO-'",
]

const nightSky = (): string => {
  const r = rng(23)
  const parts: string[] = []

  parts.push(`<rect width="${W}" height="${H}" fill="url(#night)"/>`)

  // most stars hold still; four clusters twinkle, each on its own beat
  const star = () => {
    const ch = pick(r, ['.', '.', '*', '+', "'", '.'])
    const size = ch === '*' || ch === '+' ? 14 + Math.floor(r() * 10) : 16 + Math.floor(r() * 8)
    return `<text x="${n(r() * W)}" y="${n(20 + r() * 700)}" font-size="${size}">${esc(ch)}</text>`
  }
  let still = ''
  for (let i = 0; i < 90; i++) still += star()
  parts.push(`<g fill="#e8ecff" opacity=".5">${still}</g>`)
  // each cluster keeps to its own patch of sky, so a twinkle repaints a patch
  for (let c = 0; c < 6; c++) {
    let cluster = ''
    for (let i = 0; i < 7; i++) {
      const x = (c % 3) * (W / 3) + r() * (W / 3)
      const y = 20 + Math.floor(c / 3) * 350 + r() * 330
      const ch = pick(r, ['.', '*', '+', '.'])
      cluster += `<text x="${n(x)}" y="${n(y)}" font-size="${16 + Math.floor(r() * 8)}">${ch}</text>`
    }
    parts.push(group('twinkle', 4 + c * 0.9, c * 1.3, cluster, ' fill="#ffffff" opacity=".6"'))
  }

  // clouds drifting
  for (let i = 0; i < 4; i++) {
    const line = ['.-~~~-.', '.~~~~~~~~-.', '~-.__.-~~-.', '.-~~-.__.-~-.'][i]!
    const cloud = `<text x="${n(r() * W)}" y="${n(260 + r() * 280)}" font-size="${26 + i * 4}">${esc(line)}</text>`
    parts.push(group('cloud', 120 + r() * 80, r() * 200, cloud, ' fill="#aab3e0" opacity=".18"'))
  }

  // shooting stars, rare
  for (let i = 0; i < 2; i++) {
    const x = 200 + i * 600
    const y = 80 + i * 60
    parts.push(
      `<g transform="rotate(18 ${x} ${y})">` +
        group('shoot', 19, i * 9 + 3, `<text x="${x}" y="${y}" font-size="22">${esc('- - --==*')}</text>`, ' fill="#ffffff" opacity="0"') +
        `</g>`,
    )
  }

  // mountains, layered rows of carets; drawn still
  const ridge = (seed: number, y: number, color: string, opacity: number) => {
    const rr = rng(seed)
    const heights: number[] = []
    let h = 4
    for (let i = 0; i < 125; i++) {
      h = Math.max(1, Math.min(9, h + Math.floor(rr() * 3) - 1))
      heights.push(h)
    }
    let out = ''
    for (let row = 0; row < 10; row++) {
      let line = ''
      for (const height of heights) line += 10 - row <= height ? (10 - row === height ? '^' : ':') : ' '
      out += `<text x="0" y="${y + row * 18}" font-size="22">${line}</text>`
    }
    return `<g fill="${color}" opacity="${opacity}">${out}</g>`
  }
  parts.push(ridge(5, H - 220, '#1d2550', 0.9))
  parts.push(ridge(9, H - 170, '#121736', 1))

  // the moon, pinned to the top right corner on any screen
  const moon = MOON.map((line, i) => `<text x="0" y="${i * 20}" font-size="20">${esc(line)}</text>`).join('')
  const pinned =
    `<svg x="0" y="0" width="${W}" height="${H}" viewBox="-900 -60 1160 760" preserveAspectRatio="xMaxYMin meet">` +
    `<g class="moon" fill="#f4ead0">${moon}</g></svg>`

  return svg(
    sky('night', '#04061a', '#1b2150'),
    '.twinkle{animation:twinkle ease-in-out infinite alternate}' +
      '@keyframes twinkle{from{opacity:.15}to{opacity:.95}}' +
      '.cloud{animation:cloud linear infinite}' +
      '@keyframes cloud{from{transform:translateX(-1800px)}to{transform:translateX(1800px)}}' +
      '.shoot{animation:shoot linear infinite}' +
      '@keyframes shoot{0%{transform:translateX(0);opacity:0}2%{opacity:.85}7%{transform:translateX(700px);opacity:0}100%{transform:translateX(700px);opacity:0}}' +
      '.moon{opacity:.85;animation:glow 12s ease-in-out infinite alternate}' +
      '@keyframes glow{from{opacity:.75}to{opacity:.95}}',
    parts.join('') + pinned,
  )
}

// ---------------------------------------------------------------- fireflies

const fireflies = (): string => {
  const r = rng(37)
  const parts: string[] = []

  parts.push(`<rect width="${W}" height="${H}" fill="url(#dusk)"/>`)

  // faint stars above the meadow
  let stars = ''
  for (let i = 0; i < 40; i++) stars += `<text x="${n(r() * W)}" y="${n(20 + r() * 360)}" font-size="16" opacity="${(0.3 + r() * 0.5).toFixed(2)}">.</text>`
  parts.push(`<g fill="#c9d8c0" opacity=".5">${stars}</g>`)

  // tree line far back
  let trees = ''
  for (let x = 10 + r() * 40; x < W + 40; x += 80 + r() * 90) {
    const tall = 4 + Math.floor(r() * 5)
    const foot = H - 250 - r() * 30
    for (let k = 0; k < tall; k++) {
      const width = 1 + Math.floor(((tall - k) * 2) / 3) * 2
      trees += `<text x="${n(x)}" y="${n(foot - k * 20)}" font-size="22" text-anchor="middle">${(k === tall - 1 ? '^' : '*').repeat(width)}</text>`
    }
    trees += `<text x="${n(x)}" y="${n(foot + 20)}" font-size="22" text-anchor="middle">|</text>`
  }
  parts.push(`<g fill="#1a4429" opacity=".9">${trees}</g>`)

  // fireflies: a soft halo (a gradient, not a blur filter) under each spark.
  // Six swarms drift; inside each, two flocks glow on their own beat.
  const fly = (cx: number, cy: number) => {
    const x = n(cx + (r() - 0.5) * 360)
    const y = n(cy + (r() - 0.5) * 300)
    const size = 16 + Math.floor(r() * 12)
    return `<circle cx="${x}" cy="${y - size * 0.3}" r="${n(size * 0.9)}" fill="url(#halo)"/>` +
      `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${r() < 0.7 ? '*' : '.'}</text>`
  }
  for (let s = 0; s < 6; s++) {
    // each swarm keeps to its own patch of the meadow
    const cx = 180 + (s % 3) * 620 + (r() - 0.5) * 160
    const cy = s < 3 ? 430 : 720
    let swarm = ''
    for (let f = 0; f < 2; f++) {
      let flock = ''
      for (let i = 0; i < 3; i++) flock += fly(cx, cy)
      swarm += group('pulse', 4 + r() * 4, r() * 8, flock, ' opacity=".6"')
    }
    parts.push(group(['fa', 'fb', 'fc'][s % 3]!, 14 + r() * 14, r() * 28, swarm, ' fill="#e6f56a"'))
  }

  // tall grass in front, swaying in two layers
  const grass = ['', '']
  for (let row = 0; row < 4; row++) {
    let line = ''
    for (let i = 0; i < 150; i++) line += pick(r, ['|', '/', "'", ',', 'v', '|', 'Y', '|'])
    grass[row % 2] += `<text x="-30" y="${H - 90 + row * 24}" font-size="24" fill="${['#1f4a2c', '#245733', '#1a3f26', '#14321e'][row]}">${esc(line)}</text>`
  }
  grass.forEach((layer, i) => parts.push(group('grass', 6 + i * 2, i * 1.5, layer)))

  return svg(
    sky('dusk', '#050b12', '#0f2418') +
      '<radialGradient id="halo"><stop offset="0" stop-color="#e6f56a" stop-opacity=".55"/><stop offset="1" stop-color="#e6f56a" stop-opacity="0"/></radialGradient>',
    '.pulse{animation:pulse ease-in-out infinite alternate}' +
      '@keyframes pulse{0%{opacity:.05}60%{opacity:.25}100%{opacity:.95}}' +
      '.fa{animation:fa ease-in-out infinite alternate}' +
      '@keyframes fa{0%{transform:translate(0,0)}50%{transform:translate(60px,-40px)}100%{transform:translate(-30px,-90px)}}' +
      '.fb{animation:fb ease-in-out infinite alternate}' +
      '@keyframes fb{0%{transform:translate(0,0)}50%{transform:translate(-70px,30px)}100%{transform:translate(40px,-60px)}}' +
      '.fc{animation:fc ease-in-out infinite alternate}' +
      '@keyframes fc{0%{transform:translate(0,0)}50%{transform:translate(30px,50px)}100%{transform:translate(-60px,10px)}}' +
      '.grass{animation:grass ease-in-out infinite alternate}' +
      '@keyframes grass{from{transform:translateX(-6px)}to{transform:translateX(6px)}}',
    parts.join(''),
  )
}

// ---------------------------------------------------------------- pond surface

// A school of five goldfish crosses the pond on a diagonal; each pass of the
// 75 second cycle takes another diagonal. One group carries the whole school:
// its keyframes place it at a pass's start, turn it along that diagonal and
// swim it along x, then jump, off screen, to the next pass's start.
const FISH = "><(((('>"

const PASSES = [
  'translate(-350px,120px) scale(1,1) rotate(24deg)',
  'translate(1950px,260px) scale(-1,1) rotate(22deg)',
  'translate(-350px,980px) scale(1,1) rotate(-30deg)',
] as const

const schoolKeyframes = () => {
  const at = (pass: number, x: number) => `transform:${PASSES[pass]} translateX(${x}px)`
  const jump = 'animation-timing-function:steps(1,end)'
  return (
    '@keyframes school{' +
    `0%{${at(0, 0)}}30%{${at(0, 2700)}}33.3%{${at(0, 2700)};${jump}}` +
    `33.4%{${at(1, 0)}}63.3%{${at(1, 2700)}}66.6%{${at(1, 2700)};${jump}}` +
    `66.7%{${at(2, 0)}}96.6%{${at(2, 2700)}}100%{${at(2, 2700)}}}`
  )
}

const pond = (): string => {
  const r = rng(53)
  const parts: string[] = []

  parts.push(`<rect width="${W}" height="${H}" fill="url(#pond)"/>`)

  // faint ripple texture on the surface, held still: drifting, it would
  // repaint the whole window every frame
  let texture = ''
  for (let i = 0; i < 70; i++) {
    const mark = pick(r, ['~', '~~', '-~', '~ ~', '.'])
    texture += `<text x="${n(r() * W)}" y="${n(r() * H)}" font-size="${16 + Math.floor(r() * 10)}" opacity="${(0.4 + r() * 0.6).toFixed(2)}">${mark}</text>`
  }
  parts.push(`<g fill="#9fd6e0" opacity=".2">${texture}</g>`)

  // the goldfish school, with a soft shadow that follows it
  const SCHOOL = [
    [0, 0, 36, '#f6a531'],
    [-160, -62, 32, '#ffb84a'],
    [-150, 66, 33, '#f08c2a'],
    [-310, -20, 30, '#ffd36b'],
    [-300, 108, 31, '#f59b3c'],
  ] as const
  const shadow = SCHOOL.map(([dx, dy, size]) => `<text x="${dx + 6}" y="${dy + 8}" font-size="${size}">${esc(FISH)}</text>`).join('')
  const fish = SCHOOL.map(([dx, dy, size, color], i) =>
    group('wig', 1.1 + i * 0.13, i * 0.37, `<text x="${dx}" y="${dy}" font-size="${size}" fill="${color}">${esc(FISH)}</text>`),
  ).join('')
  parts.push(
    `<g class="school" style="transform:${PASSES[0]}" font-weight="bold">` +
      `<g fill="#021a22" opacity=".18">${shadow}</g>${fish}</g>`,
  )

  // the gentle wave, sweeping across every 30 seconds
  let crest = ''
  for (let row = 0; row < 34; row++) {
    const y = row * 30 + 6
    const x = Math.sin(row * 0.35) * 60 + (r() - 0.5) * 50
    crest += `<text x="${n(x)}" y="${y}" font-size="24" opacity="${(0.7 + r() * 0.3).toFixed(2)}">${pick(r, ['~~~~', '~~~', '~~ ~~', '~~~~~'])}</text>`
    if (r() < 0.7) crest += `<text x="${n(x - 80 - r() * 60)}" y="${y + 12}" font-size="20" opacity=".45">${r() < 0.5 ? '~ ~' : '~'}</text>`
    if (r() < 0.4) crest += `<text x="${n(x + 90 + r() * 50)}" y="${y + 8}" font-size="18" opacity=".3">~</text>`
  }
  parts.push(`<g class="wave" opacity="0" fill="#bfeaf2">${crest}</g>`)

  // the float, wandering in the upper right and lifted by the wave
  const ring = (cls: string) =>
    `<g class="${cls}"><ellipse cx="0" cy="22" rx="46" ry="14" fill="none" stroke="#bfeaf2" stroke-width="2"/></g>`
  const float =
    ring('ring') +
    ring('ring ring2') +
    `<g class="lift"><g class="bob" font-weight="bold" text-anchor="middle">` +
    `<text x="0" y="-30" font-size="26" fill="#f2f2f2">|</text>` +
    `<text x="0" y="-6" font-size="28" fill="#e5483f">(@@)</text>` +
    `<text x="0" y="16" font-size="28" fill="#f2f2f2">(==)</text>` +
    `</g></g>` +
    `<text x="0" y="46" font-size="22" fill="#bfeaf2" opacity=".5" text-anchor="middle">~ ~~~ ~</text>`
  parts.push(`<g transform="translate(1180 300)"><g class="wander">${float}</g></g>`)

  return svg(
    sky('pond', '#0e5262', '#05262f'),
    '.school{animation:school 75s linear infinite}' +
      schoolKeyframes() +
      '.wig{animation:wig ease-in-out infinite alternate}' +
      '@keyframes wig{from{transform:translate(0,-4px)}to{transform:translate(-3px,4px)}}' +
      '.wave{animation:wave 30s ease-in-out infinite}' +
      '@keyframes wave{0%{transform:translateX(-300px);opacity:0}4%{opacity:.32}22%{opacity:.32}26%{transform:translateX(1900px);opacity:0}100%{transform:translateX(1900px);opacity:0}}' +
      '.wander{animation:wander 48s ease-in-out infinite}' +
      '@keyframes wander{0%{transform:translate(0,0)}25%{transform:translate(-140px,60px)}50%{transform:translate(-60px,150px)}75%{transform:translate(110px,70px)}100%{transform:translate(0,0)}}' +
      '.bob{animation:bob 3.2s ease-in-out infinite alternate}' +
      '@keyframes bob{from{transform:translateY(-3px) rotate(-2deg)}to{transform:translateY(3px) rotate(2deg)}}' +
      '.lift{animation:lift 30s ease-in-out infinite}' +
      '@keyframes lift{0%{transform:translateY(0)}14%{transform:translateY(0) rotate(0)}17%{transform:translateY(-12px) rotate(-7deg)}20%{transform:translateY(5px) rotate(5deg)}24%{transform:translateY(-2px) rotate(-1deg)}28%{transform:translateY(0) rotate(0)}100%{transform:translateY(0)}}' +
      '.ring{opacity:.25;transform-origin:0 22px;animation:ring 5s ease-out infinite}' +
      '.ring2{animation-delay:-2.5s}' +
      '@keyframes ring{from{transform:scale(.6);opacity:.3}to{transform:scale(1.6);opacity:0}}',
    parts.join(''),
  )
}

// ---------------------------------------------------------------- the table

const BUILD: Record<SceneId, () => string> = {
  underwater,
  pond,
  'night-sky': nightSky,
  fireflies,
}

const ALT: Record<SceneId, string> = {
  underwater: 'Deep blue water drawn in ASCII: waves at the top, bubbles rising, fish swimming past and seaweed swaying on the sand',
  pond: 'A pond surface seen from above, drawn in ASCII: a school of five goldfish crossing on a diagonal, a red and white float drifting about, and a gentle wave every thirty seconds',
  'night-sky': 'A night sky drawn in ASCII: twinkling stars, a moon in the corner, drifting clouds, a rare shooting star over dark mountains',
  fireflies: 'A dark meadow drawn in ASCII with glowing fireflies drifting above swaying grass and a distant tree line',
}

const built = new Map<SceneId, { svg: string; alt: string }>()

// A scene's markup, built the first time it is asked for and kept after.
export const scene = (id: SceneId): { svg: string; alt: string } => {
  let made = built.get(id)
  if (made === undefined) {
    made = { svg: BUILD[id](), alt: ALT[id] }
    built.set(id, made)
  }
  return made
}

// Keeps only what a card shows. Every animation goes (a card is a still
// picture), and so does each character that sits outside the card's view.
// A character inside a group that moves or turns it is kept as it is: where
// it lands is not worked out here.
const still = (svg: string, view: string): string => {
  const [vx, vy, vw, vh] = view.split(' ').map(Number) as [number, number, number, number]
  const MARGIN = 40
  const inView = (x: number, y: number) =>
    x > vx - MARGIN - 200 && x < vx + vw + MARGIN && y > vy - MARGIN && y < vy + vh + MARGIN + 30

  const out: string[] = []
  const moved: boolean[] = []
  const tag = /<(\/?)(svg|g|text|style)\b([^>]*)>/g
  let at = 0
  for (let m = tag.exec(svg); m !== null; m = tag.exec(svg)) {
    const [whole, closing, name, attrs = ''] = m
    out.push(svg.slice(at, m.index))
    at = m.index + whole.length

    if (name === 'style' && closing === '') {
      // Keep the rules that colour things; drop every keyframe and timing.
      const end = svg.indexOf('</style>', at)
      const css = svg
        .slice(at, end)
        .replace(/@keyframes [\w-]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
        .replace(/animation[\w-]*:[^;}]*;?/g, '')
      out.push(`<style>${css}</style>`)
      at = end + '</style>'.length
      tag.lastIndex = at
      continue
    }
    if (name === 'text' && closing === '') {
      const x = Number(/\bx="(-?[\d.]+)"/.exec(attrs)?.[1] ?? 0)
      const y = Number(/\by="(-?[\d.]+)"/.exec(attrs)?.[1] ?? 0)
      const end = svg.indexOf('</text>', at) + '</text>'.length
      if (moved.includes(true) || inView(x, y)) out.push(whole + svg.slice(at, end))
      at = end
      tag.lastIndex = at
      continue
    }
    if (closing === '') {
      // A nested svg, a group with a transform, or the school (placed by its
      // style) moves what it holds.
      const isMoved = moved.length > 0 && (name === 'svg' || /transform/.test(attrs))
      moved.push(isMoved)
      if (whole.endsWith('/>')) moved.pop()
      out.push(
        whole
          .replace(/ style="animation-duration:[^"]*"/, '')
          .replace(`viewBox="0 0 ${W} ${H}"`, `viewBox="${view}"`)
          .replace(`style="transform:${PASSES[0]}"`, `style="transform:${PASSES[0]} translateX(1100px)"`),
      )
    } else {
      moved.pop()
      out.push(whole)
    }
  }
  out.push(svg.slice(at))
  return out.join('')
}

const thumbs = new Map<SceneId, string>()

// Where each card looks: the part of the scene with its subject, at the
// card's shape, so a small card still shows fish, a moon or fireflies.
const THUMB_VIEW: Record<SceneId, string> = {
  underwater: '150 380 920 540',
  pond: '330 170 1020 600',
  'night-sky': '640 0 960 565',
  fireflies: '0 280 940 553',
}

// A still picture of a scene for the picker's cards, cut to the card's view.
export const thumbnail = (id: SceneId): string => {
  let made = thumbs.get(id)
  if (made === undefined) {
    made = still(scene(id).svg, THUMB_VIEW[id])
    thumbs.set(id, made)
  }
  return made
}

export const SCENE_IDS = Object.keys(BUILD) as SceneId[]
