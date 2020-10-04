/* eslint-disable prefer-const,no-labels,no-inner-declarations */

import Emoji from '../Emoji/Emoji.svelte' // eslint-disable-line no-unused-vars
import Database from '../../ImportedDatabase'
import enI18n from '../../i18n/en'
import { groups as defaultGroups, customGroup } from '../../groups'
import { DEFAULT_LOCALE, DEFAULT_DATA_SOURCE } from '../../../database/constants'
import { MIN_SEARCH_TEXT_LENGTH, NUM_SKIN_TONES } from '../../../shared/constants'
import { requestIdleCallback } from '../../utils/requestIdleCallback'
import { hasZwj } from '../../utils/hasZwj'
import { emojiSupportLevelPromise, supportedZwjEmojis } from '../../utils/emojiSupport'
import { log } from '../../../shared/log'
import { applySkinTone } from '../../utils/applySkinTone'
import { halt } from '../../utils/halt'
import { incrementOrDecrement } from '../../utils/incrementOrDecrement'
import {
  DEFAULT_NUM_COLUMNS,
  DEFAULT_SKIN_TONE_EMOJI, DEFAULT_SORTING, FONT_FAMILY,
  MOST_COMMONLY_USED_EMOJI,
  TIMEOUT_BEFORE_LOADING_MESSAGE
} from '../../constants'
import { uniqBy } from '../../../shared/uniqBy'
import { summarizeEmojisForUI } from '../../utils/summarizeEmojisForUI'
import { calculateWidth, resizeObserverSupported } from '../../utils/calculateWidth'
import { checkZwjSupport } from '../../utils/checkZwjSupport'
import { requestPostAnimationFrame } from '../../utils/requestPostAnimationFrame'
import { stop } from '../../../shared/marks'
import { onDestroy, tick } from 'svelte'
import { requestAnimationFrame } from '../../utils/requestAnimationFrame'
import { unicodeWithSkin } from '../../utils/unicodeWithSkin'

// public
let locale = DEFAULT_LOCALE
let dataSource = DEFAULT_DATA_SOURCE
let skinToneEmoji = DEFAULT_SKIN_TONE_EMOJI
let i18n = enI18n
let database = null
let customEmoji = null
let customCategorySorting = DEFAULT_SORTING

// private
let initialLoad = true
let currentEmojis = []
let currentEmojisWithCategories = [] // eslint-disable-line no-unused-vars
let rawSearchText = ''
let searchText = ''
let rootElement
let baselineEmoji
let tabpanelElement
let searchMode = false // eslint-disable-line no-unused-vars
let activeSearchItem = -1
let message // eslint-disable-line no-unused-vars
let computedIndicatorWidth = 0
let indicatorStyle = '' // eslint-disable-line no-unused-vars
let skinTonePickerExpanded = false
let skinTonePickerExpandedAfterAnimation = false // eslint-disable-line no-unused-vars
let skinToneDropdown
let currentSkinTone = 0
let activeSkinTone = 0
let skinToneButtonText // eslint-disable-line no-unused-vars
let pickerStyle // eslint-disable-line no-unused-vars
let skinToneButtonLabel = '' // eslint-disable-line no-unused-vars
let skinTones = []
let currentFavorites = [] // eslint-disable-line no-unused-vars
let defaultFavoriteEmojis
let numColumns = DEFAULT_NUM_COLUMNS
let scrollbarWidth = 0 // eslint-disable-line no-unused-vars
let currentGroupIndex = 0
let groups = defaultGroups
let currentGroup
let loaded = false // eslint-disable-line no-unused-vars
let activeSearchItemId // eslint-disable-line no-unused-vars

//
// Utils/helpers
//

function focus (id) {
  rootElement.getRootNode().getElementById(id).focus()
}

// fire a custom event that crosses the shadow boundary
function fireEvent (name, detail) {
  rootElement.dispatchEvent(new CustomEvent(name, {
    detail,
    bubbles: true,
    composed: true
  }))
}

//
// Determine the emoji support level (in requestIdleCallback)
//

emojiSupportLevelPromise.then(level => {
  if (!level) {
    message = i18n.emojiUnsupportedMessage
  }
})

//
// Set or update the database object
//

$: {
  // show a Loading message if it takes a long time, or show an error if there's a network/IDB error
  async function handleDatabaseLoading () {
    const timeoutHandle = setTimeout(() => {
      message = i18n.loadingMessage
    }, TIMEOUT_BEFORE_LOADING_MESSAGE)
    try {
      await database.ready()
      loaded = true
    } catch (err) {
      console.error(err)
      message = i18n.networkErrorMessage
    } finally {
      clearTimeout(timeoutHandle)
      if (message === i18n.loadingMessage) {
        message = ''
      }
    }
  }
  if (database) {
    /* no await */ handleDatabaseLoading()
  }
}

$: {
  if (locale && dataSource && (!database || (database.locale !== locale && database.dataSource !== dataSource))) {
    log('creating database', { locale, dataSource })
    database = new Database({ dataSource, locale })
  }
}

onDestroy(async () => {
  if (database) {
    log('closing database')
    await database.close()
  }
})

//
// Global styles for the entire picker
//

$: pickerStyle = `
  --font-family: ${FONT_FAMILY};
  --num-groups: ${groups.length}; 
  --indicator-opacity: ${searchMode ? 0 : 1}; 
  --num-skintones: ${NUM_SKIN_TONES};`

//
// Set or update the customEmoji
//

$: {
  if (customEmoji && database) {
    log('updating custom emoji')
    database.customEmoji = customEmoji
  }
}

$: {
  if (customEmoji && customEmoji.length) {
    groups = [customGroup, ...defaultGroups]
  } else if (groups !== defaultGroups) {
    groups = defaultGroups
  }
}

//
// Set or update the preferred skin tone
//

$: {
  async function updatePreferredSkinTone () {
    if (database) {
      currentSkinTone = await database.getPreferredSkinTone()
    }
  }
  /* no await */ updatePreferredSkinTone()
}

$: skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => applySkinTone(skinToneEmoji, i))
$: skinToneButtonText = skinTones[currentSkinTone]
$: skinToneButtonLabel = i18n.skinToneLabel.replace('{skinTone}', i18n.skinTones[currentSkinTone])

//
// Set or update the favorites emojis
//

$: {
  async function updateDefaultFavoriteEmojis () {
    defaultFavoriteEmojis = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map(unicode => (
      database.getEmojiByUnicodeOrName(unicode)
    )))).filter(Boolean) // filter because in Jest tests we don't have all the emoji in the DB
  }
  if (database) {
    /* no await */ updateDefaultFavoriteEmojis()
  }
}

$: {
  async function updateFavorites () {
    log('updateFavorites')
    const dbFavorites = await database.getTopFavoriteEmoji(numColumns)
    const favorites = await summarizeEmojis(uniqBy([
      ...dbFavorites,
      ...defaultFavoriteEmojis
    ], _ => (_.unicode || _.name)).slice(0, numColumns))
    currentFavorites = favorites
  }

  if (database && defaultFavoriteEmojis) {
    /* no await */ updateFavorites()
  }
}

//
// Calculate the width of the emoji grid. This serves two purposes:
// 1) Re-calculate the --num-columns var because it may have changed
// 2) Re-calculate the scrollbar width because it may have changed
//   (i.e. because the number of items changed)
//

// eslint-disable-next-line no-unused-vars
function calculateEmojiGridWidth (node) {
  return calculateWidth(node, width => {
    const newNumColumns = process.env.NODE_ENV === 'test'
      ? DEFAULT_NUM_COLUMNS
      : parseInt(getComputedStyle(rootElement).getPropertyValue('--num-columns'), 10)
    const parentWidth = process.env.NODE_ENV === 'test' // jsdom throws an error here occasionally
      ? 1
      : node.parentElement.getBoundingClientRect().width
    const newScrollbarWidth = parentWidth - width
    numColumns = newNumColumns
    scrollbarWidth = newScrollbarWidth
  })
}

//
// Update the current group based on the currentGroupIndex
//

$: currentGroup = groups[currentGroupIndex]

//
// Animate the indicator
//

// eslint-disable-next-line no-unused-vars
function calculateIndicatorWidth (node) {
  return calculateWidth(node, width => {
    computedIndicatorWidth = width
  })
}

// TODO: Chrome has an unfortunate bug where we can't use a simple percent-based transform
// here, becuause it's janky. You can especially see this on a Nexus 5.
// So we calculate of the indicator and use exact pixel values in the animation instead
// (where ResizeObserver is supported).
$: {
  /* istanbul ignore if */
  if (resizeObserverSupported) {
    indicatorStyle = `transform: translateX(${currentGroupIndex * computedIndicatorWidth}px);` // exact pixels
  } else {
    indicatorStyle = `transform: translateX(${currentGroupIndex * 100}%);`// fallback to percent-based
  }
}

//
// Set or update the currentEmojis. Check for invalid ZWJ renderings
// (i.e. double emoji).
//

$: {
  async function updateEmojis () {
    log('updateEmojis')
    if (!database) {
      currentEmojis = []
      searchMode = false
    } else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
      currentEmojis = await getEmojisBySearchQuery(searchText)
      searchMode = true
    } else if (currentGroup) {
      currentEmojis = await getEmojisByGroup(currentGroup.id)
      searchMode = false
    }
  }
  /* no await */ updateEmojis()
}

// Some emojis have their ligatures rendered as two or more consecutive emojis
// We want to treat these the same as unsupported emojis, so we compare their
// widths against the baseline widths and remove them as necessary
$: {
  const zwjEmojisToCheck = currentEmojis
    .filter(emoji => emoji.unicode) // filter custom emoji
    .filter(emoji => hasZwj(emoji) && !supportedZwjEmojis.has(emoji.unicode))
  if (zwjEmojisToCheck.length) {
    // render now, check their length later
    requestAnimationFrame(() => checkZwjSupportAndUpdate(zwjEmojisToCheck))
  } else {
    currentEmojis = currentEmojis.filter(isZwjSupported)
    requestAnimationFrame(() => { // reset scroll top to 0 when emojis change
      if (process.env.NODE_ENV !== 'test') {
        tabpanelElement.scrollTop = 0
      }
    })
  }
}

function checkZwjSupportAndUpdate (zwjEmojisToCheck) {
  const rootNode = rootElement.getRootNode()
  // Jest doesn't seem to understand that shadowRoot.getElementById() is a thing
  const emojiToDomNode = process.env.NODE_ENV === 'test'
    ? emoji => rootNode.querySelector(`[id=${JSON.stringify('emo-' + emoji.id)}]`)
    : emoji => rootNode.getElementById(`emo-${emoji.id}`)
  checkZwjSupport(zwjEmojisToCheck, baselineEmoji, emojiToDomNode)
  // force update
  currentEmojis = currentEmojis // eslint-disable-line no-self-assign
}

function isZwjSupported (emoji) {
  return !emoji.unicode || !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
}

async function filterEmojisByVersion (emojis) {
  const emojiSupportLevel = await emojiSupportLevelPromise
  // !version corresponds to custom emoji
  return emojis.filter(({ version }) => !version || version <= emojiSupportLevel)
}

async function summarizeEmojis (emojis) {
  return summarizeEmojisForUI(emojis, await emojiSupportLevelPromise)
}

async function getEmojisByGroup (group) {
  log('getEmojiByGroup', group)
  if (typeof group === 'undefined') {
    return []
  }
  // -1 is custom emoji
  const emoji = group === -1 ? customEmoji : await database.getEmojiByGroup(group)
  return summarizeEmojis(await filterEmojisByVersion(emoji))
}

async function getEmojisBySearchQuery (query) {
  return summarizeEmojis(await filterEmojisByVersion(await database.getEmojiBySearchQuery(query)))
}

$: {
  // consider initialLoad to be complete when the first tabpanel and favorites are rendered
  if (process.env.NODE_ENV !== 'production' || process.env.PERF) {
    if (currentEmojis.length && currentFavorites.length && initialLoad) {
      initialLoad = false
      requestPostAnimationFrame(() => stop('initialLoad'))
    }
  }
}

//
// Derive currentEmojisWithCategories from currentEmojis. This is always done even if there
// are no categories, because it's just easier to code the HTML this way.
//

$: {
  function calculateCurrentEmojisWithCategories () {
    if (searchMode) {
      return [
        {
          category: '',
          emojis: currentEmojis
        }
      ]
    }
    const categoriesToEmoji = new Map()
    for (const emoji of currentEmojis) {
      const category = emoji.category || ''
      let emojis = categoriesToEmoji.get(category)
      if (!emojis) {
        emojis = []
        categoriesToEmoji.set(category, emojis)
      }
      emojis.push(emoji)
    }
    return [...categoriesToEmoji.entries()]
      .map(([category, emojis]) => ({ category, emojis }))
      .sort((a, b) => customCategorySorting(a.category, b.category))
  }

  currentEmojisWithCategories = calculateCurrentEmojisWithCategories()
}

//
// Handle active search item (i.e. pressing up or down while searching)
//

$: activeSearchItemId = activeSearchItem !== -1 && currentEmojis[activeSearchItem].id

//
// Handle user input on the search input
//

$: {
  requestIdleCallback(() => {
    searchText = (rawSearchText || '').trim() // defer to avoid input delays, plus we can trim here
    activeSearchItem = -1
  })
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
        return clickEmoji(currentEmojis[activeSearchItem].id)
      } else if (currentEmojis.length) {
        activeSearchItem = 0
      }
  }
}

//
// Handle user input on nav
//

// eslint-disable-next-line no-unused-vars
function onNavClick (group) {
  rawSearchText = ''
  searchText = ''
  activeSearchItem = -1
  currentGroupIndex = groups.findIndex(_ => _.id === group.id)
}

// eslint-disable-next-line no-unused-vars
function onNavKeydown (event) {
  const { target, key } = event

  const doFocus = el => {
    if (el) {
      halt(event)
      el.focus()
    }
  }

  switch (key) {
    case 'ArrowLeft':
      return doFocus(target.previousSibling)
    case 'ArrowRight':
      return doFocus(target.nextSibling)
    case 'Home':
      return doFocus(target.parentElement.firstChild)
    case 'End':
      return doFocus(target.parentElement.lastChild)
  }
}

//
// Handle user input on an emoji
//

async function clickEmoji (unicodeOrName) {
  const emoji = await database.getEmojiByUnicodeOrName(unicodeOrName)
  const emojiSummary = [...currentEmojis, ...currentFavorites]
    .find(_ => (_.id === unicodeOrName))
  const skinTonedUnicode = emojiSummary.unicode && unicodeWithSkin(emojiSummary, currentSkinTone)
  await database.incrementFavoriteEmojiCount(unicodeOrName)
  // eslint-disable-next-line no-self-assign
  defaultFavoriteEmojis = defaultFavoriteEmojis // force favorites to re-render
  fireEvent('emoji-click', {
    emoji,
    skinTone: currentSkinTone,
    ...(skinTonedUnicode && { unicode: skinTonedUnicode }),
    ...(emojiSummary.name && { name: emojiSummary.name })
  })
}

// eslint-disable-next-line no-unused-vars
async function onEmojiClick (event) {
  const { target } = event
  if (!target.classList.contains('emoji')) {
    return
  }
  halt(event)
  const id = target.id.substring(4) // replace 'emo-' or 'fav-' prefix

  /* no await */ clickEmoji(id)
}

//
// Handle user input on the skintone picker
//

// eslint-disable-next-line no-unused-vars
async function onSkinToneOptionsClick (event) {
  const { target } = event
  if (!target.classList.contains('skintone-option')) {
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
    requestAnimationFrame(() => focus(`skintone-${activeSkinTone}`))
  }
}

// To make the animation nicer, change the z-index of the skintone picker button
// *after* the animation has played. This makes it appear that the picker box
// is expanding "below" the button
$: {
  if (skinTonePickerExpanded) {
    skinToneDropdown.addEventListener('transitionend', () => {
      skinTonePickerExpandedAfterAnimation = true
    }, { once: true })
  } else {
    skinTonePickerExpandedAfterAnimation = false
  }
}

// eslint-disable-next-line no-unused-vars
function onSkinToneOptionsKeydown (event) {
  if (!skinTonePickerExpanded) {
    return
  }

  const changeActiveSkinTone = async nextSkinTone => {
    halt(event)
    activeSkinTone = nextSkinTone
    await tick()
    focus(`skintone-${activeSkinTone}`)
  }

  switch (event.key) {
    case 'ArrowUp':
      return changeActiveSkinTone(incrementOrDecrement(true, activeSkinTone, skinTones))
    case 'ArrowDown':
      return changeActiveSkinTone(incrementOrDecrement(false, activeSkinTone, skinTones))
    case 'Home':
      return changeActiveSkinTone(0)
    case 'End':
      return changeActiveSkinTone(skinTones.length - 1)
    case 'Enter':
      // enter on keydown, space on keyup. this is just how browsers work for buttons
      // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
      return onSkinToneOptionsClick(event)
    case 'Escape':
      halt(event)
      return focus('skintone-button')
  }
}

// eslint-disable-next-line no-unused-vars
function onSkinToneOptionsKeyup (event) {
  if (!skinTonePickerExpanded) {
    return
  }
  switch (event.key) {
    case ' ':
      // enter on keydown, space on keyup. this is just how browsers work for buttons
      // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
      return onSkinToneOptionsClick(event)
  }
}

// eslint-disable-next-line no-unused-vars
async function onSkinToneOptionsFocusOut (event) {
  // On blur outside of the skintone options, collapse the skintone picker.
  // Except if focus is just moving to another skintone option, e.g. pressing up/down to change focus
  const { relatedTarget } = event
  if (!relatedTarget || !relatedTarget.classList.contains('skintone-option')) {
    skinTonePickerExpanded = false
  }
}

export {
  locale,
  dataSource,
  database,
  i18n,
  skinToneEmoji,
  customEmoji,
  customCategorySorting
}
