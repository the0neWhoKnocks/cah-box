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

<script>
  import { onMount } from 'svelte';
  import {
    ERROR_CODE__NAME_TAKEN,
    ERROR_CODE__ROOM_DOES_NOT_EXIST,
    WS__MSG_TYPE__CHECK_USERNAME,
  } from '../../../../constants';
  import Modal from '../../../components/Modal.svelte';

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

    window.clientSocket.emit(WS__MSG_TYPE__CHECK_USERNAME, {
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

        case ERROR_CODE__ROOM_DOES_NOT_EXIST:
          handleRoomDestruction();
          break;
      }
    }
    else if (onUsernameSuccess) onUsernameSuccess(username);
  }

  $: {
    if (NON_ALPHA_NUMERIC_CHARS.test(username)) username = username.replace(NON_ALPHA_NUMERIC_CHARS, '');
    if (username.length > MAX_USERNAME_LENGTH) username = username.substring(0, MAX_USERNAME_LENGTH);
  }

  onMount(() => {
    window.socketConnected.then(() => {
      window.clientSocket.on(WS__MSG_TYPE__CHECK_USERNAME, handleUsernameCheck);
    });
  });
</script>

<Modal focusRef={usernameInputRef} open={open}>
  <form class="join-form" autocomplete="off" on:submit={handleJoinSubmit}>
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
</Modal>
