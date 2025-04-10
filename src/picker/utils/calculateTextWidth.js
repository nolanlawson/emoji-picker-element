// get the width of the text inside of a DOM node, via https://stackoverflow.com/a/59525891/680742
export function calculateTextWidth (node) {
  // skip running this in jest/vitest because we don't need to check for emoji support in that environment
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    return 1
  } else {
    const range = document.createRange()
    range.selectNode(node.firstChild)
    return range.getBoundingClientRect().width
  }
}
