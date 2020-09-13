import * as testingLibrary from '@testing-library/dom'

export async function getAccessibleName (container, node) {
  let label = node.getAttribute('aria-label')
  if (!label) {
    const labeledBy = node.getAttribute('aria-labelledby')
    if (labeledBy) {
      label = testingLibrary.getNodeText(await container.getRootNode().getElementById(labeledBy))
    }
  }
  return label
}
