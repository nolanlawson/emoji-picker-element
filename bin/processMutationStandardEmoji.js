// Read the emoji image files downloaded from https://mutant.tech/dl/2020.04/mtnt_2020.04_short_png128.zip
// and write out emoji.json to stdout as well as copying the files into ./docs/custom
import readdirRecursive from 'recursive-readdir'
import path from 'path'
import { copyFile } from './fs.js'
import mkdirp from 'mkdirp'

const filepath = '/tmp/mtnt_2020.04_short_png128/emoji'

// Omit some that would make this too large for a demo
const categories = {
  // 'activities_clothing': 'Activities and clothing',
  // 'extra': 'Extra',
  gsr: 'GSR',
  objects: 'Objects',
  // symbols: 'Symbols',
  // utils: 'Utils',
  // expressions: 'Expressions',
  food_drink_herbs: 'Food, drink, and herbs',
  nature_effects: 'Nature and effects'
  // people_animals: "People and animals",
  // travel_places: "Travel and places"
}

async function main () {
  await mkdirp('./docs/custom')
  const customEmojis = []
  for (const [category, categoryName] of Object.entries(categories)) {
    const files = await readdirRecursive(path.join(filepath, category))
    for (const file of files) {
      const basename = path.basename(file)
      const name = basename.replace('.png', '')
      customEmojis.push({
        name,
        shortcodes: [name],
        url: `/custom/${basename}`,
        category: categoryName
      })
      await copyFile(file, `./docs/custom/${basename}`)
    }
  }
  console.log(JSON.stringify(customEmojis))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
