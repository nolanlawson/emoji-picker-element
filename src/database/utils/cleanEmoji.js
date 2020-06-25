// remove some internal implementation details, i.e. the "tokens" array on the emoji object
export function cleanEmoji (emoji) {
  if (!emoji) {
    return emoji
  }
  // Usually I would avoid delete for perf reasons (no polymorphism), and for code
  // cleanliness (pure function, don't mutate the input), but in this case
  // it's way less code than copying the object, and seems to cause fewer GCs.
  // Benchmarking in Chrome suggests it's faster to just delete (6x CPU slowdown, ~10ms
  // versus ~55ms for getEmojiByGroup() when clicking on "People and body").
  delete emoji.tokens
  return emoji
}
