<script>
  let audioRef;
  let playing = false;

  export let captionsLabel = '';
  export let play = false;
  export let sources = [];

  $: if (play) {
    audioRef.play();
    playing = true;
  }
  else if (!play && playing) {
    audioRef.pause();
    audioRef.currentTime = 0;
    playing = false;
  }
</script>

<audio preload bind:this={audioRef}>
  <track kind="captions" label={captionsLabel} />
  {#each sources as src}
    <source {src}>
  {/each}
</audio>
