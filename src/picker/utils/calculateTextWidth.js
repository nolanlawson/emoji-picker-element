// get the width of the text inside of a DOM node, via https://stackoverflow.com/a/59525891/680742
export function calculateTextWidth (node) {
  const range = document.createRange()
  range.selectNode(node.firstChild)
  return range.getBoundingClientRect().width
}
