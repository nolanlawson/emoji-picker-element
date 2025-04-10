import { createFramework } from './framework.js'

export function render (container, state, helpers, events, actions, refs, abortSignal, actionContext, firstRender) {
  const { labelWithSkin, titleForEmoji, unicodeWithSkin } = helpers
  const { html, map } = createFramework(state)

  function emojiList (emojis, searchMode, prefix) {
    return map(emojis, (emoji, i) => {
      return html`
      <button role="${searchMode ? 'option' : 'menuitem'}"
              aria-selected=${searchMode ? i === state.activeSearchItem : null}
              aria-label="${labelWithSkin(emoji, state.currentSkinTone)}"
              title="${titleForEmoji(emoji)}"
              class="${
                'emoji' +
                (searchMode && i === state.activeSearchItem ? ' active' : '') +
                (emoji.unicode ? '' : ' custom-emoji')
              }"
              id=${`${prefix}-${emoji.id}`}
              style=${emoji.unicode ? null : `--custom-emoji-background: url(${JSON.stringify(emoji.url)})`}
      >
        ${
        emoji.unicode
          ? unicodeWithSkin(emoji, state.currentSkinTone)
          : ''
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
        aria-label="${state.i18n.regionLabel}"
        style="${state.pickerStyle || ''}">
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
            aria-activedescendant=${state.activeSearchItemId ? `emo-${state.activeSearchItemId}` : null}
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
          ${state.skinToneButtonText || ''}
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
             style="grid-template-columns: repeat(${state.groups.length}, 1fr)"
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
          <!-- Note we cannot test RTL in Jest because of lack of getComputedStyle() -->
          <div class="indicator"
               style="transform: translateX(${(/* istanbul ignore next */ (state.isRtl ? -1 : 1)) * state.currentGroupIndex * 100}%)">
          </div>
        </div>

        <div class="message ${state.message ? '' : 'gone'}"
             role="alert"
             aria-live="polite">
          ${state.message || ''}
        </div>

        <!--The tabindex=0 is so people can scroll up and down with the keyboard. The element has a role and a label, so I
        feel it's appropriate to have the tabindex.
        This on:click is a delegated click listener -->
        <div data-ref="tabpanelElement" 
             class="tabpanel ${(!state.databaseLoaded || state.message) ? 'gone' : ''}"
             role="${state.searchMode ? 'region' : 'tabpanel'}"
             aria-label="${state.searchMode ? state.i18n.searchResultsLabel : state.i18n.categories[state.currentGroup.name]}"
             id=${state.searchMode ? null : `tab-${state.currentGroup.id}`}
             tabIndex="0"
             data-on-click="onEmojiClick"
        >
          <div data-action="calculateEmojiGridStyle">
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
            <!--
              Improve performance in custom emoji by using \`content-visibility: auto\` on emoji categories.
              The \`--num-rows\` is used in these calculations to contain the intrinsic height.
              Note that we only enable this for:
                - categories beyond the first one
                - non-search mode 
                - custom emoji group (id -1)
              We only need the optimization for large lists of custom emoji (issue #444). Enabling it for non-custom
              emoji causes a bug in Firefox (issue #453). We also don't do it for the first category because this 
              causes blank emoji rendering when switching tabs or searching and un-searching. (Plus it's kind of 
              pointless to do \`content-visibility: auto\` for the first category, since it's immediately shown.)
            -->
          <div class="emoji-menu ${i !== 0 && !state.searchMode && state.currentGroup.id === -1 ? 'visibility-auto' : ''}"
               style=${`--num-rows: ${Math.ceil(emojiWithCategory.emojis.length / state.numColumns)}`}
               data-action="updateOnIntersection"
               role="${state.searchMode ? 'listbox' : 'menu'}"
               aria-labelledby="menu-label-${i}"
               id=${state.searchMode ? 'search-results' : null}
          >
            ${
              emojiList(emojiWithCategory.emojis, state.searchMode, /* prefix */ 'emo')
            }
          </div>
        </div>
      `
              }, emojiWithCategory => emojiWithCategory.category)
            }
          </div>
        </div>
        <!-- This on:click is a delegated click listener -->
        <div class="favorites onscreen emoji-menu ${state.message ? 'gone' : ''}"
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

  // helper for traversing the dom, finding elements by an attribute, and getting the attribute value
  const forElementWithAttribute = (attributeName, callback) => {
    for (const element of container.querySelectorAll(`[${attributeName}]`)) {
      callback(element, element.getAttribute(attributeName))
    }
  }

  if (firstRender) { // not a re-render
    container.appendChild(rootDom)

    // we only bind events/refs once - there is no need to find them again given this component structure

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

  // set up actions - these are re-bound on every render
  forElementWithAttribute('data-action', (element, action) => {
    let boundActions = actionContext.get(action)
    if (!boundActions) {
      actionContext.set(action, (boundActions = new WeakSet()))
    }

    // avoid applying the same action to the same element multiple times
    if (!boundActions.has(element)) {
      boundActions.add(element)
      actions[action](element)
    }
  })
}
