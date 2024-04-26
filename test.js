const test = require('brittle')
const e = require('./')

test('shortcodes to emoji', function (t) {
  t.is(e.toEmoji('neutral'), '😐')
  t.is(e.toEmoji('+1'), '👍')
  t.is(e.toEmoji('-1'), '👎')
  t.is(e.toEmoji('wales'), '🏴󠁧󠁢󠁷󠁬󠁳󠁿')
  t.is(e.toEmoji('not-an-emoji'), '')
})

test('emoji to shortcodes', function (t) {
  t.is(e.toShortCode('😐'), 'neutral')
  t.is(e.toShortCode('👍'), '+1')
  t.is(e.toShortCode('👎'), '-1')
  t.is(e.toShortCode('🏴󠁧󠁢󠁷󠁬󠁳󠁿'), 'flag_gbwls')
  t.is(e.toShortCode('not-an-emoji'), '')
})

test('emojis over text', function (t) {
  t.is(e.toEmoji('heart'), '❤️')
  t.is(e.toShortCode('❤️'), 'heart')
})

test('custom shortcodes to emojis', function (t) {
  t.is(e.toEmoji('keet_laughs'), '😂')
  t.is(e.toEmoji('keet_party'), '🥳')
  t.is(e.toEmoji('keet_love'), '😍')
  t.is(e.toEmoji('keet_music'), '😌🎶')
  t.is(e.toEmoji('bitcoin'), 'bitcoin')
  t.is(e.toEmoji('tether'), 'tether')
  t.is(e.toEmoji('keet_pear'), '🍐')
  t.is(e.toEmoji('holepunch'), '🕳️🥊')

  t.is(e.toShortCode('😂'), 'joy')
  t.is(e.toShortCode('🥳'), 'hooray')
  t.is(e.toShortCode('😍'), 'heart_eyes')
  t.is(e.toShortCode('😌'), 'relieved')
  t.is(e.toShortCode('🎶'), 'musical_notes')
  t.is(e.toShortCode('bitcoin'), 'bitcoin')
  t.is(e.toShortCode('tether'), 'tether')
  t.is(e.toShortCode('🍐'), 'pear')
  t.is(e.toShortCode('🕳️'), 'hole')
  t.is(e.toShortCode('🥊'), 'boxing_glove')
})
