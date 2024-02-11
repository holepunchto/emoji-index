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
