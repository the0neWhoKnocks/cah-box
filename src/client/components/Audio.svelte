<script>
  import { gameFocused } from '../store';
  
  let audioRef;
  let played = false;
  let playing = false;

  export let captionsLabel = '';
  export let play = false;
  export let sources = [];
  
  function handleAudioEnd() {
    played = true;
  }
  
  // Ensure the sound doesn't keep playing when the user goes from one tab to another.
  $: if (!play) played = false;
  
  $: if (!played && $gameFocused && play) {
    audioRef.addEventListener('ended', handleAudioEnd, { once: true }); // only add event when playing (in case there are multiple audio elements on the page)
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
