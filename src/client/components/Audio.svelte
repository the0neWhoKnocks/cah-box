<script>
  import { gameFocused } from '../store';
  
  let {
    captionsLabel = '',
    play = false,
    sources = [],
  } = $props();
  
  let audioRef;
  let played = $state.raw(false);
  let playing = $state.raw(false);
  
  function handleAudioEnd() {
    played = true;
  }
  
  // Ensure the sound doesn't keep playing when the user goes from one tab to another.
  $effect(() => {
    if (!play) played = false;
  });
  
  $effect(() => {
    if (!played && $gameFocused && play) {
      audioRef.addEventListener('ended', handleAudioEnd, { once: true }); // only add event when playing (in case there are multiple audio elements on the page)
      audioRef.play();
      playing = true;
    }
    else if (!play && playing) {
      audioRef.pause();
      audioRef.currentTime = 0;
      playing = false;
    }
  });
</script>

<audio preload bind:this={audioRef}>
  <track kind="captions" label={captionsLabel} />
  {#each sources as src (src)}
    <source {src}>
  {/each}
</audio>
