const preprocess = require('svelte-preprocess')

const preprocessConfig = preprocess()

const origMarkup = preprocessConfig.markup
// minify the HTML by removing extra whitespace
// TODO: this is fragile, but it also results in a lot of bundlesize savings. let's find a better solution
preprocessConfig.markup = async function () {
  const res = await origMarkup.apply(this, arguments)

  // remove whitespace
  res.code = res.code.replace(/([>}])\s+([<{])/sg, '$1$2')

  return res
}

module.exports = {
  preprocess: preprocessConfig
}