/* eslint-disable prefer-const,no-labels,no-inner-declarations */

import Database from '../../ImportedDatabase'
import enI18n from '../../i18n/en'
import { categories } from '../../categories'
import { DEFAULT_LOCALE, DEFAULT_DATA_SOURCE } from '../../../database/constants'
import { MIN_SEARCH_TEXT_LENGTH, NUM_SKIN_TONES } from '../../../shared/constants'
import { requestIdleCallback } from '../../utils/requestIdleCallback'
import { calculateTextWidth } from '../../utils/calculateTextWidth'
import { hasZwj } from '../../utils/hasZwj'
import { thunk } from '../../utils/thunk'
import { emojiSupportLevelPromise, supportedZwjEmojis } from '../../utils/emojiSupport'
import { log } from '../../../shared/log'
import { mark, stop } from '../../../shared/marks'
import { applySkinTone } from '../../utils/applySkinTone'
import { halt } from '../../utils/halt'
import { incrementOrDecrement } from '../../utils/incrementOrDecrement'
import { tick } from 'svelte'
import {
  DEFAULT_NUM_COLUMNS,
  DEFAULT_SKIN_TONE_EMOJI,
  MOST_COMMONLY_USED_EMOJI,
  TIMEOUT_BEFORE_LOADING_MESSAGE
} from '../../constants'
import { uniqBy } from '../../../shared/uniqBy'
import { mergeI18n } from '../../utils/mergeI18n'

let skinToneEmoji = DEFAULT_SKIN_TONE_EMOJI
let i18n = enI18n
let initialLoad = true
let database = null
let currentEmojis = []
let rawSearchText = ''
let searchText = ''
let rootElement
let baselineEmoji
let searchMode = false // eslint-disable-line no-unused-vars
let activeSearchItem = -1
let message // eslint-disable-line no-unused-vars
let currentCategoryIndex = 0
let currentCategory = categories[currentCategoryIndex]
let computedIndicatorWidth = 0
let indicatorStyle = '' // eslint-disable-line no-unused-vars
let skinTonePickerExpanded = false
let currentSkinTone = 0
let activeSkinTone = 0
let skinToneText // eslint-disable-line no-unused-vars
let style = '' // eslint-disable-line no-unused-vars
let skinToneButtonLabel = '' // eslint-disable-line no-unused-vars
let skinToneTextForSkinTone = ''
let skinTones = []
let currentFavorites = [] // eslint-disable-line no-unused-vars
let defaultFavoriteEmojisPromise
let numColumns = DEFAULT_NUM_COLUMNS
let scrollbarWidth = 0 // eslint-disable-line no-unused-vars
let shouldUpdateFavorites = {} // hack to force svelte to recalc favorites

const getBaselineEmojiWidth = thunk(() => calculateTextWidth(baselineEmoji))

emojiSupportLevelPromise.then(level => {
  if (!level) {
    message = i18n.emojiUnsupported
  }
})

$: {
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
  if (database) {
    /* no await */ handleDatabaseLoading()
  }
}

// TODO: this is a bizarre way to set these default properties, but currently Svelte
// renders custom elements in an odd way - props are not set when calling the constructor,
// but are only set later. This would cause a double render or a double-fetch of
// the dataSource, which is bad. Delaying with a microtask avoids this.
Promise.resolve().then(() => {
  if (!database) {
    database = new Database({ dataSource: DEFAULT_DATA_SOURCE, locale: DEFAULT_LOCALE })
  }
})

$: {
  if (i18n !== enI18n) {
    i18n = mergeI18n(enI18n, i18n) // if partial translations are provided, merge with English
  }
}

$: style = `
  --num-categories: ${categories.length}; 
  --indicator-opacity: ${searchMode ? 0 : 1}; 
  --num-skintones: ${NUM_SKIN_TONES};`

$: skinToneText = skinToneTextForSkinTone(currentSkinTone)
$: skinToneButtonLabel = i18n.skinToneLabel.replace('{skinTone}', i18n.skinTones[currentSkinTone])
$: skinToneTextForSkinTone = i => applySkinTone(skinToneEmoji, i)
$: skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => skinToneTextForSkinTone(i))

// TODO: Chrome has an unfortunate bug where we can't use a simple percent-based transform
// here, becuause it's janky. You can especially see this on a Nexus 5.
// So we calculate of the indicator and use exact pixel values in the animation instead
// (where ResizeObserver is supported).
const resizeObserverSupported = typeof ResizeObserver === 'function'
$: currentCategoryIndex = categories.findIndex(_ => _.group === currentCategory.group)
$: {
  /* istanbul ignore if */
  if (resizeObserverSupported) {
    indicatorStyle = `transform: translateX(${currentCategoryIndex * computedIndicatorWidth}px);` // exact pixels
  } else {
    indicatorStyle = `transform: translateX(${currentCategoryIndex * 100}%);`// fallback to percent-based
  }
}

$: {
  async function updatePreferredSkinTone () {
    if (database) {
      currentSkinTone = await database.getPreferredSkinTone()
    }
  }
  /* no await */ updatePreferredSkinTone()
}

$: {
  async function updateDefaultFavoriteEmojis () {
    if (database) {
      defaultFavoriteEmojisPromise = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map(unicode => (
        database.getEmojiByUnicode(unicode)
      )))).filter(Boolean) // filter because in Jest tests we don't have all the emoji in the DB
    }
  }
  /* no await */ updateDefaultFavoriteEmojis()
}

$: {
  async function getFavorites () {
    const dbFavorites = await database.getTopFavoriteEmoji(numColumns)
    const defaultFavorites = await defaultFavoriteEmojisPromise
    const favs = uniqBy([
      ...dbFavorites,
      ...defaultFavorites
    ], _ => _.unicode).slice(0, numColumns)
    return summarizeEmojis(favs)
  }

  async function updateFavorites () {
    currentFavorites = await getFavorites()
  }

  if (database && shouldUpdateFavorites) {
    /* no await */ updateFavorites()
  }
}

// eslint-disable-next-line no-unused-vars
function calculateIndicatorWidth (node) {
  return calculateWidth(node, width => {
    computedIndicatorWidth = width
  })
}

// eslint-disable-next-line no-unused-vars
function calculateEmojiGridWith (node) {
  return calculateWidth(node, width => {
    // Whenever the main emoji grid changes size, we need to
    // 1) Re-calculate the --num-columns var because it may have changed
    // 2) Re-calculate the scrollbar width because it may have changed (i.e. because the number of items changed)
    const propValue = getComputedStyle(rootElement).getPropertyValue('--num-columns')
    const newNumColumns = parseInt(propValue, 10) || DEFAULT_NUM_COLUMNS // in Jest we can't compute custom props
    const parentWidth = node.parentElement.getBoundingClientRect().width
    const newScrollbarWidth = parentWidth - width
    numColumns = newNumColumns
    scrollbarWidth = newScrollbarWidth
  })
}

function calculateWidth (node, onUpdate) {
  let resizeObserver
  /* istanbul ignore if */
  if (resizeObserverSupported) {
    resizeObserver = new ResizeObserver(entries => {
      onUpdate(entries[0].contentRect.width)
    })
    resizeObserver.observe(node)
  } else { // just set the width once, don't bother trying to track it
    requestAnimationFrame(() => {
      onUpdate(node.getBoundingClientRect().width)
    })
  }

  return {
    destroy () {
      /* istanbul ignore if */
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }
}

$: {
  async function updateEmojis () {
    if (!database) {
      searchMode = false
      currentEmojis = []
    } else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
      searchMode = true
      currentEmojis = await getEmojisBySearchQuery(searchText)
    } else {
      searchMode = false
      currentEmojis = await getEmojisByGroup(currentCategory.group)
    }
  }
  /* no await */ updateEmojis()
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
    const domNode = rootNode.querySelector(`[data-emoji=${JSON.stringify(emoji.unicode)}]`)
    if (!domNode) { // happens rarely, mostly in jest tests
      continue
    }
    const emojiWidth = calculateTextWidth(domNode)
    const baselineEmojiWidth = getBaselineEmojiWidth()
    // compare sizes rounded to 1/10 of a pixel to avoid issues with slightly different measurements (e.g. GNOME Web)
    const supported = emojiWidth.toFixed(1) === baselineEmojiWidth.toFixed(1)
    supportedZwjEmojis.set(emoji.unicode, supported)
    /* istanbul ignore if */
    if (!supported) {
      log('Filtered unsupported emoji', emoji.unicode)
    }
  }
  stop('checkZwjSupport')
  // force update
  currentEmojis = currentEmojis // eslint-disable-line no-self-assign
  if (initialLoad) {
    initialLoad = false
    // see https://github.com/andrewiggins/afterframe
    // we want to measure after style/layout are complete
    requestAnimationFrame(() => {
      setTimeout(() => {
        stop('initialLoad')
      })
    })
  }
}

function isZwjSupported (emoji) {
  return !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
}

async function filterEmojisByVersion (emojis) {
  const emojiSupportLevel = await emojiSupportLevelPromise
  return emojis.filter(({ version }) => version <= emojiSupportLevel)
}

async function summarizeEmojis (emojis) {
  const emojiSupportLevel = await emojiSupportLevelPromise
  // We don't need all the data on every emoji, so we can conserve memory by removing it
  // Also we can simplify the way we access the "skins" object
  const toSimpleSkinsMap = skins => {
    const res = {}
    for (const skin of skins) {
      // ignore arrays like [1, 2] with multiple skin tones
      // also ignore variants that are in an unsupported emoji version
      // (these do exist - variants from a different version than their base emoji)
      if (typeof skin.tone === 'number' && skin.version <= emojiSupportLevel) {
        res[skin.tone] = skin.unicode
      }
    }
    return res
  }
  return emojis.map(({ unicode, skins, shortcodes }) => ({
    unicode,
    skins: skins && toSimpleSkinsMap(skins),
    shortcodes
  }))
}

async function getEmojisByGroup (group) {
  return summarizeEmojis(await filterEmojisByVersion(await database.getEmojiByGroup(group)))
}

async function getEmojisBySearchQuery (query) {
  return summarizeEmojis(await filterEmojisByVersion(await database.getEmojiBySearchQuery(query)))
}

// eslint-disable-next-line no-unused-vars
function handleCategoryClick (category) {
  rawSearchText = ''
  searchText = ''
  activeSearchItem = -1
  currentCategory = category
}

// eslint-disable-next-line no-unused-vars
function onSearchKeydown (event) {
  if (!searchMode || !currentEmojis.length) {
    return
  }

  const goToNextOrPrevious = (previous) => {
    halt(event)
    activeSearchItem = incrementOrDecrement(previous, activeSearchItem, currentEmojis)
  }

  switch (event.key) {
    case 'ArrowDown':
      return goToNextOrPrevious(false)
    case 'ArrowUp':
      return goToNextOrPrevious(true)
    case 'Enter':
      if (activeSearchItem !== -1) {
        halt(event)
        return clickEmoji(currentEmojis[activeSearchItem].unicode)
      }
  }
}

// eslint-disable-next-line no-unused-vars
function onNavKeydown (event) {
  const { target, key } = event

  switch (key) {
    case 'ArrowLeft':
      halt(event)
      return target.previousSibling && target.previousSibling.focus()
    case 'ArrowRight':
      halt(event)
      return target.nextSibling && target.nextSibling.focus()
  }
}

function fireEvent (name, detail) {
  rootElement.dispatchEvent(new CustomEvent(name, {
    detail,
    bubbles: true,
    composed: true
  }))
}

async function clickEmoji (unicode) {
  const emoji = await database.getEmojiByUnicode(unicode)
  const emojiSummary = [...currentEmojis, ...currentFavorites].find(_ => _.unicode === unicode)
  const skinTonedUnicode = unicodeWithSkin(emojiSummary, currentSkinTone)
  await database.incrementFavoriteEmojiCount(unicode)
  shouldUpdateFavorites = shouldUpdateFavorites // eslint-disable-line no-self-assign
  fireEvent('emoji-click', {
    emoji,
    skinTone: currentSkinTone,
    unicode: skinTonedUnicode
  })
}

// eslint-disable-next-line no-unused-vars
async function onEmojiClick (event) {
  const { target } = event
  if (!target.classList.contains('emoji')) {
    return
  }
  halt(event)
  const unicode = target.dataset.emoji

  /* no await */ clickEmoji(unicode)
}

function focus (id) {
  rootElement.getRootNode().getElementById(id).focus()
}

// eslint-disable-next-line no-unused-vars
function onClickSkinToneOption (event) {
  const { target } = event
  if (!target.classList.contains('emoji')) {
    return
  }
  halt(event)
  const skinTone = parseInt(target.id.slice(9), 10) // remove 'skintone-' prefix
  currentSkinTone = skinTone
  skinTonePickerExpanded = false
  focus('skintone-button')
  fireEvent('skin-tone-change', { skinTone })
  /* no await */ database.setPreferredSkinTone(skinTone)
}

// eslint-disable-next-line no-unused-vars
async function onClickSkinToneButton (event) {
  skinTonePickerExpanded = !skinTonePickerExpanded
  activeSkinTone = currentSkinTone
  if (skinTonePickerExpanded) {
    halt(event)
    await tick()
    focus(`skintone-${activeSkinTone}`)
  }
}

// eslint-disable-next-line no-unused-vars
function onSkinToneOptionKeydown (event) {
  const { key } = event

  if (!skinTonePickerExpanded) {
    return
  }

  const goToNextOrPrevious = async previous => {
    halt(event)
    activeSkinTone = incrementOrDecrement(previous, activeSkinTone, skinTones)
    await tick()
    focus(`skintone-${activeSkinTone}`)
  }

  switch (key) {
    case 'ArrowUp':
      return goToNextOrPrevious(true)
    case 'ArrowDown':
      return goToNextOrPrevious(false)
  }
}

// eslint-disable-next-line no-unused-vars
async function onSkinToneOptionsBlur () {
  // On blur outside of the skintone options, collapse the skintone picker.
  // Except if focus is just moving to another skintone option, e.g. pressing up/down to change focus
  // I would use relatedTarget here, but iOS Safari seems to have a bug where it does not figure out
  // the relatedTarget correctly, so I delay with rAF instead
  await new Promise(resolve => requestAnimationFrame(resolve))
  const { activeElement } = rootElement.getRootNode()

  if (!activeElement || !activeElement.classList.contains('skintone-option')) {
    skinTonePickerExpanded = false
  }
}
// eslint-disable-next-line no-unused-vars
function emojiLabel (emoji) {
  return emoji.unicode + ', ' + emoji.shortcodes.join(', ')
}

// eslint-disable-next-line no-unused-vars
function emojiTitle (emoji) {
  return emoji.shortcodes.join(', ')
}

// eslint-disable-next-line no-unused-vars
function unicodeWithSkin (emoji, currentSkinTone) {
  if (currentSkinTone && emoji.skins && emoji.skins[currentSkinTone]) {
    return emoji.skins[currentSkinTone]
  }
  return emoji.unicode
}

export {
  database,
  i18n,
  skinToneEmoji
}
