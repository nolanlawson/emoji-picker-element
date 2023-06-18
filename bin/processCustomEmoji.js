import { readdir, writeFile, readFile, rimraf, mkdirp } from './fs.js'
import { optimize } from 'svgo'

const categories = [
  {
    name: 'People and activities',
    set: new Set([
      'assistant', 'businessman', 'businesswoman', 'butting_in', 'customer_support', 'debt',
      'night_portrait', 'online_support', 'portrait_mode', 'reading', 'reading_ebook', 'selfie',
      'sports_mode', 'voice_presentation', 'podium_with_speaker', 'manager', 'reuse'
    ])
  },
  {
    name: 'Technical and software',
    set: new Set([
      'add_column', 'add_database', 'address_book', 'add_row', 'audio_file',
      'bookmark', 'broken_link', 'capacitor', 'cell_phone', 'charge_battery', 'electrical_sensor',
      'electrical_threshold', 'electro_devices', 'electronics', 'empty_battery', 'empty_filter', 'engineering',
      'export', 'file', 'folder', 'full_battery',
      'high_battery', 'opened_folder', 'parallel_tasks', 'print',
      'search', 'circuit',
      'command_line', 'crystal_oscillator', 'data_backup', 'database', 'data_configuration', 'data_encryption',
      'data_protection', 'data_recovery', 'data_sheet', 'delete_column', 'delete_database', 'delete_row',
      'download', 'integrated_webcam', 'landscape', 'lock_landscape', 'lock_portrait',
      'multiple_devices', 'multiple_smartphones', 'serial_tasks', 'share', 'sim_card_chip',
      'sim_card"', 'smartphone_tablet', 'sms', 'touchscreen_smartphone', 'two_smartphones', 'upload',
      'video_call', 'accept_database', 'alphabetical_sorting_az', 'alphabetical_sorting_za',
      'clear_filters', 'cursor', 'edit_image', 'filter', 'full_trash', 'empty_trash',
      'generic_sorting_asc', 'generic_sorting_desc', 'low_battery',
      'mms', 'multiple_inputs', 'numerical_sorting_12', 'numerical_sorting_21', 'settings', 'tree_structure',
      'undo', 'redo', 'refresh', 'headset', 'filled_filter', 'genealogy', 'voicemail', 'speaker', 'link',
      'feed_in', 'missed_call', 'menu', 'middle_battery', 'phone', 'sim_card',
      'lock', 'unlock', 'privacy', 'comments'
    ])
  },
  {
    name: 'Film and Photography',
    set: new Set([
      'clapperboard', 'photo_reel', 'old_time_camera', 'film', 'film_reel',
      'video_projector', 'switch_camera',
      'camcorder', 'camcorder_pro', 'camera', 'camera_addon', 'camera_identification', 'compact_camera',
      'webcam', 'video_file', 'no_video',
      'multiple_cameras', 'rotate_camera', 'rotate_to_landscape', 'rotate_to_portrait',
      'portrait_mode', 'landscape_mode', 'flash_auto', 'flash_off', 'flash_on',
      'image_file', 'remove_image', 'add_image',
      'panorama', 'picture', 'slr_back_side',
      'stack_of_photos', 'gallery',
      'close_up_mode', 'frame'
    ])
  },
  {
    name: 'Arrows',
    set: new Set(['advance', 'down', 'down_left', 'down_right',
      'left', 'left_down', 'left_down2', 'left_up',
      'left_up2', 'right', 'right_down', 'right_down2',
      'right_up', 'right_up2', 'up', 'up_left', 'up_right'

    ])
  },
  {
    name: 'Business',
    set: new Set([
      'area_chart', 'bad_decision', 'bar_chart', 'bearish', 'bullish', 'briefcase',
      'business', 'business_contact', 'calculator', 'call_transfer', 'callback', 'collaboration',
      'combo_chart', 'conference_call', 'decision', 'department', 'deployment', 'disapprove',
      'disclaimer', 'document', 'doughnut_chart', 'end_call', 'external', 'factory',
      'factory_breakdown', 'faq', 'filing_cabinet', 'fine_print', 'flow_chart', 'good_decision',
      'grid', 'idea', 'import', 'in_transit', 'inspection', 'internal',
      'answers', 'line_chart', 'low_priority', 'make_decision', 'medium_priority', 'mind_map', 'negative_dynamic',
      'neutral_decision', 'neutral_trading', 'org_unit', 'organization', 'overtime', 'paid', 'pie_chart',
      'positive_dynamic', 'process', 'radar_plot', 'sales_performance', 'scatter_plot', 'self_service_kiosk',
      'services', 'support', 'statistics', 'survey', 'template', 'timeline', 'vip', 'workflow',
      'todo_list', 'expired', 'heat_map', 'donate', 'no_idea', 'feedback', 'safe',
      'shipped', 'contacts', 'list', 'package',
      'invite', 'money_transfer', 'view_details', 'questions', 'ratings'
    ])
  },
  {
    name: 'Symbols',
    set: new Set([
      'approval', 'approve', 'automatic', 'biohazard', 'cancel', 'checkmark',
      'collapse', 'expand', 'collect', 'copyleft', 'copyright', 'currency_exchange',
      'high_priority',
      'info', 'ok', 'plus',
      'registered_trademark', 'service_mark',
      'trademark', 'sound_recording_copyright',
      'rating', 'start', 'synchronize',
      'about', 'like', 'like_placeholder',
      'previous', 'next', 'dislike',
      'minus'

    ])
  },
  {
    name: 'Time',
    set: new Set([
      'alarm_clock',
      'clock',
      'calendar',
      'leave',
      'planner'

    ])
  },
  {
    name: 'Academic',
    set: new Set([
      'diploma_1',
      'diploma_2',
      'graduation_cap',
      'podium_with_audience',
      'podium_without_speaker',
      'ruler',
      'library',
      'biotech',
      'biomass',
      'rules'
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
    'kindle', 'nfc_sign', 'nook', 'advertising',
    'tablet_android', 'icons8_cup', 'cable_release'
  ].includes(name)
}

async function main () {
  await rimraf('./docs/custom')
  await mkdirp('./docs/custom')
  const emojis = await readdir('./node_modules/flat-color-icons/svg')

  const customEmojis = emojis
    .map(filename => {
      const name = filename.replace('.svg', '')
      const category = getCategory(name)
      const res = {
        name
      }
      if (category) {
        res.category = category
      }
      return res
    })
    .filter(({ name }) => !remove(name))

  // use a smaller JSON format to transfer over the wire
  const categoriesToCustomEmoji = {}
  for (const { name, category = '' } of customEmojis) {
    categoriesToCustomEmoji[category] = categoriesToCustomEmoji[category] || []
    categoriesToCustomEmoji[category].push(name)
  }

  await writeFile('./docs/custom.json', JSON.stringify(categoriesToCustomEmoji), 'utf8')
  await Promise.all(customEmojis.map(async ({ name }) => {
    const svg = await readFile(`./node_modules/flat-color-icons/svg/${name}.svg`, 'utf8')
    const optimized = await optimize(svg, { multipass: true })
    await writeFile(`./docs/custom/${name}.svg`, optimized.data, 'utf8')
  }))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
