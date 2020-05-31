/* global supportedZwjEmojis, emojiSupportLevel */
/* eslint-disable prefer-const,no-labels */

import i18n from '../../i18n/en.json'
import { categories } from '../../categories'
import { DEFAULT_LOCALE, DEFAULT_DATA_SOURCE } from '../../../database/constants'
import { Database } from '../../../database/Database'
import { MIN_SEARCH_TEXT_LENGTH, DEFAULT_NUM_COLUMNS } from '../../constants'
import { requestIdleCallback } from '../../utils/requestIdleCallback'
import { getTextWidth } from '../../utils/getTextWidth'
import { hasZwj } from '../../utils/hasZwj'

let database
let numColumns = DEFAULT_NUM_COLUMNS
let currentEmojis = []
let locale = DEFAULT_LOCALE
let dataSource = DEFAULT_DATA_SOURCE
let currentCategory = categories[0]
let rawSearchText = ''
let searchText = ''
let rootElement
let baselineEmojiWidth
let baselineEmoji
let darkMode = 'auto'
let resolvedDarkMode // eslint-disable-line no-unused-vars

$: resolvedDarkMode = darkMode === 'auto' ? matchMedia('(prefers-color-scheme: dark)').matches : !!darkMode

$: database = new Database({ dataSource, locale })
$: {
  (async () => {
    if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
      currentEmojis = await getEmojisBySearchPrefix(searchText)
    } else {
      currentEmojis = await getEmojisByGroup(currentCategory.group)
    }
  })()
}
$: {
  requestIdleCallback(() => {
    searchText = rawSearchText // defer to avoid input delays
  })
}

// Some emojis have their ligatures rendered as two or more consecutive emojis
// We want to treat these the same as unsupported emojis, so we compare their
// widths against the baseline widths and remove them as necessary
$: {
  const zwjEmojisToCheck = currentEmojis.filter(emoji => hasZwj(emoji) && !supportedZwjEmojis.has(emoji.unicode))
  if (zwjEmojisToCheck.length) {
    // render now, check their length later
    requestAnimationFrame(() => checkZwjSupport(zwjEmojisToCheck))
  } else {
    currentEmojis = currentEmojis.filter(isZwjSupported)
  }
}

function checkZwjSupport (zwjEmojisToCheck) {
  const root = rootElement.getRootNode()
  const domNodes = zwjEmojisToCheck.map(emoji => root.getElementById(`lep-emoji-${emoji.unicode}`))
  if (typeof baselineEmojiWidth === 'undefined') {
    baselineEmojiWidth = getTextWidth(baselineEmoji)
  }
  for (let i = 0; i < domNodes.length; i++) {
    const domNode = domNodes[i]
    const emoji = zwjEmojisToCheck[i]
    const emojiWidth = getTextWidth(domNode)
    const supported = emojiWidth === baselineEmojiWidth
    supportedZwjEmojis.set(emoji.unicode, supported)
  }
  // force update
  currentEmojis = currentEmojis // eslint-disable-line no-self-assign
}

function isZwjSupported (emoji) {
  return !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
}

function filterEmojisByVersion (emojis) {
  return emojis.filter(({ version }) => version <= emojiSupportLevel)
}

async function getEmojisByGroup (group) {
  return filterEmojisByVersion(await database.getEmojiByGroup(group))
}

async function getEmojisBySearchPrefix (prefix) {
  return filterEmojisByVersion(await database.getEmojiBySearchPrefix(prefix))
}

// eslint-disable-next-line no-unused-vars
function handleCategoryClick (category) {
  // throttle to avoid input delays
  requestIdleCallback(() => {
    currentCategory = category
  })
}

export {
  locale,
  dataSource,
  i18n,
  numColumns,
  darkMode
}
