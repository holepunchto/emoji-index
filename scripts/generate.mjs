import fs from 'fs'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url-file-url'

const out = fileURLToPath(new URL('../raw-index.js', import.meta.url))
const cdnUrl = 'https://cdn.jsdelivr.net/npm/emojibase-data'

const { version } = await fetchJson(`${cdnUrl}@latest/package.json`)
const data = await fetchJson(`${cdnUrl}@${version}/en/data.json`)
const shortCodes = await fetchJson(`${cdnUrl}@${version}/en/shortcodes/emojibase.json`)

addShortCodes(data, shortCodes)

let keys = ''

const points = []
const codes = []
const reverse = []

for (const emoji of data) {
  if (!emoji.shortCodes.length) continue

  const offset = points.length

  if (emoji.type === 0) { // prefer the "emojis" always over text ones
    for (const code of toCodepoints(emoji.emoji)) {
      points.push(code)
    }
  } else {
    for (const part of emoji.hexcode.split('-')) {
      points.push(parseInt(part, 16))
    }
  }

  const count = points.length - offset

  let first = true

  for (const s of emoji.shortCodes) {
    const keyOffset = keys.length
    const keyLength = s.length
    const c = { key: s, point: [offset, count], string: [keyOffset, keyLength] }

    keys += s
    codes.push(c)

    if (first) {
      first = false
      reverse.push(c)
    }
  }
}

codes.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
reverse.sort((a, b) => cmpCodePoints(toPoint(a.point), toPoint(b.point)))

const KEYS = Buffer.from(keys)
const POINTS = new Uint32Array(points)
const KEY_TO_POINTS = new Uint16Array(codes.length * 3)
const POINTS_TO_KEY = new Uint16Array(reverse.length)

for (let i = 0; i < codes.length; i++) {
  const c = codes[i]

  let ptr = i * 3

  KEY_TO_POINTS[ptr++] = c.string[1] + 256 * c.point[1]
  KEY_TO_POINTS[ptr++] = c.string[0]
  KEY_TO_POINTS[ptr++] = c.point[0]
}

for (let i = 0; i < reverse.length; i++) {
  const c = reverse[i]
  const m = codes.indexOf(c)

  POINTS_TO_KEY[i] = m
}

const INDEX = Buffer.concat([
  Buffer.from(POINTS.buffer, POINTS.byteOffset, POINTS.byteLength),
  Buffer.from(KEY_TO_POINTS.buffer, KEY_TO_POINTS.byteOffset, KEY_TO_POINTS.byteLength),
  Buffer.from(POINTS_TO_KEY.buffer, POINTS_TO_KEY.byteOffset, POINTS_TO_KEY.byteLength),
  KEYS
])

let s = `// https://emojibase.dev version ${version}\n\n`

s += 'const b4a = require(\'b4a\')\n\n'
s += `const INDEX = b4a.from('${INDEX.toString('base64')}', 'base64')\n\n`

let n = 0

s += `exports.POINTS = to32(${n}, ${n += POINTS.byteLength})\n`
s += `exports.KEY_TO_POINTS = to16(${n}, ${n += KEY_TO_POINTS.byteLength})\n`
s += `exports.POINTS_TO_KEY = to16(${n}, ${n += POINTS_TO_KEY.byteLength})\n`
s += `exports.KEYS = INDEX.subarray(${n}, ${n += KEYS.byteLength})\n`
s += '\n'
s += `function to16 (offset, end) {
  return new Uint16Array(INDEX.buffer, offset, (end - offset) / 2)
}\n\n`
s += `function to32 (offset, end) {
  return new Uint32Array(INDEX.buffer, offset, (end - offset) / 4)
}\n`

console.log('Wrote raw-index to', out)
fs.writeFileSync(out, s)

function cmpCodePoints (a, b) {
  if (a.length !== b.length) return a.length - b.length
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

function toPoint (ptr) {
  const p = new Array(ptr[1])
  for (let i = 0; i < p.length; i++) p[i] = points[ptr[0] + i]
  return p
}

function addShortCodes (data, shortCodes) {
  for (const emoji of data) {
    emoji.shortCodes = Array.isArray(shortCodes[emoji.hexcode])
      ? shortCodes[emoji.hexcode]
      : [shortCodes[emoji.hexcode]]
    if (emoji.skins) {
      addShortCodes(emoji.skins, shortCodes)
    }
  }
}

async function fetchJson (url) {
  const response = await fetch(url)
  return await response.json()
}

function toCodepoints (emoji) {
  const chars = [...emoji]
  const codes = new Array(chars.length)

  for (let i = 0; i < codes.length; i++) {
    codes[i] = chars[i].codePointAt(0)
  }

  return codes
}
