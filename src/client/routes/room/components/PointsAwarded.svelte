<style>
  :global(body .modal.points-awarded .modal__mask) {
    background: rgba(199, 199, 199, 0.85);
  }
  :global(body .modal.points-awarded .confetti) {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 2;
  }
  :global(body .modal.points-awarded .modal__body) {
    font-size: 1em;
    text-align: center;
    border: none;
    background: transparent;
  }
  :global(body .modal.points-awarded .points-awarded__msg) {
    padding: 0.75em;
    border: solid 1px;
    border-radius: 0.5em;
    margin-bottom: 1em;
    background: #fff;
  }
  :global(body .modal.points-awarded mark) {
    font-family: monospace;
    line-height: 1em;
    padding: 0 0.5em;
    background: transparent;
  }
  :global(body .modal.points-awarded .username) {
    max-width: 10.5em;
    font-size: 1.5em;
    font-weight: bold;
    word-break: break-all;
    display: inline-block;
  }
  :global(body .modal.points-awarded p) {
    font-size: 1.25em;
  }
  :global(body .modal.points-awarded .points) {
    border-radius: 1em;
    background-color: transparent;
  }
  :global(body .modal.points-awarded .card) {
    text-align: left;
  }
  :global(body .modal.points-awarded button) {
    padding: 1em;
    border-radius: 0.5em;
    border: solid 1px;
    margin-top: 1em;
    background-color: #fff;
    box-shadow: 0 0.1em;
  }
</style>

<script>
  import Modal from '../../../components/Modal.svelte';
  import Audio from './Audio.svelte';
  import Card from './Card.svelte';
  import Celebrate from './Celebrate';
  
  const sources = ['/audio/celebrate.mp3'];
  let _name = '';
  let canvasRef;
  let celebrate;
  let play = false;
  let pointWord = '';

  export let answer = undefined;
  export let blackCard = '';
  export let closeHandler = undefined;
  export let localUsername = '';
  export let name = '';
  export let onClose = undefined;
  export let open = false;
  export let points = undefined;

  $: _name = (localUsername === name) ? 'You' : name;
  $: pointWord = (points > 1) ? 'points' : 'point';
  $: play = open && localUsername === name;

  $: if (open && canvasRef && play) {
    celebrate = new Celebrate({ canvas: canvasRef });
    celebrate.init();
    celebrate.render();
  }
  else if (celebrate) {
    celebrate.stop();
  }
</script>

<Audio
  captionsLabel="Celebration cheer"
  {play}
  {sources}
/>
<Modal class="points-awarded" {onClose} {open}>
  <canvas slot="supplemental" class="confetti" bind:this={canvasRef}></canvas>
  <div class="points-awarded__msg">
    <mark class="username">{_name}</mark>
    <p>
      got <mark class="points">{points}</mark> {pointWord} for
    </p>
  </div>
  <Card type="black" text={blackCard} answer={answer} />
  <button on:click={closeHandler}>Close</button>
</Modal>
