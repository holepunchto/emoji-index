const b4a = require('b4a')
const { KEYS, POINTS, KEY_TO_POINTS, POINTS_TO_KEY } = require('./raw-index.js')

exports.toEmoji = function toEmoji (shortCode) {
  const shortCodeBuffer = b4a.from(shortCode)

  let start = 0
  let end = KEY_TO_POINTS.length / 3

  while (start < end) {
    const mid = (start + end) >>> 1
    const ptr = mid * 3

    const lengths = KEY_TO_POINTS[ptr]

    const keyLength = lengths & 255
    const keyOffset = KEY_TO_POINTS[ptr + 1]

    const keyBuffer = KEYS.subarray(keyOffset, keyOffset + keyLength)
    const cmp = b4a.compare(shortCodeBuffer, keyBuffer)

    if (cmp > 0) {
      start = mid + 1
      continue
    }

    if (cmp < 0) {
      end = mid === end ? end - 1 : mid
      continue
    }

    const codeOffset = KEY_TO_POINTS[ptr + 2]
    const codeLength = lengths >>> 8

    return String.fromCodePoint(...getCodePoint(codeOffset, codeLength))
  }

  return ''
}

exports.toShortCode = function toShortCode (emoji) {
  const codes = exports.toCodePoints(emoji)

  let start = 0
  let end = POINTS_TO_KEY.length

  while (start < end) {
    const mid = (start + end) >>> 1
    const ptr = POINTS_TO_KEY[mid] * 3

    const lengths = KEY_TO_POINTS[ptr]

    const codeOffset = KEY_TO_POINTS[ptr + 2]
    const codeLength = lengths >>> 8

    const otherCodes = getCodePoint(codeOffset, codeLength)
    const cmp = cmpCodePoints(codes, otherCodes)

    if (cmp > 0) {
      start = mid + 1
      continue
    }

    if (cmp < 0) {
      end = mid === end ? end - 1 : mid
      continue
    }

    const keyLength = lengths & 255
    const keyOffset = KEY_TO_POINTS[ptr + 1]

    const keyBuffer = KEYS.subarray(keyOffset, keyOffset + keyLength)
    return b4a.toString(keyBuffer)
  }

  return ''
}

exports.toCodePoints = function (emoji) {
  const chars = [...emoji]
  const codes = new Array(chars.length)

  for (let i = 0; i < codes.length; i++) {
    codes[i] = chars[i].codePointAt(0)
  }

  return codes
}

function getCodePoint (offset, length) {
  const codes = new Array(length)

  for (let i = 0; i < codes.length; i++) {
    codes[i] = POINTS[offset + i]
  }

  return codes
}

function cmpCodePoints (a, b) {
  if (a.length !== b.length) return a.length - b.length
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}
