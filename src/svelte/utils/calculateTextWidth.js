// get the width of the text inside of a DOM node, via https://stackoverflow.com/a/59525891/680742
let range
export function calculateTextWidth (node) {
  range = range || document.createRange()
  range.selectNode(node.firstChild)
  return range.getBoundingClientRect().width
}
