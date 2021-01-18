export function checkZwjRendersAsOneGlyph (width, baselineWidth) {
  // On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
  // against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
  // floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
  // So here we set the threshold at 1.8 times the size of the baseline emoji.
  return width / 1.8 < baselineWidth
}
