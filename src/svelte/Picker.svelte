<svelte:options tag={null} />
<section
    class="lep-picker"
    aria-label={i18n.regionLabel}
    bind:this={rootElement}
    style="--lep-num-columns: {numColumns};"
>
  <div>
    <input
            id="lite-emoji-picker-search"
            type="text"
            placeholder={i18n.search}
            autocapitalize="none"
            spellcheck="true"
            bind:value={rawSearchText}
    >
    <label class="lep-sr-only" for="lite-emoji-picker-search">{i18n.search}</label>
  </div>
  <div role="tablist" aria-label={i18n.categoriesLabel}>
    {#each categories as category (category.group)}
      <button role="tab"
              class="lep-button-reset"
              aria-controls="lite-emoji-picker-tab-{category.group}"
              on:click={() => handleCategoryClick(category)}>
        {i18n.categories[category.name]}
      </button>
    {/each}
  </div>
  <div role="tabpanel"
       aria-label={i18n.categories[currentCategory.name]}
       id="lite-emoji-picker-tab-{currentCategory.group}">
    <div class="lep-emoji-menu" role="menu">
      {#each currentEmojis as emoji (emoji.unicode)}
        <button role="menuitem"
                class="lep-emoji lep-button-reset"
                id="lep-emoji-{emoji.unicode}">
          {emoji.unicode}
        </button>
      {/each}
    </div>
  </div>
  <div aria-hidden="true" class="lep-hidden">
    <button class="lep-emoji lep-baseline-emoji" bind:this={baselineEmoji}>😀</button>
  </div>
</section>
<style>
  .lep-picker *, .lep-picker *::before, .lep-picker *::after {
    box-sizing: border-box;
  }
  /* via https://stackoverflow.com/a/19758620 */
  .lep-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
  .lep-hidden {
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
  }
  .lep-shown {
    display: block;
  }
  .lep-not-shown {
    display: none;
  }
  .lep-emoji-menu {
    display: grid;
    grid-template-columns: repeat(var(--lep-num-columns), 1fr);
    justify-content: center;
    align-items: center;
  }
  .lep-emoji {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Twemoji Mozilla",
                 "Noto Color Emoji", "EmojiOne Color", "Android Emoji";
  }
  button.lep-button-reset {
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    box-shadow: none;
    cursor: pointer;
  }
</style>
<script context="module">
  import { determineEmojiSupportLevel } from './utils/determineEmojiSupportLevel'
  // Check which emojis we know for sure aren't supported, based on Unicode version level
  export const emojiSupportLevel = determineEmojiSupportLevel()
  // determine which emojis containing ZWJ (zero width joiner) characters
  // are supported (rendered as one glyph) rather than unsupported (rendered as two or more glyphs)
  export const supportedZwjEmojis = new Map()
</script>
<script>
  import i18n from './i18n/en.json'
  import { categories } from './categories'
  import { DEFAULT_LOCALE, DEFAULT_DATA_SOURCE } from '../database/constants'
  import { Database } from '../database/Database'
  import { MIN_SEARCH_TEXT_LENGTH } from './constants'
  import { requestIdleCallback } from './utils/requestIdleCallback'
  import { getTextWidth } from './utils/getTextWidth'
  import { hasZwj } from './utils/hasZwj'
  import { DEFAULT_NUM_COLUMNS } from './constants'

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

  function checkZwjSupport(zwjEmojisToCheck) {
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
    currentEmojis = currentEmojis // force update
  }

  function isZwjSupported (emoji) {
    return !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
  }

  function filterEmojisByVersion (emojis) {
    return emojis.filter(({ version }) => version <= emojiSupportLevel)
  }

  async function getEmojisByGroup(group) {
    return filterEmojisByVersion(await database.getEmojiByGroup(group))
  }

  async function getEmojisBySearchPrefix(prefix) {
    return filterEmojisByVersion(await database.getEmojiBySearchPrefix(prefix))
  }

  function handleCategoryClick(category) {
    // throttle to avoid input delays
    requestIdleCallback(() => {
      currentCategory = category
    })
  }

  export {
    locale,
    dataSource,
    i18n,
    numColumns
  }
</script>