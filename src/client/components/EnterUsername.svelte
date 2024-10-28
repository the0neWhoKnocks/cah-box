<script>
  import {
    ERROR_CODE__NAME_TAKEN,
    WS__MSG__CHECK_USERNAME,
  } from '../../constants';
  import addSocketListeners from '../utils/addSocketListeners';
  import Dialog from './Dialog.svelte';

  const MAX_USERNAME_LENGTH = 15;
  const NON_ALPHA_NUMERIC_CHARS = /[^a-z0-9]+/i;
  let usernameInputError;
  let usernameInputRef;
  let username = '';
  
  export let onUsernameSuccess = undefined;
  export let open = false;
  export let roomID = undefined;

  function handleJoinSubmit(ev) {
    ev.preventDefault();

    window.clientSocket.emit(WS__MSG__CHECK_USERNAME, {
      roomID,
      username: usernameInputRef.value,
    });
  }

  function handleUsernameCheck({ error, username }) {
    if (error) {
      switch (error.code) {
        case ERROR_CODE__NAME_TAKEN:
          usernameInputError = 'Sorry, it looks like that username is taken';
          break;
      }
    }
    else if (onUsernameSuccess) onUsernameSuccess(username);
  }
  
  function handleFocusUsername() {
    usernameInputRef.focus();
  }

  $: {
    if (NON_ALPHA_NUMERIC_CHARS.test(username)) username = username.replace(NON_ALPHA_NUMERIC_CHARS, '');
    if (username.length > MAX_USERNAME_LENGTH) username = username.substring(0, MAX_USERNAME_LENGTH);
  }

  addSocketListeners({
    [WS__MSG__CHECK_USERNAME]: handleUsernameCheck,
  });
</script>

{#if open}
  <Dialog modal onOpenEnd={handleFocusUsername}>
    <form
      class="join-form"
      autocomplete="off"
      slot="dialogBody"
      on:submit={handleJoinSubmit}
    >
      <label for="username">Enter Username</label>
      <input 
        id="username"
        type="text"
        name="username"
        required
        bind:this={usernameInputRef}
        bind:value={username}
      />
      {#if usernameInputError}
        <div class="error-msg">{usernameInputError}</div>
      {/if}
      <button>Join Game</button>
    </form>
  </Dialog>
{/if}

<style>
  .join-form {
    display: flex;
    flex-direction: column;
  }

  .join-form {
    max-width: 300px;
  }
  .join-form label + input {
    display: block;
    margin-bottom: 1em;
  }

  .error-msg {
    color: #7d0000;
    line-height: 1.2em;
    padding: 0.5em;
    border: solid 2px;
    border-radius: 0.25em;
    margin-bottom: 1em;
    background: #ffbcbc;
  }
</style>
