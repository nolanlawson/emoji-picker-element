/* eslint-disable prefer-const,no-labels */

import Database from '../../../database/Database.js'
import i18n from '../../i18n/en.json'
import { categories } from '../../categories'
import { DEFAULT_LOCALE, DEFAULT_DATA_SOURCE } from '../../../database/constants'
import { MIN_SEARCH_TEXT_LENGTH } from '../../constants'
import { requestIdleCallback } from '../../utils/requestIdleCallback'
import { calculateTextWidth } from '../../utils/calculateTextWidth'
import { hasZwj } from '../../utils/hasZwj'
import { thunk } from '../../utils/thunk'
import { emojiSupportLevel, supportedZwjEmojis } from '../../utils/emojiSupport'

let database
let currentEmojis = []
let locale = DEFAULT_LOCALE
let dataSource = DEFAULT_DATA_SOURCE
let currentCategory = categories[0]
let rawSearchText = ''
let searchText = ''
let rootElement
let baselineEmoji
let searchMode = false // eslint-disable-line no-unused-vars
let activeSearchItem = -1

const getBaselineEmojiWidth = thunk(() => calculateTextWidth(baselineEmoji))
$: database = new Database({ dataSource, locale })
$: {
  // eslint-disable-next-line no-inner-declarations
  async function updateEmojis () {
    if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
      searchMode = true
      currentEmojis = await getEmojisBySearchPrefix(searchText)
    } else {
      searchMode = false
      currentEmojis = await getEmojisByGroup(currentCategory.group)
    }
  }
  updateEmojis()
}
$: {
  requestIdleCallback(() => {
    searchText = rawSearchText // defer to avoid input delays
    activeSearchItem = -1
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
  const rootNode = rootElement.getRootNode()
  for (const emoji of zwjEmojisToCheck) {
    const domNode = rootNode.getElementById(`emoji-${emoji.unicode}`)
    const emojiWidth = calculateTextWidth(domNode)
    const baselineEmojiWidth = getBaselineEmojiWidth()
    // compare sizes rounded to 1/10 of a pixel to avoid issues with slightly different measurements (e.g. GNOME Web)
    const supported = emojiWidth.toFixed(1) === baselineEmojiWidth.toFixed(1)
    supportedZwjEmojis.set(emoji.unicode, supported)
    if (!supported) {
      console.log('Filtered unsupported emoji', emoji.unicode)
    }
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
    rawSearchText = ''
    searchText = ''
    activeSearchItem = -1
    currentCategory = category
  })
}

// eslint-disable-next-line no-unused-vars
function onSearchKeydown (event) {
  if (!searchMode || !currentEmojis.length) {
    return
  }
  switch (event.key) {
    case 'ArrowDown':
      if (activeSearchItem === currentEmojis.length - 1) {
        activeSearchItem = 0
      } else {
        activeSearchItem++
      }
      event.preventDefault()
      event.stopPropagation()
      break
    case 'ArrowUp':
      event.preventDefault()
      event.stopPropagation()
      if (activeSearchItem <= 0) {
        activeSearchItem = currentEmojis.length - 1
      } else {
        activeSearchItem--
      }
      break
  }
}

export {
  locale,
  dataSource,
  i18n
}
