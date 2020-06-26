import { readdir, writeFile, copyFile } from './fs.js'
import rimraf from 'rimraf'
import { promisify } from 'util'
import mkdirp from 'mkdirp'

const categories = [
  {
    name: 'People and activities',
    set: new Set([
      'assistant',
      'businessman',
      'businesswoman',
      'butting_in',
      'customer_support',
      'debt',
      'night_portrait',
      'online_support',
      'portrait_mode',
      'reading',
      'reading_ebook',
      'selfie',
      'sports_mode',
      'voice_presentation',
      'podium_with_speaker',
      'manager',
      'reuse'
    ])
  },
  {
    name: 'Technical and software',
    set: new Set([
      'add_column',
      'add_database',
      'add_image',
      'address_book',
      'add_row',
      'audio_file',
      'bookmark',
      'broken_link',
      'capacitor',
      'cell_phone',
      'charge_battery',
      'electrical_sensor',
      'electrical_threshold',
      'electro_devices',
      'electronics',
      'empty_battery',
      'empty_filter',
      'engineering',
      'export',
      'file',
      'flash_auto',
      'flash_off',
      'flash_on',
      'folder',
      'full_battery',
      'high_battery',
      'image_file',
      'opened_folder',
      'parallel_tasks',
      'portrait_mode',
      'print',
      'remove_image',
      'rotate_camera',
      'rotate_to_landscape',
      'rotate_to_portrait',
      'search',
      'circuit',
      'command_line',
      'crystal_oscillator',
      'data_backup',
      'database',
      'data_configuration',
      'data_encryption',
      'data_protection',
      'data_recovery',
      'data_sheet',
      'delete_column',
      'delete_database',
      'delete_row',
      'download',
      'integrated_webcam',
      'landscape',
      'lock_landscape',
      'lock_portrait',
      'multiple_cameras',
      'multiple_devices',
      'multiple_smartphones',
      'no_video',
      'serial_tasks',
      'share',
      'sim_card_chip',
      'sim_card"',
      'smartphone_tablet',
      'sms',
      'touchscreen_smartphone',
      'two_smartphones',
      'upload',
      'video_call',
      'video_file',
      'webcam'
    ])
  },
  {
    name: 'Arrows',
    set: new Set(['advance', 'down', 'down_left', 'down_right',
      'left', 'left_down', 'left_down2', 'left_up',
      'left_up2', 'right', 'right_down', 'right_down2',
      'right_up', 'right_up2', 'up', 'up_left', 'up_right'
    ])
  }
]

function getCategory (name) {
  for (const category of categories) {
    if (category.set.has(name)) {
      return category.name
    }
  }
}

function remove (name) {
  // I don't want to include any brand logos
  return [
    'dvd_logo', 'reddit', 'wikipedia', 'vlc', 'usb',
    'wi-fi_logo', 'steam', 'bbc', 'cd_logo',
    'dribbble', 'google', 'linux', 'stumbleupon',
    'android_os', 'entering_heaven_alive',
    'phone_android', 'debian', 'ipad', 'iphone',
    'kindle', 'nfc_sign', 'nook'
  ].includes(name)
}

async function main () {
  await promisify(rimraf)('./docs/custom')
  await mkdirp('./docs/custom')
  const emojis = await readdir('./node_modules/flat-color-icons/svg')

  const customEmojis = emojis
    .map(filename => {
      const name = filename.replace('.svg', '')
      const category = getCategory(name)
      const res = {
        name: name,
        shortcodes: [name],
        url: `./custom/${filename}`
      }
      if (category) {
        res.category = category
      }
      return res
    })
    .filter(({ name }) => !remove(name))

  await writeFile('./docs/custom.json', JSON.stringify(customEmojis), 'utf8')
  await Promise.all(customEmojis.map(async ({ name }) => {
    await copyFile(`./node_modules/flat-color-icons/svg/${name}.svg`, `./docs/custom/${name}.svg`)
  }))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
