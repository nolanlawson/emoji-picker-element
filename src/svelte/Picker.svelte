<svelte:options tag={null} />
<section
    class="lite-emoji-picker"
    aria-label={i18n.regionLabel}>
  <div role="tablist" aria-label={i18n.categoriesLabel}>
    {#each categories as category, i}
      <button role="tab" aria-controls="lite-emoji-picker-tab-{i}">
        {i18n.categories[category]}
      </button>
    {/each}
  </div>
  <div>
    {#each categories as category, i}
      <div role="tabpanel" id="lite-emoji-picker-tab-{i}">
        tab for {i18n.categories[category]}
      </div>
    {/each}
  </div>
  <div>
    <input
        id="lite-emoji-picker-search"
        type="text"
        placeholder={i18n.search}
        autocapitalize="none"
        spellcheck="true"
    >
    <label class="sr-only" for="lite-emoji-picker-search">{i18n.search}</label>
  </div>
  <div role="tabpanel" aria-label="Emoji">

  </div>
</section>
<style>
  /* via https://stackoverflow.com/a/19758620 */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
<script>
  import * as i18n from './i18n/en.json'
  import { categories } from './categories'

  export { categories, i18n }
</script>