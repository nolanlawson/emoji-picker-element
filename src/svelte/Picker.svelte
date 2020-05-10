<svelte:options tag="lite-emoji-picker" />
<section
    class="lite-emoji-picker"
    aria-label={i18n.sectionLabel}>
  <div role="tablist" aria-label={i18n.categories}></div>
  <div>
    <input id="lite-emoji-picker-search" type="text">
    <label class="sr-only" for="lite-emoji-picker-search">{i18n.search}</label>
  </div>
  <div role="tabpanel" aria-label="Emoji">

  </div>
</section>
<script>
export let i18n = {
  sectionLabel: 'Emoji picker',
  categories: 'Categories',
  search: 'Search emoji'
}
</script>