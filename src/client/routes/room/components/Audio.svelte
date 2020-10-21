<script>
  let audioRef;

  export let captionsLabel = '';
  export let play = false;
  export let sources = [];

  $: if (play) audioRef.play();
</script>

<audio preload bind:this={audioRef}>
  <track kind="captions" label={captionsLabel} />
  {#each sources as src}
    <source {src}>
  {/each}
</audio>
