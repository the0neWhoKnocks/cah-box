<script>
  import { WS__MSG__CREATE_GAME } from '../../constants';

  const MAX_CODE_LENGTH = 4;
  const NON_ALPHA_NUMERIC_CHARS = /[^a-z0-9]+/i;
  let userCode = '';

  function createGame() {
    window.socketConnected.then(() => {
      window.clientSocket.on(WS__MSG__CREATE_GAME, ({ roomID }) => {
        window.location.assign(`/${roomID}`);
      });

      window.clientSocket.emit(WS__MSG__CREATE_GAME);
    });
  }

  function goToRoom(ev) {
    ev.preventDefault();
    
    if (/[a-z0-9]{4}/i.test(userCode)) {
      window.location.assign(`/${userCode.toUpperCase()}`);
    }
  }

  $: {
    if (NON_ALPHA_NUMERIC_CHARS.test(userCode)) userCode = userCode.replace(NON_ALPHA_NUMERIC_CHARS, '');
    if (userCode.length > MAX_CODE_LENGTH) userCode = userCode.substring(0, MAX_CODE_LENGTH);
  }
</script>

<hr />
<div class="row">
  <form on:submit={goToRoom}>
    <label>
      Enter code:
      <input type="text" bind:value={userCode}>
    </label>
    <button on:click={goToRoom}>Go</button>
  </form>
</div>
<hr />
<div class="row">
  Or:
  <button type="button" on:click={createGame}>Create Game</button>
</div>

<style>
  .row {
    padding: 0.5em 0;
    display: flex;
  }
  .row:last-of-type {
    padding-bottom: 0;
  }
  .row *:not(label) {
    margin-left: 0.5em;
  }

  hr {
    width: 100%;
    border: solid 1px;
    border-bottom: none;
  }

  form {
    display: contents;
  }

  label {
    flex-shrink: 0;
  }

  input {
    width: 4em;
    font-family: monospace;
    text-transform: uppercase;
    text-align: center;
  }

  button {
    width: 100%;
    font-size: 1em;
    padding: 0.25em;
    display: block;
  }
</style>
