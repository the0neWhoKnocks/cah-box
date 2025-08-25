<script>
  import Celebrate from '../utils/Celebrate';
  import Audio from './Audio.svelte';
  import Card from './Card.svelte';
  import Dialog from './Dialog.svelte';
  
  let {
    answer = undefined,
    blackCard = '',
    closeHandler = undefined,
    localUsername = '',
    name = '',
    onClose = undefined,
    open = false,
    points = undefined,
  } = $props();
  
  const sources = ['/audio/celebrate.mp3'];
  let _name = $derived((localUsername === name) ? 'You' : name);
  let canvasRef = $state();
  let celebrate;
  let play = $derived(open && localUsername === name);
  let pointWord = $derived((points > 1) ? 'points' : 'point');

  $effect(() => {
    if (open && canvasRef && play) {
      celebrate = new Celebrate({ canvas: canvasRef });
      celebrate.init();
      celebrate.render();
    }
    else if (celebrate) {
      celebrate.stop();
    }
  });
</script>

<Audio
  captionsLabel="Celebration cheer"
  {play}
  {sources}
/> <!-- audio is top-level so that it preloads and can play on-demand -->
{#if open}
  <Dialog
    modal
    onCloseClick={onClose}
  >
    {#snippet s_supplemental()}
      <canvas class="confetti" bind:this={canvasRef}></canvas>
    {/snippet}
    {#snippet s_dialogBody()}
      <div class="points-awarded">
        <div class="points-awarded__msg">
          <mark class="username">{_name}</mark>
          <p>
            got <mark class="points">{points}</mark> {pointWord} for
          </p>
        </div>
        <Card type="black" text={blackCard} answer={answer} />
        <button onclick={closeHandler}>Close</button>
      </div>
    {/snippet}
  </Dialog>
{/if}

<style>
  :global(.dialog-mask:has(+ .dialog .dialog__body .points-awarded)) {
    background: rgba(199, 199, 199, 0.85);
  }
  .confetti {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 2;
  }
  .points-awarded {
    font-size: 1em;
    text-align: center;
    border: none;
    background: transparent;
  }
  .points-awarded__msg {
    padding: 0.75em;
    border: solid 1px;
    border-radius: 0.5em;
    margin-bottom: 1em;
    background: #fff;
  }
  .points-awarded mark {
    font-family: monospace;
    line-height: 1em;
    padding: 0 0.5em;
    background: transparent;
  }
  .points-awarded .username {
    max-width: 10.5em;
    font-size: 1.5em;
    font-weight: bold;
    word-break: break-all;
    display: inline-block;
  }
  .points-awarded p {
    font-size: 1.25em;
  }
  .points-awarded .points {
    border-radius: 1em;
    background-color: transparent;
  }
  .points-awarded :global(.card) {
    text-align: left;
  }
  .points-awarded button {
    padding: 1em;
    border-radius: 0.5em;
    border: solid 1px;
    margin-top: 1em;
    background-color: #fff;
    box-shadow: 0 0.1em;
  }
</style>
