/* eslint-disable prefer-const,no-labels,no-inner-declarations */

import { groups as defaultGroups, customGroup } from '../../groups'
import { MIN_SEARCH_TEXT_LENGTH, NUM_SKIN_TONES } from '../../../shared/constants'
import { requestIdleCallback } from '../../utils/requestIdleCallback'
import { hasZwj } from '../../utils/hasZwj'
import { detectEmojiSupportLevel, supportedZwjEmojis } from '../../utils/emojiSupport'
import { applySkinTone } from '../../utils/applySkinTone'
import { halt } from '../../utils/halt'
import { incrementOrDecrement } from '../../utils/incrementOrDecrement'
import {
  DEFAULT_NUM_COLUMNS,
  FONT_FAMILY,
  MOST_COMMONLY_USED_EMOJI,
  TIMEOUT_BEFORE_LOADING_MESSAGE
} from '../../constants'
import { uniqBy } from '../../../shared/uniqBy'
import { summarizeEmojisForUI } from '../../utils/summarizeEmojisForUI'
import * as widthCalculator from '../../utils/widthCalculator'
import { checkZwjSupport } from '../../utils/checkZwjSupport'
import { requestPostAnimationFrame } from '../../utils/requestPostAnimationFrame'
import { tick } from 'svelte'
import { requestAnimationFrame } from '../../utils/requestAnimationFrame'
import { uniq } from '../../../shared/uniq'

// public
export let skinToneEmoji
export let i18n
export let database
export let customEmoji
export let customCategorySorting
export let emojiFontFamily
export let emojiVersion

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
let isRtl = false
let scrollbarWidth = 0 // eslint-disable-line no-unused-vars
let currentGroupIndex = 0
let groups = defaultGroups
let currentGroup
let databaseLoaded = false // eslint-disable-line no-unused-vars
let activeSearchItemId // eslint-disable-line no-unused-vars

//
// Utils/helpers
//

const focus = id => {
  rootElement.getRootNode().getElementById(id).focus()
}

// fire a custom event that crosses the shadow boundary
const fireEvent = (name, detail) => {
  rootElement.dispatchEvent(new CustomEvent(name, {
    detail,
    bubbles: true,
    composed: true
  }))
}

// eslint-disable-next-line no-unused-vars
const unicodeWithSkin = (emoji, currentSkinTone) => (
  (currentSkinTone && emoji.skins && emoji.skins[currentSkinTone]) || emoji.unicode
)

// eslint-disable-next-line no-unused-vars
const labelWithSkin = (emoji, currentSkinTone) => (
  uniq([(emoji.name || unicodeWithSkin(emoji, currentSkinTone)), ...(emoji.shortcodes || [])]).join(', ')
)

// Detect a skintone option button
const isSkinToneOption = element => /^skintone-/.test(element.id)

//
// Determine the emoji support level (in requestIdleCallback)
//

if (!emojiVersion) {
  detectEmojiSupportLevel().then(level => {
    // Can't actually test emoji support in Jest/JSDom, emoji never render in color in Cairo
    /* istanbul ignore next */
    if (!level) {
      message = i18n.emojiUnsupportedMessage
    }
  })
}

//
// Set or update the database object
//

$: {
  // show a Loading message if it takes a long time, or show an error if there's a network/IDB error
  async function handleDatabaseLoading () {
    let showingLoadingMessage = false
    const timeoutHandle = setTimeout(() => {
      showingLoadingMessage = true
      message = i18n.loadingMessage
    }, TIMEOUT_BEFORE_LOADING_MESSAGE)
    try {
      await database.ready()
      databaseLoaded = true // eslint-disable-line no-unused-vars
    } catch (err) {
      console.error(err)
      message = i18n.networkErrorMessage
    } finally {
      clearTimeout(timeoutHandle)
      if (showingLoadingMessage) { // Seems safer than checking the i18n string, which may change
        showingLoadingMessage = false
        message = '' // eslint-disable-line no-unused-vars
      }
    }
  }
  if (database) {
    /* no await */ handleDatabaseLoading()
  }
}

//
// Global styles for the entire picker
//

/* eslint-disable no-unused-vars */
$: pickerStyle = `
  --font-family: ${emojiFontFamily ? `${JSON.stringify(emojiFontFamily)},` : ''}${FONT_FAMILY};
  --num-groups: ${groups.length}; 
  --indicator-opacity: ${searchMode ? 0 : 1}; 
  --num-skintones: ${NUM_SKIN_TONES};`
/* eslint-enable no-unused-vars */

//
// Set or update the customEmoji
//

$: {
  if (customEmoji && database) {
    console.log('updating custom emoji')
    database.customEmoji = customEmoji
  }
}

$: {
  if (customEmoji && customEmoji.length) {
    groups = [customGroup, ...defaultGroups]
  } else if (groups !== defaultGroups) {
    if (currentGroupIndex) {
      // If the current group is anything other than "custom" (which is first), decrement.
      // This fixes the odd case where you set customEmoji, then pick a category, then unset customEmoji
      currentGroupIndex--
    }
    groups = defaultGroups
  }
}

//
// Set or update the preferred skin tone
//

$: {
  async function updatePreferredSkinTone () {
    if (databaseLoaded) {
      currentSkinTone = await database.getPreferredSkinTone()
    }
  }
  /* no await */ updatePreferredSkinTone()
}

$: skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => applySkinTone(skinToneEmoji, i))
/* eslint-disable no-unused-vars */
$: skinToneButtonText = skinTones[currentSkinTone]
$: skinToneButtonLabel = i18n.skinToneLabel.replace('{skinTone}', i18n.skinTones[currentSkinTone])
/* eslint-enable no-unused-vars */

//
// Set or update the favorites emojis
//

$: {
  async function updateDefaultFavoriteEmojis () {
    defaultFavoriteEmojis = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map(unicode => (
      database.getEmojiByUnicodeOrName(unicode)
    )))).filter(Boolean) // filter because in Jest tests we don't have all the emoji in the DB
  }
  if (databaseLoaded) {
    /* no await */ updateDefaultFavoriteEmojis()
  }
}

$: {
  async function updateFavorites () {
    console.log('updateFavorites')
    const dbFavorites = await database.getTopFavoriteEmoji(numColumns)
    const favorites = await summarizeEmojis(uniqBy([
      ...dbFavorites,
      ...defaultFavoriteEmojis
    ], _ => (_.unicode || _.name)).slice(0, numColumns))
    currentFavorites = favorites
  }

  if (databaseLoaded && defaultFavoriteEmojis) {
    /* no await */ updateFavorites()
  }
}

//
// Calculate the width of the emoji grid. This serves two purposes:
// 1) Re-calculate the --num-columns var because it may have changed
// 2) Re-calculate the scrollbar width because it may have changed
//   (i.e. because the number of items changed)
// 3) Re-calculate whether we're in RTL mode or not.
//
// The benefit of doing this in one place is to align with rAF/ResizeObserver
// and do all the calculations in one go. RTL vs LTR is not strictly width-related,
// but since we're already reading the style here, and since it's already aligned with
// the rAF loop, this is the most appropriate place to do it perf-wise.
//

// eslint-disable-next-line no-unused-vars
function calculateEmojiGridStyle (node) {
  return widthCalculator.calculateWidth(node, width => {
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') { // jsdom throws errors for this kind of fancy stuff
      // read all the style/layout calculations we need to make
      const style = getComputedStyle(rootElement)
      const newNumColumns = parseInt(style.getPropertyValue('--num-columns'), 10)
      const newIsRtl = style.getPropertyValue('direction') === 'rtl'
      const parentWidth = node.parentElement.getBoundingClientRect().width
      const newScrollbarWidth = parentWidth - width

      // write to Svelte variables
      numColumns = newNumColumns
      scrollbarWidth = newScrollbarWidth // eslint-disable-line no-unused-vars
      isRtl = newIsRtl // eslint-disable-line no-unused-vars
    }
  })
}

//
// Update the current group based on the currentGroupIndex
//

$: currentGroup = groups[currentGroupIndex]

//
// Set or update the currentEmojis. Check for invalid ZWJ renderings
// (i.e. double emoji).
//

$: {
  async function updateEmojis () {
    console.log('updateEmojis')
    if (!databaseLoaded) {
      currentEmojis = []
      searchMode = false
    } else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
      const currentSearchText = searchText
      const newEmojis = await getEmojisBySearchQuery(currentSearchText)
      if (currentSearchText === searchText) { // if the situation changes asynchronously, do not update
        currentEmojis = newEmojis
        searchMode = true
      }
    } else if (currentGroup) {
      const currentGroupId = currentGroup.id
      const newEmojis = await getEmojisByGroup(currentGroupId)
      if (currentGroupId === currentGroup.id) { // if the situation changes asynchronously, do not update
        currentEmojis = newEmojis
        searchMode = false
      }
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
  if (!emojiVersion && zwjEmojisToCheck.length) {
    // render now, check their length later
    requestAnimationFrame(() => checkZwjSupportAndUpdate(zwjEmojisToCheck))
  } else {
    currentEmojis = emojiVersion ? currentEmojis : currentEmojis.filter(isZwjSupported)
    requestAnimationFrame(() => {
      // Avoid Svelte doing an invalidation on the "setter" here.
      // At best the invalidation is useless, at worst it can cause infinite loops:
      // https://github.com/nolanlawson/emoji-picker-element/pull/180
      // https://github.com/sveltejs/svelte/issues/6521
      // Also note tabpanelElement can be null if the element is disconnected
      // immediately after connected, hence `|| {}`
      (tabpanelElement || {}).scrollTop = 0 // reset scroll top to 0 when emojis change
    })
  }
}

function checkZwjSupportAndUpdate (zwjEmojisToCheck) {
  const rootNode = rootElement.getRootNode()
  const emojiToDomNode = emoji => rootNode.getElementById(`emo-${emoji.id}`)
  checkZwjSupport(zwjEmojisToCheck, baselineEmoji, emojiToDomNode)
  // force update
  currentEmojis = currentEmojis // eslint-disable-line no-self-assign
}

function isZwjSupported (emoji) {
  return !emoji.unicode || !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
}

async function filterEmojisByVersion (emojis) {
  const emojiSupportLevel = emojiVersion || await detectEmojiSupportLevel()
  // !version corresponds to custom emoji
  return emojis.filter(({ version }) => !version || version <= emojiSupportLevel)
}

async function summarizeEmojis (emojis) {
  return summarizeEmojisForUI(emojis, emojiVersion || await detectEmojiSupportLevel())
}

async function getEmojisByGroup (group) {
  console.log('getEmojiByGroup', group)
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
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'production' || process.env.PERF) {
    if (currentEmojis.length && currentFavorites.length && initialLoad) {
      initialLoad = false
      requestPostAnimationFrame(() => performance.measure('initialLoad', 'initialLoad'))
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

  // eslint-disable-next-line no-unused-vars
  currentEmojisWithCategories = calculateCurrentEmojisWithCategories()
}

//
// Handle active search item (i.e. pressing up or down while searching)
//

/* eslint-disable no-unused-vars */
$: activeSearchItemId = activeSearchItem !== -1 && currentEmojis[activeSearchItem].id
/* eslint-enable no-unused-vars */

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
  if (!isSkinToneOption(target)) {
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
      skinTonePickerExpandedAfterAnimation = true // eslint-disable-line no-unused-vars
    }, { once: true })
  } else {
    skinTonePickerExpandedAfterAnimation = false // eslint-disable-line no-unused-vars
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
      skinTonePickerExpanded = false
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
  if (!relatedTarget || !isSkinToneOption(relatedTarget)) {
    skinTonePickerExpanded = false
  }
}
