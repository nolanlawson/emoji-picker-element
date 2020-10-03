import { createFilter } from 'rollup-pluginutils'

export default () => {
  const filter = createFilter(/.*\.css$/)

  return {
    name: 'css-rollup-plugin',

    async transform (code, id) {
      if (!filter(id)) {
        return
      }
      let css = code.replace(/\.svelte-[a-zA-Z0-9]+/g, '') // remove style scoping (.svelte-foo)
      const sourceMapIndex = css.indexOf('\n/*# sourceMappingURL')
      css = css.substring(0, sourceMapIndex)
      const outputCode = `import { setCss } from '../../cssLoader'; setCss(${JSON.stringify(css)});`
      return outputCode
    }
  }
}
