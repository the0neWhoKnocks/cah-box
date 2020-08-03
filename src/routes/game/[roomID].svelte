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

  .user-nav {
    width: 200px;
    padding: 1em;
    margin: 0;
    background: #fff;
  }

  .modal {
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
  }
  .modal__body {
    font-size: 1.5em;
    padding: 1em;
    border: solid 1px #888;
    border-radius: 0.25em;
    background: #fff;
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

  .room-error {
    width: 400px;
    text-align: center;
    background: #ffffa9;
  }
  .room-error button {
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
  import { titleSuffix } from '../../store';
  import {
    WS_MSG__CHECK_USERNAME,
    WS_MSG__ENTER_ROOM,
    WS_MSG__JOIN_GAME,
    WS_MSG__USER_JOINED,
  } from '../../constants';
  import createGame from '../../utils/createGame';
  
  const { page } = stores();
  const { roomID } = $page.params;
  let users = [];
  let mounted = false;
  let loggedIn = false;
  let roomData;
  let usernameInputRef;
  let usernameInputError;

  function handleJoinSubmit(ev) {
    ev.preventDefault();

    window.socket.emit(WS_MSG__CHECK_USERNAME, {
      roomID,
      username: usernameInputRef.value,
    });
  }

  titleSuffix.set(`Game ${roomID}`);

  onMount(() => {
    window.socketConnected.then(() => {
      window.socket.on(WS_MSG__ENTER_ROOM, (data) => {
        mounted = true;
        roomData = data;

        if (roomData) {
          users = [...roomData.users];
          const { username } = JSON.parse(window.sessionStorage.getItem(roomID) || '{}');

          if (username) loggedIn = true;
          else {
            setTimeout(() => {
              usernameInputRef.focus();
            }, 0);
          }
        }
      });

      window.socket.on(WS_MSG__CHECK_USERNAME, ({ error, username }) => {
        if (error) {
          usernameInputError = 'Sorry, it looks like that username is taken';
        }
        else {
          window.socket.emit(WS_MSG__JOIN_GAME, { roomID, username });
          window.sessionStorage.setItem(roomID, JSON.stringify({ username }));
          loggedIn = true;
        }
      });

      window.socket.on(WS_MSG__USER_JOINED, (data) => {
        users = [...data.users];
      });

      window.socket.emit(WS_MSG__ENTER_ROOM, { roomID });
    });
  });
</script>

<div class="page">
  {#if mounted}
    {#if roomData}
      <ul class="user-nav">
        {#each users as user}
          <li>{user.name}</li>
        {/each}
      </ul>
      {#if !loggedIn}
        <div class="modal">
          <form class="modal__body join-form" autocomplete="off" on:submit={handleJoinSubmit}>
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
        </div>
      {/if}
    {:else}
      <div class="modal">
        <div class="modal__body room-error">
          Sorry, it looks like this room doesn't exist anymore.
          <button on:click={createGame}>
            Click here to create a new game.
          </button>
        </div>
      </div>
    {/if}
  {/if}
</div>
