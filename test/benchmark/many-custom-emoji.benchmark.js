import { Picker } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { waitForElementWithId, postRaf, dataSource } from './utils.js'
import { BIRD_NAMES } from './birds.js'

const CUSTOM_EMOJI_IMAGES = ['about', 'accept_database', 'add_column', 'add_database', 'add_image', 'add_row', 'address_book', 'advance', 'alarm_clock', 'alphabetical_sorting_az', 'alphabetical_sorting_za', 'answers', 'approval', 'approve', 'area_chart', 'assistant', 'audio_file', 'automatic', 'automotive', 'bad_decision', 'bar_chart', 'bearish', 'binoculars', 'biohazard', 'biomass', 'biotech', 'bookmark', 'briefcase', 'broken_link', 'bullish', 'business', 'business_contact', 'businessman', 'businesswoman', 'butting_in', 'calculator', 'calendar', 'call_transfer', 'callback', 'camcorder', 'camcorder_pro', 'camera', 'camera_addon', 'camera_identification', 'cancel', 'candle_sticks', 'capacitor', 'cell_phone', 'charge_battery', 'checkmark', 'circuit', 'clapperboard', 'clear_filters', 'clock', 'close_up_mode', 'cloth', 'collaboration', 'collapse', 'collect', 'combo_chart', 'command_line', 'comments', 'compact_camera', 'conference_call', 'contacts', 'copyleft', 'copyright', 'crystal_oscillator', 'currency_exchange', 'cursor', 'customer_support', 'dam', 'data_backup', 'data_configuration', 'data_encryption', 'data_protection', 'data_recovery', 'data_sheet', 'database', 'debt', 'decision', 'delete_column', 'delete_database', 'delete_row', 'department', 'deployment', 'diploma_1', 'diploma_2', 'disapprove', 'disclaimer', 'dislike', 'display', 'do_not_inhale', 'do_not_insert', 'do_not_mix', 'document', 'donate', 'doughnut_chart', 'down', 'down_left', 'down_right', 'download', 'edit_image', 'electrical_sensor', 'electrical_threshold', 'electricity', 'electro_devices', 'electronics', 'empty_battery', 'empty_filter', 'empty_trash', 'end_call', 'engineering', 'expand', 'expired', 'export', 'external', 'factory', 'factory_breakdown', 'faq', 'feed_in', 'feedback', 'file', 'filing_cabinet', 'filled_filter', 'film', 'film_reel', 'fine_print', 'flash_auto', 'flash_off', 'flash_on', 'flow_chart', 'folder', 'frame', 'full_battery', 'full_trash', 'gallery', 'genealogy', 'generic_sorting_asc', 'generic_sorting_desc', 'globe', 'good_decision', 'graduation_cap', 'grid', 'headset', 'heat_map', 'high_battery', 'high_priority', 'home', 'idea', 'image_file', 'import', 'in_transit', 'info', 'inspection', 'integrated_webcam', 'internal', 'invite', 'key', 'landscape', 'leave', 'left', 'left_down', 'left_down2', 'left_up', 'left_up2', 'library', 'light_at_the_end_of_tunnel', 'like', 'like_placeholder', 'line_chart', 'link', 'list', 'lock', 'lock_landscape', 'lock_portrait', 'low_battery', 'low_priority', 'make_decision', 'manager', 'medium_priority', 'menu', 'middle_battery', 'mind_map', 'minus', 'missed_call', 'mms', 'money_transfer', 'multiple_cameras', 'multiple_devices', 'multiple_inputs', 'multiple_smartphones', 'music', 'negative_dynamic', 'neutral_decision', 'neutral_trading', 'news', 'next', 'night_landscape', 'night_portrait', 'no_idea', 'no_video', 'numerical_sorting_12', 'numerical_sorting_21', 'ok', 'old_time_camera', 'online_support', 'opened_folder', 'org_unit', 'organization', 'overtime', 'package', 'paid', 'panorama', 'parallel_tasks', 'phone', 'photo_reel', 'picture', 'pie_chart', 'planner', 'plus', 'podium_with_audience', 'podium_with_speaker', 'podium_without_speaker', 'portrait_mode', 'positive_dynamic', 'previous', 'print', 'privacy', 'process', 'puzzle', 'questions', 'radar_plot', 'rating', 'ratings', 'reading', 'reading_ebook', 'redo', 'refresh', 'registered_trademark', 'remove_image', 'reuse', 'right', 'right_down', 'right_down2', 'right_up', 'right_up2', 'rotate_camera', 'rotate_to_landscape', 'rotate_to_portrait', 'ruler', 'rules', 'safe', 'sales_performance', 'scatter_plot', 'search', 'self_service_kiosk', 'selfie', 'serial_tasks', 'service_mark', 'services', 'settings', 'share', 'shipped', 'shop', 'signature', 'sim_card', 'sim_card_chip', 'slr_back_side', 'smartphone_tablet', 'sms', 'sound_recording_copyright', 'speaker', 'sports_mode', 'stack_of_photos', 'start', 'statistics', 'support', 'survey', 'switch_camera', 'synchronize', 'template', 'timeline', 'todo_list', 'touchscreen_smartphone', 'trademark', 'tree_structure', 'two_smartphones', 'undo', 'unlock', 'up', 'up_left', 'up_right', 'upload', 'video_call', 'video_file', 'video_projector', 'view_details', 'vip', 'voice_presentation', 'voicemail', 'webcam', 'workflow']

const NUM_CATEGORIES = 100
const NUM_EMOJI_PER_CATEGORY = 20

const buildCustomEmoji = () => {
  return Array.from({ length: NUM_CATEGORIES }, (_, i) => {
    return Array.from({ length: NUM_EMOJI_PER_CATEGORY }, (_, j) => {
      const image = CUSTOM_EMOJI_IMAGES[(i + j) % CUSTOM_EMOJI_IMAGES.length]
      return {
        category: `category-${i}`,
        shortcodes: [
          `category-${i}-emoji-${j}`,
          image,
          BIRD_NAMES[(i + j) % BIRD_NAMES.length],
          BIRD_NAMES[BIRD_NAMES.length - ((i + j) % BIRD_NAMES.length)]
        ],
        name: `category-${i}-emoji-${j}`,
        url: `/docs/custom/${image}.svg`
      }
    })
  }).flat()
}

const customEmoji = buildCustomEmoji()

// preload the images to avoid measuring network time
await Promise.all(CUSTOM_EMOJI_IMAGES.map(_ => fetch(`/docs/custom/${_}.svg`)))

performance.mark('benchmark-start')

const picker = new Picker({
  dataSource,
  customEmoji
})
document.body.appendChild(picker)

await waitForElementWithId(picker.shadowRoot, 'emo-category-0-emoji-0')
await postRaf()

performance.measure('benchmark-total', 'benchmark-start')
