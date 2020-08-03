<style>
  button {
    width: 100%;
    font-size: 1em;
    padding: 0.5em;
    display: block;
  }

  .page {
    width: 100%;
    height: 100%;
    background: #eee;
    display: flex;
  }

  .users-ui {
    width: 200px;
    background: #fff;
  }
  .users-ui :global(.user) {
    margin: 0.25em 0;
  }

  .user-ui {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
  }
  .user-ui :global(.user) {
    overflow: hidden;
    padding: 0 0 0 0.25em;
    border: solid 2px;
    border-radius: 0.75em;
  }
  .user-ui :global(.user .user__name) {
    width: auto;
    padding-right: 1em;
    padding-left: 0.75em;
    border-radius: 0 0.6em 0.6em 0;
    margin-right: -2em;
    background: #eee;
    position: relative;
  }
  .user-ui :global(.user.is--active .user__name) {
    margin-right: -1.25em;
    box-shadow: 0 0 5px 2px;
  }
  .user-ui :global(.user .user__status-indicator) {
    width: 2em;
  }
  .user-ui :global(.user .user__icon) {
    display: none;
  }
  .user-ui :global(.user.is--admin .user__icon) {
    margin-right: -0.5em;
    background: #eee;
    display: inline-block;
    position: relative;
    z-index: 1;
  }

  .join-form,
  :global(.modal.room-error .modal__body) {
    display: flex;
    flex-direction: column;
  }

  .join-form {
    width: 300px;
  }
  .join-form label + input {
    display: block;
    margin-bottom: 1em;
  }

  :global(.modal.room-error .modal__body) {
    width: 440px;
    text-align: center;
    background: #ffffa9;
  }
  :global(.modal.room-error button) {
    border: solid 1px;
    border-radius: 0.25em;
    margin-top: 1em;
    background: #00ff95;
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
  import { stores } from '@sapper/app';
  import { onMount } from 'svelte';
  import Modal from '../../components/Modal.svelte';
  import User from '../../components/User.svelte';
  import {
    WS_MSG__CHECK_USERNAME,
    WS_MSG__ENTER_ROOM,
    WS_MSG__JOIN_GAME,
    WS_MSG__USER_JOINED,
  } from '../../constants';
  import { titleSuffix } from '../../store';
  import createGame from '../../utils/createGame';
  
  const { page } = stores();
  const { roomID } = $page.params;
  let users = [];
  let mounted = false;
  let roomData;
  let usernameInputRef;
  let usernameInputError;
  let createGameBtnRef;
  let localUser;

  function handleJoinSubmit(ev) {
    ev.preventDefault();

    window.socket.emit(WS_MSG__CHECK_USERNAME, {
      roomID,
      username: usernameInputRef.value,
    });
  }

  function parseUserData(data) {
    users = [...data.users];
    
    if (users.length && !localUser) {
      localUser = users.filter(({ name }) => name === data.username)[0];
    }
  }

  function handleEnteringRoom(data) {
    mounted = true;
    roomData = data.roomData;

    if (roomData) {
      parseUserData({
        username: data.username,
        users: roomData.users,
      });
    }

    setTimeout(() => {
      if (usernameInputRef) usernameInputRef.focus();
      if (createGameBtnRef) createGameBtnRef.focus();
    }, 0);
  }

  function handleUsernameCheck({ error, username }) {
    if (error) {
      usernameInputError = 'Sorry, it looks like that username is taken';
    }
    else {
      window.socket.emit(WS_MSG__JOIN_GAME, { roomID, username });
      window.sessionStorage.setItem(roomID, JSON.stringify({ username }));
    }
  }

  function handleUserJoin(data) {
    parseUserData({
      username: data.username,
      users: data.users,
    });
    users = [...data.users];
    if (!localUser) localUser = users[users.length - 1];
  }

  titleSuffix.set(`Game ${roomID}`);

  onMount(() => {
    const { username } = JSON.parse(window.sessionStorage.getItem(roomID) || '{}');

    window.socketConnected.then(() => {
      window.socket.on(WS_MSG__ENTER_ROOM, handleEnteringRoom);
      window.socket.on(WS_MSG__CHECK_USERNAME, handleUsernameCheck);
      window.socket.on(WS_MSG__USER_JOINED, handleUserJoin);

      window.socket.emit(WS_MSG__ENTER_ROOM, { roomID, username });
    });
  });
</script>

<div class="page">
  {#if mounted}
    {#if roomData}
      <div class="users-ui">
        {#each users as user}
          <User class="user" {...user} />
        {/each}
      </div>
      {#if localUser}
        <div class="user-ui">
          <User {...localUser} />
        </div>
      {/if}
      {#if !localUser}
        <Modal>
          <form class="join-form" autocomplete="off" on:submit={handleJoinSubmit}>
            <label for="username">Enter Username</label>
            <input 
              id="username"
              type="text" 
              name="username"
              required
              bind:this={usernameInputRef}
            />
            {#if usernameInputError}
              <div class="error-msg">{usernameInputError}</div>
            {/if}
            <button>Join Game</button>
          </form>
        </Modal>
      {/if}
    {:else}
      <Modal class="room-error">
        Sorry, it looks like this room doesn't exist anymore.
        <button on:click={createGame} bind:this={createGameBtnRef}>
          Click here to create a new game.
        </button>
      </Modal>
    {/if}
  {/if}
</div>
