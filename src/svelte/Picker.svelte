<svelte:options tag={null} />
<section
    class="lep-picker"
    aria-label={i18n.regionLabel}>
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
        <button role="menuitem" class="lep-emoji">
          {emoji.unicode}
        </button>
      {/each}
    </div>
  </div>
</section>
<style>
  .lep-picker {
    --lep-num-columns: 8;
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
  button.lep-emoji {
    margin: 0;
    padding: 0;
    font-size: 1.5rem;
    border: none;
    background: none;
    box-shadow: none;
    cursor: pointer;
    flex: 1;
    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Twemoji Mozilla",
                 "Noto Color Emoji", "EmojiOne Color", "Android Emoji";
  }
</style>
<script context="module">
  import { determineEmojiSupportLevel } from './utils/determineEmojiSupportLevel'
  export const emojiSupportLevel = determineEmojiSupportLevel()
  console.log('emojiSupportLevel', emojiSupportLevel)
</script>
<script>
  import i18n from './i18n/en.json'
  import { categories } from './categories'
  import { DEFAULT_LOCALE, DEFAULT_DATA_SOURCE } from '../database/constants'
  import { Database } from '../database/Database'
  import { MIN_SEARCH_TEXT_LENGTH } from './constants'
  import { requestIdleCallback } from './utils/requestIdleCallback'

  let currentEmojis = []
  let locale = DEFAULT_LOCALE
  let dataSource = DEFAULT_DATA_SOURCE
  let currentCategory = categories[0]
  let rawSearchText = ''
  let searchText = ''
  $: database = new Database({ dataSource, locale })
  $: {
    (async () => {
      currentEmojis = await getEmojisByGroup(currentCategory.group)
    })()
  }
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

  function filterEmojis (emojis) {
    return emojis.filter(emoji => emoji.version <= emojiSupportLevel)
  }

  async function getEmojisByGroup(group) {
    return filterEmojis(await database.getEmojiByGroup(group))
  }

  async function getEmojisBySearchPrefix(prefix) {
    return filterEmojis(await database.getEmojiBySearchPrefix(prefix))
  }

  function handleCategoryClick(category) {
    currentCategory = category
  }

  export {
    categories,
    locale,
    dataSource,
    i18n
  }
</script>