<style>
  button {
    width: 100%;
    font-size: 1em;
    padding: 0.5em;
    display: block;
  }

  .start-form {
    width: 440px;
  }
</style>

<script>
  import { onMount } from 'svelte';
  import Modal from '../components/Modal.svelte';
  import createGame from '../utils/createGame';

  let mounted = false;
  let createGameBtnRef;

  onMount(() => { mounted = true; });
</script>

{#if mounted}
  <Modal focusRef={createGameBtnRef}>
    <form class="start-form">
      <p>
        Welcome to CAH-Box, a mashup of Cards Against Humanity and Jackbox games.
      </p>
      <button 
        type="button"
        value="create"
        on:click={createGame}
        bind:this={createGameBtnRef}
      >Create Game</button>
    </form>
  </Modal>
{/if}
