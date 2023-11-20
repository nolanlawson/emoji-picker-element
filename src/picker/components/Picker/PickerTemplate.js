import { html, map } from './framework.js'

export function createRootDom (state, helpers, events, createEffect) {

  const { labelWithSkin, titleForEmoji, unicodeWithSkin } = helpers

  const emojiList = createEffect((emojis, searchMode, prefix) => {
    return map(emojis, (emoji, i) => {
      return html`
        <button role="${searchMode ? 'option' : 'menuitem'}"
                aria-selected="${state.searchMode ? i === state.activeSearchItem : ''}"
                aria-label="${labelWithSkin(emoji, state.currentSkinTone)}"
                title="${titleForEmoji(emoji)}"
                class="emoji ${searchMode && i === state.activeSearchItem ? 'active' : ''}"
                id="${prefix}-${emoji.id}">
          ${
            emoji.unicode
              ? unicodeWithSkin(emoji, state.currentSkinTone)
              : html`<img class="custom-emoji" src="${emoji.url}" alt="" loading="lazy"/>`
          }
        </button>
      `
    })
  })

  const skintoneButtons = createEffect(() => {
    return map(state.skinTones, (skinTone, i) => {
      return html`
        <div id="skintone-${i}"
             class="emoji ${i === state.activeSkinTone ? 'active' : ''}"
             aria-selected="${i === state.activeSkinTone}"
             role="option"
             title="${state.i18n.skinTones[i]}"
             aria-label="${state.i18n.skinTones[i]}">
          ${skinTone}
        </div>
      `
    })
  })

  const skintonePicker = createEffect(() => {
    // For the pattern used for the skintone dropdown, see:
    // https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
    // The one case where we deviate from the example is that we move focus from the button to the
    // listbox. (The example uses a combobox, so it's not exactly the same.) This was tested in NVDA and VoiceOver.
    return html`
      <div class="skintone-button-wrapper ${state.skinTonePickerExpandedAfterAnimation ? 'expanded' : ''}">
        <button id="skintone-button"
                class="emoji ${state.skinTonePickerExpanded ? 'hide-focus' : ''}"
                aria-label="${state.skinToneButtonLabel}"
                title="${state.skinToneButtonLabel}"
                aria-describedby="skintone-description"
                aria-haspopup="listbox"
                aria-expanded="${state.skinTonePickerExpanded}"
                aria-controls="skintone-list"
                data-on-click="onClickSkinToneButton">
          ${state.skinToneButtonText}
        </button>
      </div>
      <span id="skintone-description" class="sr-only">${state.i18n.skinToneDescription}</span>
      <div
        data-ref="skinToneDropdown"
        id="skintone-list"
        class="skintone-list hide-focus ${state.skinTonePickerExpanded ? '' : 'hidden no-animate'}"
        style="transform:translateY(${state.skinTonePickerExpanded ? 0 : 'calc(-1 * var(--num-skintones) * var(--total-emoji-size))'})"
        role="listbox"
        aria-label="${state.i18n.skinTonesLabel}"
        aria-activedescendant="skintone-${state.activeSkinTone}"
        aria-hidden="${!state.skinTonePickerExpanded}"
        tabIndex="-1"
        data-on-focusout="onSkinToneOptionsFocusOut"
        data-on-click="onSkinToneOptionsClick"
        data-on-keydown="onSkinToneOptionsKeydown"
        data-on-keyup="onSkinToneOptionsKeyup">
        ${skintoneButtons()}
      </div>
    `
  })

  const searchBox = createEffect(() => {
    return html`
      <div class="search-row">
        <div class="search-wrapper">
          <!-- no need for aria-haspopup=listbox, it's the default for role=combobox
               https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/combobox/aria1.1pattern/listbox-combo.html
               -->
          <input
            id="search"
            class="search"
            type="search"
            role="combobox"
            enterkeyhint="search"
            placeholder="${state.i18n.searchLabel}"
            autocapitalize="none"
            autocomplete="off"
            spellcheck="true"
            aria-expanded="${!!(state.searchMode && state.currentEmojis.length)}"
            aria-controls="search-results"
            aria-describedby="search-description"
            aria-autocomplete="list"
            aria-activedescendant="${state.activeSearchItemId ? `emo-${state.activeSearchItemId}` : ''}"
            data-ref="searchElement"
            data-on-input="onSearchInput"
            data-on-keydown="onSearchKeydown"
          >
          <label class="sr-only" for="search">${state.i18n.searchLabel}</label>
          <span id="search-description" class="sr-only">${state.i18n.searchDescription}</span>
        </div>
      </div>
    `
  })

  const emojiTabs = createEffect(() => {
    return map(state.currentEmojisWithCategories, (emojiWithCategory, i) => {
      return html`
        <div
          id="menu-label-${i}"
          class="category ${state.currentEmojisWithCategories.length === 1 && state.currentEmojisWithCategories[0].category === '' ? 'gone' : ''}"
          aria-hidden="true">
          <!-- This logic is a bit complicated in order to avoid a flash of the word "Custom" while switching
               from a tabpanel with custom emoji to a regular group. I.e. we don't want it to suddenly flash
               from "Custom" to "Smileys and emoticons" when you click the second nav button. The easiest
               way to repro this is to add an artificial delay to the IndexedDB operations. -->
          ${
            state.searchMode ?
              state.i18n.searchResultsLabel : (
                emojiWithCategory.category ?
                  emojiWithCategory.category : (
                    state.currentEmojisWithCategories.length > 1 ?
                      state.i18n.categories.custom :
                      state.i18n.categories[state.currentGroup.name]
                  )
              )
          }
        </div>
        <div class="emoji-menu"
             role="${state.searchMode ? 'listbox' : 'menu'}"
             aria-labelledby="menu-label-${i}"
             id=${state.searchMode ? 'search-results' : ''}>
          ${emojiList(emojiWithCategory.emojis, state.searchMode, 'emo')}
        </div>
      `
    })
  })

  const emojiTabPanel = createEffect(() => {
    // The tabindex=0 is so people can scroll up and down with the keyboard. The element has a role and a label, so I
    // feel it's appropriate to have the tabindex.
    // This on:click is a delegated click listener
    return html`
      <div data-ref="tabpanelElement" class="tabpanel ${(!state.databaseLoaded || state.message) ? 'gone' : ''}"
           role="${state.searchMode ? 'region' : 'tabpanel'}"
           aria-label="${state.searchMode ? state.i18n.searchResultsLabel : state.i18n.categories[state.currentGroup.name]}"
           id="${state.searchMode ? '' : `tab-${state.currentGroup.id}`}"
           tabindex="0"
           data-on-click="onEmojiClick"
      >
        <div data-ref="emojiGrid">
          ${emojiTabs()}
        </div>
      </div>
    `
  })

  const navButtons = createEffect(() => {
    return map(state.groups, (group) => {
      return html`
        <button role="tab"
                class="nav-button"
                aria-controls="tab-${group.id}"
                aria-label="${i18n.categories[group.name]}"
                aria-selected="${!state.searchMode && state.currentGroup.id === group.id}"
                title="${state.i18n.categories[group.name]}"
                data-on-click="() => onNavClick(group)">
          <div class="nav-emoji emoji">
            ${group.emoji}
          </div>
        </button>
      `
    })
  })

  const nav = createEffect(() => {
    // this is interactive because of keydown; it doesn't really need focus
    return html`
      <div class="nav"
           role="tablist"
           style="grid-template-columns: repeat(${state.groups.length}, 1fr)"
           aria-label="${i18n.categoriesLabel}"
           data-on-keydown="onNavKeydown">
        ${navButtons()}
      </div>
    `
  })

  const section = createEffect(() => {
    return html`
      <section
        class="picker"
        aria-label="${state.i18n.regionLabel}"
        style="${state.pickerStyle}">
        <!-- using a spacer div because this allows us to cover up the skintone picker animation -->
        <div class="pad-top"></div>
        ${searchBox()}
        ${skintonePicker()}
        ${nav()}
        <div class="indicator-wrapper">
          <div class="indicator"
               style="transform: translateX(${(state.isRtl ? -1 : 1) * state.currentGroupIndex * 100}%)">
          </div>
        </div>

        <div class="message ${state.message ? '' : 'gone'}"
             role="alert"
             aria-live="polite">
          ${state.message}
        </div>

        ${emojiTabPanel()}
        <!-- This on:click is a delegated click listener -->
        <div class="favorites emoji-menu ${state.message ? 'gone' : ''}"
             role="menu"
             aria-label="${state.i18n.favoritesLabel}"
             style="padding-inline-end: ${state.scrollbarWidth}px"
             data-on-click="onEmojiClick">
          ${emojiList(state.currentFavorites, false, 'fav')}
        </div>
        <!-- This serves as a baseline emoji for measuring against and determining emoji support -->
        <button data-ref="baselineEmoji" aria-hidden="true" tabindex="-1" class="abs-pos hidden emoji baseline-emoji">
          😀
        </button>
      </section>
    `
  })

  const rootDom = section()

  // bind events
  for (const eventName of ['click', 'focusout', 'input', 'keydown', 'keyup']) {
    for (const element of rootDom.querySelectorAll(`[data-on-${eventName}]`)) {
      const listenerName = element.getAttribute(`data-on-${eventName}`)
      element.addEventListener(eventName, events[listenerName])
    }
  }

  // find refs
  const refs = {}
  for (const element of rootDom.querySelectorAll('[data-ref]')) {
    const { ref } = element.dataset
    refs[ref] = element
  }

  return {
    refs,
    rootNode: rootDom
  }
}