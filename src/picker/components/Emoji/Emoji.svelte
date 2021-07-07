{#if emoji.unicode}
  {unicodeWithSkin(emoji, currentSkinTone)}
{:else}
  <img class="custom-emoji" src={emoji.url} alt="" loading="lazy" />
{/if}
<script>
  import { unicodeWithSkin } from '../../utils/unicodeWithSkin'

  export let emoji
  export let currentSkinTone
</script>