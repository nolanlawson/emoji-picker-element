import { createFilter } from 'rollup-pluginutils'

export default () => {
  const filter = createFilter(/.*\.svelte$/)

  return {
    name: 'remove-encapsulated-styles-rollup-plugin',

    async transform (code, id) {
      if (!filter(id)) {
        return
      }

      const outputCode = code
        .replace(/\+ " svelte-[a-zA-Z0-9]+"/g, '')
        .replace(/ svelte-[a-zA-Z0-9]+/g, '')

      return {
        code: outputCode,
        map: { mappings: '' }
      }
    }
  }
}
