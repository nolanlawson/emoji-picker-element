// Removes some stuff from Svelte that we're not using. This is only removed from picker.js, not svelte.js,
// since in svelte.js, these dependencies are shared anyway.
import MagicString from 'magic-string'

// Relying on the fact that methods in these Svelte classes are always indented by 8 spaces, or a tab.
// This is fragile, but we can always remove it and just ship some extra JS.
const INDENT = '([ ]{8}|\t)'
function removeClassMethods (code, methods) {
  const methodRegex = name => new RegExp(`\n${INDENT}${name}\\(.*?(\n${INDENT})}`, 's')

  let magicString = new MagicString(code)

  for (const method of methods) {
    const match = code.match(methodRegex(method))
    const start = match.index + 1
    const end = start + match[0].length
    magicString = magicString.remove(start, end)
  }
  return magicString
}

const SVELTE_INTERNAL_ID = '/node_modules/svelte/internal/index.mjs'
const PICKER_ID = '/src/picker/components/Picker/Picker.svelte'

export default () => ({
  name: 'trim-svelte-plugin',
  transform (code, id) {
    if (!id.endsWith(SVELTE_INTERNAL_ID) && !id.endsWith(PICKER_ID)) {
      return null
    }

    const methods = id.endsWith(SVELTE_INTERNAL_ID)
      ? ['disconnectedCallback', '\\$destroy', '\\$on']
      : ['static get observedAttributes']

    const magicString = removeClassMethods(code, methods)
    return {
      code: magicString.toString(),
      map: magicString.generateMap({ hires: true })
    }
  }
})
