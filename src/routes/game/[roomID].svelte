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
  .users-ui.is--admin :global(.user:hover) {
    cursor: pointer;
    background: rgba(255, 255, 0, 0.5);
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
  .user-ui :global(.user.is--czar .user__name) {
    margin-right: -1.25em;
    box-shadow: 0 0 5px 2px;
  }
  .user-ui :global(.user .user__status-indicator) {
    width: 2em;
  }
  .user-ui :global(.user:not(.is--admin):not(.is--czar) .user__icon) {
    display: none;
  }
  .user-ui :global(.user .user__icon) {
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

  :global(.modal.admin-instructions .modal__body) {
    width: 500px;
    font-size: 1.3em;
  }

  :global(.modal.user-data-menu button:not(:first-of-type)) {
    margin-top: 1em;
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
    WS_MSG__SET_ADMIN,
    WS_MSG__SET_CZAR,
    WS_MSG__USER_JOINED,
    WS_MSG__USER_UPDATE,
  } from '../../constants';
  import { titleSuffix } from '../../store';
  import createGame from '../../utils/createGame';
  
  const MSG__SET_CZAR = 'Bequeath the Czar';
  const { page } = stores();
  const { roomID } = $page.params;
  let users = [];
  let mounted = false;
  let showAdminInstructions = false;
  let adminInstructionsShown = false;
  let roomData;
  let usernameInputRef;
  let usernameInputError;
  let createGameBtnRef;
  let localUser;
  let closeAdminInstructionsBtnRef;
  let userClickHandler;
  let showUserDataMenu = false;
  let userData;

  function handleJoinSubmit(ev) {
    ev.preventDefault();

    window.socket.emit(WS_MSG__CHECK_USERNAME, {
      roomID,
      username: usernameInputRef.value,
    });
  }

  function parseUserData(data, update) {
    users = [...data.users];
    
    if (
      users.length
      && (!localUser || update)
    ) {
      localUser = users.filter(({ name }) => name === data.username)[0];
    }

    if (update && !localUser.admin) userClickHandler = undefined;

    if (localUser && localUser.admin) userClickHandler = handleUserClick;

    if (!adminInstructionsShown && localUser && localUser.admin) {
      showAdminInstructions = true;
      adminInstructionsShown = true;

      window.sessionStorage.setItem(roomID, JSON.stringify({
        adminInstructionsShown: true,
        username: localUser.name,
      }));

      setTimeout(() => {
        closeAdminInstructionsBtnRef.focus();
      }, 0);
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
  }

  function closeAdminInstructions() {
    showAdminInstructions = false;
  }

  function openUserDataMenu(username) {
    showUserDataMenu = true;
    userData = users.filter(({ name }) => name === username)[0];
  }

  function closeUserDataMenu() {
    showUserDataMenu = false;
    userData = undefined;
  }

  function handleUserClick(ev) {
    const el = ev.target;

    if (el.classList.contains('user')) openUserDataMenu(el.dataset.name);
  }

  function setCzar() {
    window.socket.emit(WS_MSG__SET_CZAR, {
      roomID,
      username: userData.name,
    });
    closeUserDataMenu();
  }

  function setAdmin() {
    window.socket.emit(WS_MSG__SET_ADMIN, {
      roomID,
      username: userData.name,
    });
    closeUserDataMenu();
  }

  function handleUserUpdate(data) {
    parseUserData({
      username: localUser.name,
      users: data.users,
    }, true);
  }

  titleSuffix.set(`Game ${roomID}`);

  onMount(() => {
    const { username, ...rest } = JSON.parse(window.sessionStorage.getItem(roomID) || '{}');
    adminInstructionsShown = rest.adminInstructionsShown;

    window.socketConnected.then(() => {
      window.socket.on(WS_MSG__ENTER_ROOM, handleEnteringRoom);
      window.socket.on(WS_MSG__CHECK_USERNAME, handleUsernameCheck);
      window.socket.on(WS_MSG__USER_JOINED, handleUserJoin);
      window.socket.on(WS_MSG__USER_UPDATE, handleUserUpdate);

      window.socket.emit(WS_MSG__ENTER_ROOM, { roomID, username });
    });
  });
</script>

<div class="page">
  {#if mounted}
    {#if roomData}
      <div
        class="users-ui"
        class:is--admin={!!userClickHandler}
        on:click={userClickHandler}
      >
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
      {#if showAdminInstructions}
        <Modal class="admin-instructions">
          <p>
            Congrats! You're the MC of this game, so you're running the game. When
            starting a new CAH game it's up to the group to choose the Card Czar.
            Y'all can do that via the typical <q>Who was the last to poop?</q>
            question, or by what ever means you choose.
          </p>
          <p>
            Once the Czar's been chosen, you just have to click on that User and
            choose <q>{MSG__SET_CZAR}</q>. Once you do so, the game will start.
          </p>
          <button 
            type="button"
            on:click={closeAdminInstructions}
            bind:this={closeAdminInstructionsBtnRef}
          >Close</button>
        </Modal>
      {/if}
      {#if showUserDataMenu}
        <Modal class="user-data-menu">
          <button
            type="button"
            on:click={setCzar}
            disabled={userData.czar}
          >{MSG__SET_CZAR}</button>
          <button
            type="button"
            on:click={setAdmin}
            disabled={userData.admin}
          >Make Admin</button>
          <button
            type="button"
            on:click={closeUserDataMenu}
          >Cancel</button>
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
