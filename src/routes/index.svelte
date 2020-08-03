<style>
  button {
    width: 100%;
    font-size: 1em;
    padding: 0.5em;
    display: block;
  }

  .start-form {
    width: 300px;
  }
</style>

<script>
  import Modal from '../components/Modal.svelte';
  import createGame from '../utils/createGame';
</script>

<Modal>
  <form class="start-form">
    <button 
      type="button"
      value="create"
      on:click={createGame}
    >Create Game</button>
  </form>
</Modal>
