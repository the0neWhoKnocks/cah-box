<style>
  button {
    width: 100%;
    font-size: 1em;
    padding: 0.5em;
    display: block;
  }

  .wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #eee;
  }

  .start-form {
    width: 300px;
    font-size: 1.5em;
    padding: 1em;
    border: solid 1px #888;
    border-radius: 0.25em;
    background: #fff;
  }
</style>

<script>
  import createGame from '../utils/createGame';
</script>

<div class="wrapper">
  <form class="start-form">
    <button 
      type="button"
      value="create"
      on:click={createGame}
    >Create Game</button>
  </form>
</div>
