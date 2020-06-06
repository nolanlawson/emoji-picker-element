/* eslint-disable prefer-const,no-labels,no-inner-declarations */

import Database from '../../../database/Database.js'
import i18n from '../../i18n/en.json'
import { categories } from '../../categories'
import { DEFAULT_LOCALE, DEFAULT_DATA_SOURCE } from '../../../database/constants'
import { MIN_SEARCH_TEXT_LENGTH } from '../../../shared/constants'
import { requestIdleCallback } from '../../utils/requestIdleCallback'
import { calculateTextWidth } from '../../utils/calculateTextWidth'
import { hasZwj } from '../../utils/hasZwj'
import { thunk } from '../../utils/thunk'
import { emojiSupportLevelPromise, supportedZwjEmojis } from '../../utils/emojiSupport'
import { log } from '../../../shared/log'
import { mark, stop } from '../../../shared/marks'

const TIMEOUT_BEFORE_LOADING_MESSAGE = 1000 // 1 second

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
let message // eslint-disable-line no-unused-vars

const getBaselineEmojiWidth = thunk(() => calculateTextWidth(baselineEmoji))

emojiSupportLevelPromise.then(level => {
  if (!level) {
    message = i18n.emojiUnsupported
  }
})

$: {
  // should be the first thing we do, to kick off loading IDB
  database = new Database({ dataSource, locale })

  // show a Loading message if it takes a long time, or show an error if there's a network/IDB error
  async function handleDatabaseLoading () {
    const timeoutHandle = setTimeout(() => {
      message = i18n.loading
    }, TIMEOUT_BEFORE_LOADING_MESSAGE)
    try {
      await database.ready()
    } catch (err) {
      console.error(err)
      message = i18n.networkError
    } finally {
      clearTimeout(timeoutHandle)
      if (message === i18n.loading) {
        message = ''
      }
    }
  }
  /* no await */ handleDatabaseLoading()
}

$: {
  async function updateEmojis () {
    if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
      searchMode = true
      currentEmojis = await getEmojisBySearchQuery(searchText)
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
  mark('checkZwjSupport')
  const rootNode = rootElement.getRootNode()
  for (const emoji of zwjEmojisToCheck) {
    const domNode = rootNode.getElementById(`emoji-${emoji.unicode}`)
    const emojiWidth = calculateTextWidth(domNode)
    const baselineEmojiWidth = getBaselineEmojiWidth()
    // compare sizes rounded to 1/10 of a pixel to avoid issues with slightly different measurements (e.g. GNOME Web)
    const supported = emojiWidth.toFixed(1) === baselineEmojiWidth.toFixed(1)
    supportedZwjEmojis.set(emoji.unicode, supported)
    if (!supported) {
      log('Filtered unsupported emoji', emoji.unicode)
    }
  }
  stop('checkZwjSupport')
  // force update
  currentEmojis = currentEmojis // eslint-disable-line no-self-assign
}

function isZwjSupported (emoji) {
  return !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
}

async function filterEmojisByVersion (emojis) {
  const emojiSupportLevel = await emojiSupportLevelPromise
  return emojis.filter(({ version }) => version <= emojiSupportLevel)
}

async function getEmojisByGroup (group) {
  return filterEmojisByVersion(await database.getEmojiByGroup(group))
}

async function getEmojisBySearchQuery (query) {
  return filterEmojisByVersion(await database.getEmojiBySearchQuery(query))
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

  const goToNextOrPrevious = (previous) => {
    event.preventDefault()
    event.stopPropagation()
    activeSearchItem += (previous ? -1 : 1)
    if (activeSearchItem < 0) {
      activeSearchItem = currentEmojis.length - 1
    } else if (activeSearchItem >= currentEmojis.length) {
      activeSearchItem = 0
    }
  }

  switch (event.key) {
    case 'ArrowDown':
      return goToNextOrPrevious(false)
    case 'ArrowUp':
      return goToNextOrPrevious(true)
  }
}

// eslint-disable-next-line no-unused-vars
function onNavKeydown (event) {
  const { target, key } = event

  switch (key) {
    case 'ArrowLeft':
      return target.previousSibling && target.previousSibling.focus()
    case 'ArrowRight':
      return target.nextSibling && target.nextSibling.focus()
  }
}

export {
  locale,
  dataSource,
  i18n
}
