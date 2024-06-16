import { createFramework } from './framework.js'

export function render (container, state, helpers, events, refs, abortSignal, firstRender) {
  const { labelWithSkin, titleForEmoji, unicodeWithSkin } = helpers
  const { html, map } = createFramework(state)

  function emojiList (emojis, searchMode, prefix) {
    return map(emojis, (emoji, i) => {
      return html`
      <button role="${searchMode ? 'option' : 'menuitem'}"
              aria-selected="${state.searchMode ? i === state.activeSearchItem : ''}"
              aria-label="${labelWithSkin(emoji, state.currentSkinTone)}"
              title="${titleForEmoji(emoji)}"
              class="emoji ${searchMode && i === state.activeSearchItem ? 'active' : ''}"
              id=${`${prefix}-${emoji.id}`}>
        ${
        emoji.unicode
          ? unicodeWithSkin(emoji, state.currentSkinTone)
          : html`<img class="custom-emoji" src="${emoji.url}" alt="" loading="lazy"/>`
      }
      </button>
    `
      // It's important for the cache key to be unique based on the prefix, because the framework caches based on the
      // unique tokens + cache key, and the same emoji may be used in the tab as well as in the fav bar
    }, emoji => `${prefix}-${emoji.id}`)
  }

  const section = () => {
    return html`
      <section
        data-ref="rootElement"
        class="picker"
        aria-label="${state.i18n.regionLabel}">
        <!-- using a spacer div because this allows us to cover up the skintone picker animation -->
        <div class="pad-top"></div>
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
          ></input>
          <label class="sr-only" for="search">${state.i18n.searchLabel}</label>
          <span id="search-description" class="sr-only">${state.i18n.searchDescription}</span>
        </div>
        <!-- For the pattern used for the skintone dropdown, see:
        https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
        The one case where we deviate from the example is that we move focus from the button to the
        listbox. (The example uses a combobox, so it's not exactly the same.) This was tested in NVDA and VoiceOver. -->
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
        role="listbox"
        aria-label="${state.i18n.skinTonesLabel}"
        aria-activedescendant="skintone-${state.activeSkinTone}"
        aria-hidden="${!state.skinTonePickerExpanded}"
        tabIndex="-1"
        data-on-focusout="onSkinToneOptionsFocusOut"
        data-on-click="onSkinToneOptionsClick"
        data-on-keydown="onSkinToneOptionsKeydown"
        data-on-keyup="onSkinToneOptionsKeyup">
        ${
    map(state.skinTones, (skinTone, i) => {
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
    }, skinTone => skinTone)
        }
      </div>
      </div>
        <!-- this is interactive because of keydown; it doesn't really need focus -->
        <div class="nav"
             role="tablist"
             aria-label="${state.i18n.categoriesLabel}"
             data-on-keydown="onNavKeydown"
             data-on-click="onNavClick"
        >
          ${
            map(state.groups, (group) => {
              return html`
        <button role="tab"
                class="nav-button"
                aria-controls="tab-${group.id}"
                aria-label="${state.i18n.categories[group.name]}"
                aria-selected="${!state.searchMode && state.currentGroup.id === group.id}"
                title="${state.i18n.categories[group.name]}"
                data-group-id=${group.id}
        >
          <div class="nav-emoji emoji">
            ${group.emoji}
          </div>
        </button>
      `
            }, group => group.id)
          }
        </div>
        <div class="indicator-wrapper">
          <div class="indicator">
          </div>
        </div>

        <div class="message ${state.message ? '' : 'gone'}"
             role="alert"
             aria-live="polite">
          ${state.message}
        </div>

        <!--The tabindex=0 is so people can scroll up and down with the keyboard. The element has a role and a label, so I
        feel it's appropriate to have the tabindex.
        This on:click is a delegated click listener -->
        <div data-ref="tabpanelElement" class="tabpanel ${(!state.databaseLoaded || state.message) ? 'gone' : ''}"
             role="${state.searchMode ? 'region' : 'tabpanel'}"
             aria-label="${state.searchMode ? state.i18n.searchResultsLabel : state.i18n.categories[state.currentGroup.name]}"
             id="${state.searchMode ? '' : `tab-${state.currentGroup.id}`}"
             tabIndex="0"
             data-on-click="onEmojiClick"
        >
            ${
              map(state.currentEmojisWithCategories, (emojiWithCategory, i) => {
                return html`
        <!-- wrapper div so there's one top level element for this loop -->
        <div>
          <div
            id="menu-label-${i}"
            class="category ${state.currentEmojisWithCategories.length === 1 && state.currentEmojisWithCategories[0].category === '' ? 'gone' : ''}"
            aria-hidden="true">
            <!-- This logic is a bit complicated in order to avoid a flash of the word "Custom" while switching
                 from a tabpanel with custom emoji to a regular group. I.e. we don't want it to suddenly flash
                 from "Custom" to "Smileys and emoticons" when you click the second nav button. The easiest
                 way to repro this is to add an artificial delay to the IndexedDB operations. -->
            ${
                  state.searchMode
                    ? state.i18n.searchResultsLabel
                    : (
                      emojiWithCategory.category
                        ? emojiWithCategory.category
                        : (
                          state.currentEmojisWithCategories.length > 1
                            ? state.i18n.categories.custom
                            : state.i18n.categories[state.currentGroup.name]
                        )
                    )
                }
          </div>
          <div class="emoji-menu"
               role="${state.searchMode ? 'listbox' : 'menu'}"
               aria-labelledby="menu-label-${i}"
               id=${state.searchMode ? 'search-results' : ''}>
            ${
              emojiList(emojiWithCategory.emojis, state.searchMode, /* prefix */ 'emo')
            }
          </div>
        </div>
      `
              }, emojiWithCategory => emojiWithCategory.category)
            }
        </div>
        <!-- This on:click is a delegated click listener -->
        <div class="favorites emoji-menu ${state.message ? 'gone' : ''}"
             role="menu"
             aria-label="${state.i18n.favoritesLabel}"
             data-on-click="onEmojiClick">
          ${
            emojiList(state.currentFavorites, /* searchMode */ false, /* prefix */ 'fav')
          }
        </div>
        <!-- This serves as a baseline emoji for measuring against and determining emoji support -->
        <button data-ref="baselineEmoji" aria-hidden="true" tabindex="-1" class="abs-pos hidden emoji baseline-emoji">
          😀
        </button>
      </section>
    `
  }

  const rootDom = section()

  if (firstRender) { // not a re-render
    container.appendChild(rootDom)

    // we only bind events/refs once - there is no need to find them again given this component structure

    // helper for traversing the dom, finding elements by an attribute, and getting the attribute value
    const forElementWithAttribute = (attributeName, callback) => {
      for (const element of container.querySelectorAll(`[${attributeName}]`)) {
        callback(element, element.getAttribute(attributeName))
      }
    }

    // bind events
    for (const eventName of ['click', 'focusout', 'input', 'keydown', 'keyup']) {
      forElementWithAttribute(`data-on-${eventName}`, (element, listenerName) => {
        element.addEventListener(eventName, events[listenerName])
      })
    }

    // find refs
    forElementWithAttribute('data-ref', (element, ref) => {
      refs[ref] = element
    })

    // destroy/abort logic
    abortSignal.addEventListener('abort', () => {
      container.removeChild(rootDom)
    })
  }
}
