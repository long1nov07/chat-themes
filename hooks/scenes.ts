import type { SceneId } from '../types'

// Animated ASCII backdrops. Every scene is one pure-vector SVG whose characters
// are <text> in the generic monospace font, moved by CSS alone. Each moving
// part has a resting place and opacity in the plain markup, so the scene still
// looks finished when motion is turned off.

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

const n = (v: number) => v.toFixed(1)

const svg = (defs: string, css: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs>${defs}</defs><style>text{font-family:monospace;white-space:pre}${css}</style>${body}</svg>`

const sky = (id: string, top: string, bottom: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`

// ---------------------------------------------------------------- underwater

const underwater = (): string => {
  const r = rng(11)
  const parts: string[] = []

  parts.push(`<rect width="${W}" height="${H}" fill="url(#sea)"/>`)

  // light rays from the surface
  for (let i = 0; i < 5; i++) {
    const x = 150 + i * 320 + r() * 80
    parts.push(
      `<polygon class="ray" points="${n(x)},0 ${n(x + 90)},0 ${n(x + 260)},${H} ${n(x + 40)},${H}" ` +
        `style="animation-duration:${n(9 + r() * 6)}s;animation-delay:-${n(r() * 10)}s" opacity=".05"/>`,
    )
  }

  // the surface, rows of ASCII waves drifting side to side
  for (let row = 0; row < 3; row++) {
    let line = ''
    for (let i = 0; i < 150; i++) line += r() < 0.55 ? '~' : r() < 0.5 ? '-' : ' '
    parts.push(
      `<text class="wave" x="-60" y="${40 + row * 26}" font-size="22" opacity="${n(0.45 - row * 0.12)}" ` +
        `style="animation-duration:${14 + row * 5}s;animation-delay:-${row * 3}s">${line}</text>`,
    )
  }

  // seaweed swaying from the sand
  for (let i = 0; i < 14; i++) {
    const x = 40 + i * 112 + r() * 60
    const tall = 6 + Math.floor(r() * 9)
    const base = H - 50
    let strand = ''
    for (let k = 0; k < tall; k++) {
      const ch = k % 2 === 0 ? '(' : ')'
      strand += `<text x="${n(x + (k % 2) * 6)}" y="${n(base - k * 22)}" font-size="24">${ch}</text>`
    }
    parts.push(
      `<g class="weed" style="transform-origin:${n(x)}px ${base}px;animation-duration:${n(5 + r() * 4)}s;animation-delay:-${n(r() * 6)}s">${strand}</g>`,
    )
  }

  // the sand
  for (let row = 0; row < 2; row++) {
    let line = ''
    for (let i = 0; i < 140; i++) line += '_.,-:.'[Math.floor(r() * 6)]
    parts.push(`<text x="0" y="${H - 28 + row * 20}" font-size="20" fill="#b89a62" opacity="${n(0.5 - row * 0.15)}">${line}</text>`)
  }

  // fish crossing at different depths
  for (let i = 0; i < 9; i++) {
    const right = r() < 0.5
    const shape = right
      ? ['><>', '><(((*>', '>-)>'][Math.floor(r() * 3)]!
      : ['<><', '<*)))><', '<(-<'][Math.floor(r() * 3)]!
    const y = 220 + r() * 560
    const x = r() * W
    const size = 20 + Math.floor(r() * 16)
    parts.push(
      `<g class="bob" style="animation-duration:${n(4 + r() * 3)}s;animation-delay:-${n(r() * 4)}s">` +
        `<text class="${right ? 'swim-r' : 'swim-l'}" x="${n(x)}" y="${n(y)}" font-size="${size}" fill="${['#f2b25c', '#8fd3e8', '#f08a7a', '#e8e08f'][i % 4]}" opacity=".75" ` +
        `style="animation-duration:${n(55 + r() * 40)}s;animation-delay:-${n(r() * 90)}s">${esc(shape)}</text></g>`,
    )
  }

  // bubbles rising
  for (let i = 0; i < 46; i++) {
    const ch = ['o', 'O', '.', 'o', 'O'][Math.floor(r() * 5)]!
    parts.push(
      `<text class="bub" x="${n(r() * W)}" y="${n(200 + r() * 760)}" font-size="${14 + Math.floor(r() * 16)}" opacity=".4" ` +
        `style="animation-duration:${n(10 + r() * 12)}s;animation-delay:-${n(r() * 22)}s">${ch}</text>`,
    )
  }

  return svg(
    sky('sea', '#0b4468', '#020d18'),
    '.ray{fill:#9fe3ff;animation:ray ease-in-out infinite alternate}' +
      '@keyframes ray{from{opacity:.03}to{opacity:.09}}' +
      '.wave{fill:#7cc8e6;animation:drift ease-in-out infinite alternate}' +
      '@keyframes drift{from{transform:translateX(-50px)}to{transform:translateX(30px)}}' +
      '.weed{fill:#2f8a5a;opacity:.7;animation:sway ease-in-out infinite alternate}' +
      '@keyframes sway{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}' +
      '.bob{animation:bob ease-in-out infinite alternate}' +
      '@keyframes bob{from{transform:translateY(-6px)}to{transform:translateY(6px)}}' +
      '.swim-r{animation:swimr linear infinite}' +
      '@keyframes swimr{from{transform:translateX(-1900px)}to{transform:translateX(1900px)}}' +
      '.swim-l{animation:swiml linear infinite}' +
      '@keyframes swiml{from{transform:translateX(1900px)}to{transform:translateX(-1900px)}}' +
      '.bub{fill:#bfe9fa;animation:rise linear infinite}' +
      '@keyframes rise{0%{transform:translate(0,320px);opacity:0}15%{opacity:.6}50%{transform:translate(8px,0)}85%{opacity:.45}100%{transform:translate(-4px,-320px);opacity:0}}',
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

  // stars twinkling, slowly
  for (let i = 0; i < 130; i++) {
    const ch = ['.', '.', '*', '+', "'", '.'][Math.floor(r() * 6)]!
    const size = ch === '*' || ch === '+' ? 14 + Math.floor(r() * 10) : 16 + Math.floor(r() * 8)
    parts.push(
      `<text class="star" x="${n(r() * W)}" y="${n(20 + r() * 700)}" font-size="${size}" opacity=".6" ` +
        `style="animation-duration:${n(3 + r() * 5)}s;animation-delay:-${n(r() * 8)}s">${esc(ch)}</text>`,
    )
  }

  // clouds drifting
  for (let i = 0; i < 4; i++) {
    const line = ['.-~~~-.', '.~~~~~~~~-.', '~-.__.-~~-.', '.-~~-.__.-~-.'][i]!
    parts.push(
      `<text class="cloud" x="${n(r() * W)}" y="${n(260 + r() * 280)}" font-size="${26 + i * 4}" opacity=".18" ` +
        `style="animation-duration:${n(120 + r() * 80)}s;animation-delay:-${n(r() * 200)}s">${esc(line)}</text>`,
    )
  }

  // shooting stars, rare
  for (let i = 0; i < 2; i++) {
    parts.push(
      `<g transform="rotate(18 ${n(200 + i * 600)} ${n(80 + i * 60)})"><text class="shoot" x="${n(200 + i * 600)}" y="${n(80 + i * 60)}" font-size="22" opacity="0" ` +
        `style="animation-delay:-${n(i * 9 + 3)}s">${esc('- - --==*')}</text></g>`,
    )
  }

  // mountains, layered rows of carets
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
    '.star{fill:#e8ecff;animation:twinkle ease-in-out infinite alternate}' +
      '@keyframes twinkle{from{opacity:.15}to{opacity:.9}}' +
      '.cloud{fill:#aab3e0;animation:cloud linear infinite}' +
      '@keyframes cloud{from{transform:translateX(-1800px)}to{transform:translateX(1800px)}}' +
      '.shoot{fill:#ffffff;animation:shoot 19s linear infinite}' +
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
  for (let i = 0; i < 40; i++) {
    parts.push(`<text x="${n(r() * W)}" y="${n(20 + r() * 360)}" font-size="16" fill="#c9d8c0" opacity="${n(0.15 + r() * 0.25)}">.</text>`)
  }

  // tree line far back
  let trees = ''
  for (let x = 10 + r() * 40; x < W + 40; x += 80 + r() * 90) {
    const tall = 4 + Math.floor(r() * 5)
    const foot = H - 250 - r() * 30
    for (let k = 0; k < tall; k++) {
      const width = 1 + Math.floor(((tall - k) * 2) / 3) * 2
      trees += `<text x="${n(x)}" y="${n(foot - k * 20)}" font-size="22" text-anchor="middle">${'A'.repeat(width).replace(/A/g, k === tall - 1 ? '^' : '*')}</text>`
    }
    trees += `<text x="${n(x)}" y="${n(foot + 20)}" font-size="22" text-anchor="middle">|</text>`
  }
  parts.push(`<g fill="#1a4429" opacity=".9">${trees}</g>`)

  // fireflies, drifting and glowing
  for (let i = 0; i < 48; i++) {
    const path = ['fa', 'fb', 'fc'][i % 3]
    const ch = r() < 0.7 ? '*' : '.'
    parts.push(
      `<g class="${path}" style="animation-duration:${n(14 + r() * 14)}s;animation-delay:-${n(r() * 28)}s">` +
        `<text class="fly" x="${n(r() * W)}" y="${n(260 + r() * 640)}" font-size="${16 + Math.floor(r() * 12)}" opacity=".6" filter="url(#glow)" ` +
        `style="animation-duration:${n(4 + r() * 4)}s;animation-delay:-${n(r() * 8)}s">${ch}</text></g>`,
    )
  }

  // tall grass in front, swaying
  for (let row = 0; row < 4; row++) {
    let line = ''
    for (let i = 0; i < 150; i++) line += "|/',v|Y|"[Math.floor(r() * 8)]
    parts.push(
      `<text class="grass" x="-30" y="${H - 90 + row * 24}" font-size="24" fill="${['#1f4a2c', '#245733', '#1a3f26', '#14321e'][row]}" ` +
        `style="animation-duration:${n(6 + row * 1.5)}s;animation-delay:-${row}s">${esc(line)}</text>`,
    )
  }

  return svg(
    sky('dusk', '#050b12', '#0f2418') +
      '<filter id="glow" x="-200%" y="-200%" width="500%" height="500%">' +
      '<feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
    '.fly{fill:#e6f56a;animation:pulse ease-in-out infinite alternate}' +
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
// cycle takes another diagonal. The school is laid out facing right and
// pointed along its path by the group's transform, so it swims along x alone.
const FISH = "><(((('>"

const pond = (): string => {
  const r = rng(53)
  const parts: string[] = []

  parts.push(`<rect width="${W}" height="${H}" fill="url(#pond)"/>`)

  // faint ripple texture on the surface, drifting slowly
  for (let i = 0; i < 70; i++) {
    const mark = ['~', '~~', '-~', '~ ~', '.'][Math.floor(r() * 5)]!
    parts.push(
      `<text class="tex" x="${n(r() * W)}" y="${n(r() * H)}" font-size="${16 + Math.floor(r() * 10)}" opacity="${n(0.08 + r() * 0.12)}" ` +
        `style="animation-duration:${n(16 + r() * 14)}s;animation-delay:-${n(r() * 30)}s">${mark}</text>`,
    )
  }

  // goldfish: three passes, each on its own diagonal, one at a time
  const SCHOOL = [
    [0, 0, 36, '#f6a531'],
    [-160, -62, 32, '#ffb84a'],
    [-150, 66, 33, '#f08c2a'],
    [-310, -20, 30, '#ffd36b'],
    [-300, 108, 31, '#f59b3c'],
  ] as const
  const PASSES = [
    { x: -350, y: 120, angle: 24, mirror: false, delay: 0 },
    { x: 1950, y: 260, angle: 22, mirror: true, delay: 25 },
    { x: -350, y: 980, angle: -30, mirror: false, delay: 50 },
  ]
  for (const pass of PASSES) {
    const fish = SCHOOL.map(
      ([dx, dy, size, color], i) =>
        `<text class="wig" x="${dx}" y="${dy}" font-size="${size}" font-weight="bold" fill="${color}" ` +
        `style="animation-duration:${n(1.1 + i * 0.13)}s;animation-delay:-${n(i * 0.37)}s">${esc(FISH)}</text>`,
    ).join('')
    const turn = `translate(${pass.x} ${pass.y})${pass.mirror ? ' scale(-1 1)' : ''} rotate(${pass.angle})`
    parts.push(
      `<g transform="${turn}"><g class="school" style="animation-delay:${pass.delay}s">` +
        `<g opacity=".18" transform="translate(6 8)" fill="#021a22">${fish.replace(/fill="#[0-9a-f]{6}"/g, '')}</g>` +
        `${fish}</g></g>`,
    )
  }

  // the gentle wave, sweeping across every 30 seconds
  let crest = ''
  for (let row = 0; row < 34; row++) {
    const y = row * 30 + 6
    const x = Math.sin(row * 0.35) * 60 + (r() - 0.5) * 50
    const main = ['~~~~', '~~~', '~~ ~~', '~~~~~'][Math.floor(r() * 4)]!
    crest += `<text x="${n(x)}" y="${y}" font-size="24" opacity="${n(0.7 + r() * 0.3)}">${main}</text>`
    if (r() < 0.7) crest += `<text x="${n(x - 80 - r() * 60)}" y="${y + 12}" font-size="20" opacity=".45">${r() < 0.5 ? '~ ~' : '~'}</text>`
    if (r() < 0.4) crest += `<text x="${n(x + 90 + r() * 50)}" y="${y + 8}" font-size="18" opacity=".3">~</text>`
  }
  parts.push(`<g class="wave" opacity="0" fill="#bfeaf2">${crest}</g>`)

  // the float, wandering in the upper right and lifted by the wave
  const float =
    `<g class="ring"><ellipse cx="0" cy="22" rx="46" ry="14" fill="none" stroke="#bfeaf2" stroke-width="2"/></g>` +
    `<g class="ring ring2"><ellipse cx="0" cy="22" rx="46" ry="14" fill="none" stroke="#bfeaf2" stroke-width="2"/></g>` +
    `<g class="lift"><g class="bob" font-weight="bold">` +
    `<text x="0" y="-30" font-size="26" fill="#f2f2f2" text-anchor="middle">|</text>` +
    `<text x="0" y="-6" font-size="28" fill="#e5483f" text-anchor="middle">(@@)</text>` +
    `<text x="0" y="16" font-size="28" fill="#f2f2f2" text-anchor="middle">(==)</text>` +
    `</g></g>` +
    `<text x="0" y="46" font-size="22" fill="#bfeaf2" opacity=".5" text-anchor="middle">~ ~~~ ~</text>`
  parts.push(`<g transform="translate(1180 300)"><g class="wander">${float}</g></g>`)

  return svg(
    sky('pond', '#0e5262', '#05262f'),
    '.tex{fill:#9fd6e0;animation:tex ease-in-out infinite alternate}' +
      '@keyframes tex{from{transform:translateX(-14px)}to{transform:translateX(14px)}}' +
      '.school{animation:school 75s linear infinite;animation-fill-mode:backwards}' +
      '@keyframes school{0%{transform:translateX(0)}30%{transform:translateX(2700px)}100%{transform:translateX(2700px)}}' +
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

export const SCENES: Record<SceneId, { svg: string; alt: string }> = {
  underwater: {
    svg: underwater(),
    alt: 'Deep blue water drawn in ASCII: waves at the top, bubbles rising, fish swimming past and seaweed swaying on the sand',
  },
  'night-sky': {
    svg: nightSky(),
    alt: 'A night sky drawn in ASCII: twinkling stars, a moon in the corner, drifting clouds, a rare shooting star over dark mountains',
  },
  pond: {
    svg: pond(),
    alt: 'A pond surface seen from above, drawn in ASCII: a school of five goldfish crossing on a diagonal, a red and white float drifting about, and a gentle wave every thirty seconds',
  },
  fireflies: {
    svg: fireflies(),
    alt: 'A dark meadow drawn in ASCII with glowing fireflies drifting above swaying grass and a distant tree line',
  },
}
