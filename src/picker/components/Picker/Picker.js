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
  MOST_COMMONLY_USED_EMOJI,
  TIMEOUT_BEFORE_LOADING_MESSAGE
} from '../../constants'
import { uniqBy } from '../../../shared/uniqBy'
import { summarizeEmojisForUI } from '../../utils/summarizeEmojisForUI'
import * as widthCalculator from '../../utils/widthCalculator'
import { checkZwjSupport } from '../../utils/checkZwjSupport'
import { requestPostAnimationFrame } from '../../utils/requestPostAnimationFrame'
import { requestAnimationFrame } from '../../utils/requestAnimationFrame'
import { uniq } from '../../../shared/uniq'
import { resetScrollTopIfPossible } from '../../utils/resetScrollTopIfPossible.js'
import { createRootDom } from './PickerTemplate.js'
import { createState } from './reactivity.js'

// constants
const EMPTY_ARRAY = []

const { assign } = Object

export function createRoot (target, props) {
  const { state, createEffect } = createState()
  const destroyCallbacks = []

  // initial state
  assign(state, {
    skinToneEmoji: undefined,
    i18n: undefined,
    database: undefined,
    customEmoji: undefined,
    customCategorySorting: undefined,
    emojiVersion: undefined
  })

  // public props
  assign(state, props)

  // private props
  assign(state, {
    initialLoad: true,
    currentEmojis: [],
    currentEmojisWithCategories: [],
    rawSearchText: '',
    searchText: '',
    searchMode: false,
    activeSearchItem: -1,
    message: undefined,
    skinTonePickerExpanded: false,
    skinTonePickerExpandedAfterAnimation: false,
    currentSkinTone: 0,
    activeSkinTone: 0,
    skinToneButtonText: undefined,
    pickerStyle: undefined,
    skinToneButtonLabel: '',
    skinTones: [],
    currentFavorites: [],
    defaultFavoriteEmojis: undefined,
    numColumns: DEFAULT_NUM_COLUMNS,
    isRtl: false,
    scrollbarWidth: 0,
    currentGroupIndex: 0,
    groups: defaultGroups,
    databaseLoaded: false,
    activeSearchItemId: undefined
  })

  //
  // Update the current group based on the currentGroupIndex
  //
  createEffect(() => {
    state.currentGroup = state.groups[state.currentGroupIndex]
  })

  //
  // Utils/helpers
  //

  const focus = id => {
    refs.rootElement.getRootNode().getElementById(id).focus()
  }

  // fire a custom event that crosses the shadow boundary
  const fireEvent = (name, detail) => {
    refs.rootElement.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }))
  }

  // Helpers

  const unicodeWithSkin = (emoji, currentSkinTone) => (
    (currentSkinTone && emoji.skins && emoji.skins[currentSkinTone]) || emoji.unicode
  )

  const labelWithSkin = (emoji, currentSkinTone) => (
    uniq([
      (emoji.name || unicodeWithSkin(emoji, currentSkinTone)),
      emoji.annotation,
      ...(emoji.shortcodes || EMPTY_ARRAY)
    ].filter(Boolean)).join(', ')
  )

  const titleForEmoji = (emoji) => (
    emoji.annotation || (emoji.shortcodes || EMPTY_ARRAY).join(', ')
  )

  const helpers = {
    labelWithSkin, titleForEmoji, unicodeWithSkin
  }
  const events = {
    onClickSkinToneButton,
    onEmojiClick,
    onNavClick,
    onNavKeydown,
    onSearchKeydown,
    onSkinToneOptionsClick,
    onSkinToneOptionsFocusOut,
    onSkinToneOptionsKeydown,
    onSkinToneOptionsKeyup,
    onSearchInput
  }

  let renderedRootNode
  let refs
  let firstRender = true
  createEffect(() => {
    const {
      refs: theRefs,
      rootNode
    } = createRootDom(state, helpers, events)
    renderedRootNode = rootNode
    refs = theRefs
    if (firstRender) {
      firstRender = false
      target.appendChild(rootNode)

      // on first render, set up the ResizeObserver
      const calculator = calculateEmojiGridStyle(refs.emojiGrid)
      destroyCallbacks.push(calculator.destroy)
    }
  })

  //
  // Determine the emoji support level (in requestIdleCallback)
  //

  // mount logic
  if (!state.emojiVersion) {
    detectEmojiSupportLevel().then(level => {
      // Can't actually test emoji support in Jest/JSDom, emoji never render in color in Cairo
      /* istanbul ignore next */
      if (!level) {
        state.message = state.i18n.emojiUnsupportedMessage
      }
    })
  }

  //
  // Set or update the database object
  //

  createEffect(() => {
    // show a Loading message if it takes a long time, or show an error if there's a network/IDB error
    async function handleDatabaseLoading () {
      let showingLoadingMessage = false
      const timeoutHandle = setTimeout(() => {
        showingLoadingMessage = true
        state.message = state.i18n.loadingMessage
      }, TIMEOUT_BEFORE_LOADING_MESSAGE)
      try {
        await state.database.ready()
        state.databaseLoaded = true // eslint-disable-line no-unused-vars
      } catch (err) {
        console.error(err)
        state.message = state.i18n.networkErrorMessage
      } finally {
        clearTimeout(timeoutHandle)
        if (showingLoadingMessage) { // Seems safer than checking the i18n string, which may change
          showingLoadingMessage = false
          state.message = '' // eslint-disable-line no-unused-vars
        }
      }
    }

    if (state.database) {
      /* no await */
      handleDatabaseLoading()
    }
  })

  //
  // Global styles for the entire picker
  //

  createEffect(() => {
    state.pickerStyle = `
      --num-groups: ${state.groups.length}; 
      --indicator-opacity: ${state.searchMode ? 0 : 1}; 
      --num-skintones: ${NUM_SKIN_TONES};`
  })

  //
  // Set or update the customEmoji
  //

  createEffect(() => {
    if (state.customEmoji && state.database) {
      console.log('updating custom emoji')
      state.database.customEmoji = state.customEmoji
    }
  })

  createEffect(() => {
    if (state.customEmoji && state.customEmoji.length) {
      state.groups = [customGroup, ...defaultGroups]
    } else if (state.groups !== defaultGroups) {
      if (state.currentGroupIndex) {
        // If the current group is anything other than "custom" (which is first), decrement.
        // This fixes the odd case where you set customEmoji, then pick a category, then unset customEmoji
        state.currentGroupIndex--
      }
      state.groups = defaultGroups
    }
  })

  //
  // Set or update the preferred skin tone
  //

  createEffect(() => {
    async function updatePreferredSkinTone () {
      if (state.databaseLoaded) {
        state.currentSkinTone = await state.database.getPreferredSkinTone()
      }
    }

    /* no await */ updatePreferredSkinTone()
  })

  createEffect(() => {
    state.skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => applySkinTone(state.skinToneEmoji, i))
  })

  createEffect(() => {
    state.skinToneButtonText = state.skinTones[state.currentSkinTone]
  })

  createEffect(() => {
    state.skinToneButtonLabel = state.i18n.skinToneLabel.replace('{skinTone}', state.i18n.skinTones[state.currentSkinTone])
  })

  //
  // Set or update the favorites emojis
  //

  createEffect(() => {
    async function updateDefaultFavoriteEmojis () {
      const { database } = state
      const favs = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map(unicode => (
        database.getEmojiByUnicodeOrName(unicode)
      )))).filter(Boolean) // filter because in Jest tests we don't have all the emoji in the DB
      state.defaultFavoriteEmojis = favs
    }

    if (state.databaseLoaded) {
      /* no await */ updateDefaultFavoriteEmojis()
    }
  })

  createEffect(() => {
    async function updateFavorites () {
      console.log('updateFavorites')
      const { database, defaultFavoriteEmojis, numColumns } = state
      const dbFavorites = await database.getTopFavoriteEmoji(numColumns)
      const favorites = await summarizeEmojis(uniqBy([
        ...dbFavorites,
        ...defaultFavoriteEmojis
      ], _ => (_.unicode || _.name)).slice(0, numColumns))
      state.currentFavorites = favorites
    }

    if (state.databaseLoaded && state.defaultFavoriteEmojis) {
      /* no await */ updateFavorites()
    }
  })

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

  function calculateEmojiGridStyle (node) {
    return widthCalculator.calculateWidth(node, width => {
      /* istanbul ignore next */
      if (process.env.NODE_ENV !== 'test') { // jsdom throws errors for this kind of fancy stuff
        // read all the style/layout calculations we need to make
        const style = getComputedStyle(refs.rootElement)
        const newNumColumns = parseInt(style.getPropertyValue('--num-columns'), 10)
        const newIsRtl = style.getPropertyValue('direction') === 'rtl'
        const parentWidth = node.parentElement.getBoundingClientRect().width
        const newScrollbarWidth = parentWidth - width

        // write to state variables
        state.numColumns = newNumColumns
        state.scrollbarWidth = newScrollbarWidth // eslint-disable-line no-unused-vars
        state.isRtl = newIsRtl // eslint-disable-line no-unused-vars
      }
    })
  }

  //
  // Set or update the currentEmojis. Check for invalid ZWJ renderings
  // (i.e. double emoji).
  //

  createEffect(() => {
    async function updateEmojis () {
      console.log('updateEmojis')
      const { searchText, currentGroup, databaseLoaded } = state
      if (!databaseLoaded) {
        state.currentEmojis = []
        state.searchMode = false
      } else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
        const newEmojis = await getEmojisBySearchQuery(searchText)
        if (state.searchText === searchText) { // if the situation changes asynchronously, do not update
          state.currentEmojis = newEmojis
          state.searchMode = true
        }
      } else if (currentGroup) {
        const { id: currentGroupId } = currentGroup
        const newEmojis = await getEmojisByGroup(currentGroupId)
        if (state.currentGroup.id === currentGroupId) { // if the situation changes asynchronously, do not update
          state.currentEmojis = newEmojis
          state.searchMode = false
        }
      }
    }

    /* no await */ updateEmojis()
  })

  // Some emojis have their ligatures rendered as two or more consecutive emojis
  // We want to treat these the same as unsupported emojis, so we compare their
  // widths against the baseline widths and remove them as necessary
  createEffect(() => {
    const zwjEmojisToCheck = state.currentEmojis
      .filter(emoji => emoji.unicode) // filter custom emoji
      .filter(emoji => hasZwj(emoji) && !supportedZwjEmojis.has(emoji.unicode))
    if (!state.emojiVersion && zwjEmojisToCheck.length) {
      // render now, check their length later
      requestAnimationFrame(() => checkZwjSupportAndUpdate(zwjEmojisToCheck))
    } else {
      state.currentEmojis = state.emojiVersion ? state.currentEmojis : state.currentEmojis.filter(isZwjSupported)
      // Reset scroll top to 0 when emojis change
      requestAnimationFrame(() => resetScrollTopIfPossible(refs.tabpanelElement))
    }
  })

  function checkZwjSupportAndUpdate (zwjEmojisToCheck) {
    const shadowRootNode = refs.rootElement.getRootNode()
    const emojiToDomNode = emoji => shadowRootNode.getElementById(`emo-${emoji.id}`)
    checkZwjSupport(zwjEmojisToCheck, refs.baselineEmoji, emojiToDomNode)
    // force update
    const { currentEmojis } = state
    state.currentEmojis = currentEmojis
  }

  function isZwjSupported (emoji) {
    return !emoji.unicode || !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
  }

  async function filterEmojisByVersion (emojis) {
    const emojiSupportLevel = state.emojiVersion || await detectEmojiSupportLevel()
    // !version corresponds to custom emoji
    return emojis.filter(({ version }) => !version || version <= emojiSupportLevel)
  }

  async function summarizeEmojis (emojis) {
    return summarizeEmojisForUI(emojis, state.emojiVersion || await detectEmojiSupportLevel())
  }

  async function getEmojisByGroup (group) {
    console.log('getEmojiByGroup', group)
    // -1 is custom emoji
    const emoji = group === -1 ? state.customEmoji : await state.database.getEmojiByGroup(group)
    return summarizeEmojis(await filterEmojisByVersion(emoji))
  }

  async function getEmojisBySearchQuery (query) {
    return summarizeEmojis(await filterEmojisByVersion(await state.database.getEmojiBySearchQuery(query)))
  }

  createEffect(() => {
    // consider initialLoad to be complete when the first tabpanel and favorites are rendered
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'production' || process.env.PERF) {
      if (state.currentEmojis.length && state.currentFavorites.length && state.initialLoad) {
        state.initialLoad = false
        requestPostAnimationFrame(() => performance.measure('initialLoad', 'initialLoad'))
      }
    }
  })

  //
  // Derive currentEmojisWithCategories from currentEmojis. This is always done even if there
  // are no categories, because it's just easier to code the HTML this way.
  //

  createEffect(() => {
    function calculateCurrentEmojisWithCategories () {
      if (state.searchMode) {
        return [
          {
            category: '',
            emojis: state.currentEmojis
          }
        ]
      }
      const categoriesToEmoji = new Map()
      for (const emoji of state.currentEmojis) {
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
        .sort((a, b) => state.customCategorySorting(a.category, b.category))
    }

    state.currentEmojisWithCategories = calculateCurrentEmojisWithCategories()
  })

  //
  // Handle active search item (i.e. pressing up or down while searching)
  //

  createEffect(() => {
    state.activeSearchItemId = state.activeSearchItem !== -1 && state.currentEmojis[state.activeSearchItem].id
  })

  //
  // Handle user input on the search input
  //

  createEffect(() => {
    const { rawSearchText } = state
    requestIdleCallback(() => {
      state.searchText = (rawSearchText || '').trim() // defer to avoid input delays, plus we can trim here
      state.activeSearchItem = -1
    })
  })

  function onSearchKeydown (event) {
    if (!state.searchMode || !state.currentEmojis.length) {
      return
    }

    const goToNextOrPrevious = (previous) => {
      halt(event)
      state.activeSearchItem = incrementOrDecrement(previous, state.activeSearchItem, state.currentEmojis)
    }

    switch (event.key) {
      case 'ArrowDown':
        return goToNextOrPrevious(false)
      case 'ArrowUp':
        return goToNextOrPrevious(true)
      case 'Enter':
        if (state.activeSearchItem !== -1) {
          halt(event)
          return clickEmoji(state.currentEmojis[state.activeSearchItem].id)
        } else if (state.currentEmojis.length) {
          state.activeSearchItem = 0
        }
    }
  }

  //
  // Handle user input on nav
  //

  function onNavClick (event) {
    const { target } = event
    if (!target.classList.contains('nav-emoji')) {
      return
    }
    const groupId = parseInt(target.dataset.groupId, 10)
    refs.searchElement.value = '' // clear search box input
    state.rawSearchText = ''
    state.searchText = ''
    state.activeSearchItem = -1
    state.currentGroupIndex = state.groups.findIndex(_ => _.id === groupId)
  }

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
    const emoji = await state.database.getEmojiByUnicodeOrName(unicodeOrName)
    const emojiSummary = [...state.currentEmojis, ...state.currentFavorites]
      .find(_ => (_.id === unicodeOrName))
    const skinTonedUnicode = emojiSummary.unicode && unicodeWithSkin(emojiSummary, state.currentSkinTone)
    await state.database.incrementFavoriteEmojiCount(unicodeOrName)
    fireEvent('emoji-click', {
      emoji,
      skinTone: state.currentSkinTone,
      ...(skinTonedUnicode && { unicode: skinTonedUnicode }),
      ...(emojiSummary.name && { name: emojiSummary.name })
    })
  }

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

  function changeSkinTone (skinTone) {
    state.currentSkinTone = skinTone
    state.skinTonePickerExpanded = false
    focus('skintone-button')
    fireEvent('skin-tone-change', { skinTone })
    /* no await */ state.database.setPreferredSkinTone(skinTone)
  }

  function onSkinToneOptionsClick (event) {
    const { target: { id } } = event
    const match = id && id.match(/^skintone-(\d)/) // skintone option format
    if (!match) { // not a skintone option
      return
    }
    halt(event)
    const skinTone = parseInt(match[1], 10) // remove 'skintone-' prefix
    changeSkinTone(skinTone)
  }

  function onClickSkinToneButton (event) {
    state.skinTonePickerExpanded = !state.skinTonePickerExpanded
    state.activeSkinTone = state.currentSkinTone
    if (state.skinTonePickerExpanded) {
      halt(event)
      requestAnimationFrame(() => focus('skintone-list'))
    }
  }

  // To make the animation nicer, change the z-index of the skintone picker button
  // *after* the animation has played. This makes it appear that the picker box
  // is expanding "below" the button
  createEffect(() => {
    if (state.skinTonePickerExpanded) {
      refs.skinToneDropdown.addEventListener('transitionend', () => {
        state.skinTonePickerExpandedAfterAnimation = true // eslint-disable-line no-unused-vars
      }, { once: true })
    } else {
      state.skinTonePickerExpandedAfterAnimation = false // eslint-disable-line no-unused-vars
    }
  })

  function onSkinToneOptionsKeydown (event) {
    if (!state.skinTonePickerExpanded) {
      return
    }

    const changeActiveSkinTone = async nextSkinTone => {
      halt(event)
      state.activeSkinTone = nextSkinTone
    }

    switch (event.key) {
      case 'ArrowUp':
        return changeActiveSkinTone(incrementOrDecrement(true, state.activeSkinTone, state.skinTones))
      case 'ArrowDown':
        return changeActiveSkinTone(incrementOrDecrement(false, state.activeSkinTone, state.skinTones))
      case 'Home':
        return changeActiveSkinTone(0)
      case 'End':
        return changeActiveSkinTone(state.skinTones.length - 1)
      case 'Enter':
        // enter on keydown, space on keyup. this is just how browsers work for buttons
        // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
        halt(event)
        return changeSkinTone(state.activeSkinTone)
      case 'Escape':
        halt(event)
        state.skinTonePickerExpanded = false
        return focus('skintone-button')
    }
  }

  function onSkinToneOptionsKeyup (event) {
    if (!state.skinTonePickerExpanded) {
      return
    }
    switch (event.key) {
      case ' ':
        // enter on keydown, space on keyup. this is just how browsers work for buttons
        // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
        halt(event)
        return changeSkinTone(state.activeSkinTone)
    }
  }

  async function onSkinToneOptionsFocusOut (event) {
    // On blur outside of the skintone listbox, collapse the skintone picker.
    const { relatedTarget } = event
    if (!relatedTarget || relatedTarget.id !== 'skintone-list') {
      state.skinTonePickerExpanded = false
    }
  }

  function onSearchInput (event) {
    state.rawSearchText = event.target.value
  }

  return {
    $set (newState) {
      assign(state, newState)
    },
    $destroy () {
      if (renderedRootNode) {
        renderedRootNode.remove()
      }
      for (const destroyCallback of destroyCallbacks) {
        destroyCallback()
      }
    }
  }
}
