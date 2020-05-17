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
    <ul class="lep-emoji-menu" role="menu">
      {#each currentEmojis as emoji (emoji.unicode)}
        <li class="lep-emoji-item" role="presentation">
          <button role="menuitem" class="lep-emoji">
            {emoji.unicode}
          </button>
        </li>
      {/each}
    </ul>
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
  ul.lep-emoji-menu {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(var(--lep-num-columns), 1fr);
    justify-content: center;
    align-items: center;
  }
  li.lep-emoji-item {
    display: flex;
  }
  button.lep-emoji {
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

  let currentEmojis = []
  let locale = DEFAULT_LOCALE
  let dataSource = DEFAULT_DATA_SOURCE
  let currentCategory = categories[0]
  $: database = new Database({ dataSource, locale })
  $: {
    getEmojisByGroup(currentCategory.group).then(emojis => {
      currentEmojis = emojis
    })
  }

  async function getEmojisByGroup(group) {
    const emojis = await database.getEmojiByGroup(group)
    return emojis.filter(emoji => emoji.version <= emojiSupportLevel)
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