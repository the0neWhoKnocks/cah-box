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
    background: #eee;
    display: flex;
  }

  .users-ui {
    width: 130px;
    background: #fff;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .users-ui :global(.user) {
    margin: 0.25em 0;
  }
  .users-ui.is--admin :global(.user:hover) {
    cursor: pointer;
    background: rgba(255, 255, 0, 0.5);
  }
  @media (min-width: 1024px) {
    .users-ui {
      width: 200px;
    }
  }

  .czar-pending-msg {
    width: 100%;
    height: 100%;
    padding: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
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
    max-width: 35vw;
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

  :global(.modal.user-data-menu .modal__body) {
    max-width: 400px;
  }
  :global(.modal.user-data-menu button) {
    word-break: break-word;
  }
  :global(.modal.user-data-menu button:not(:first-of-type)) {
    margin-top: 1em;
  }
  :global(.modal.user-data-menu button q) {
    color: #ff00b1;
    background: transparent;
  }
  :global(.modal.user-data-menu button:disabled q) {
    color: currentColor;
  }
  :global(.modal.user-data-menu .help) {
    color: #666;
    font-size: 0.6em;
    padding: 0.25em 0.5em 0 0.5em;
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

  .cards {
    width: 100%;
    padding: 3em 1em 1em 1em;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cards :global(.card) {
    flex-shrink: 0;
  }
  .cards .user-cards {
    width: 100%;
    height: 100%;
    padding-top: 2em;
    padding-bottom: 2em;
    margin-top: -2em;
    margin-bottom: -3em;
    overflow: auto;
  }
  .cards .user-cards.disabled :global(.card) {
    opacity: 0.25;
    pointer-events: none;
  }
  .cards .sep {
    width: 100%;
    height: 6em;
    position: relative;
    pointer-events: none;
  }
  .cards .sep.is--top {
    margin-top: 1em;
    background: linear-gradient(180deg, #eeeeee 50%, transparent);
  }
  .cards .sep.is--btm {
    background: linear-gradient(0deg, #eeeeee 20%, transparent);
  }
  .cards .sep.is--top::after {
    content: '';
    width: 100%;
    border-top: dashed 2px #999;
    position: absolute;
    top: 25%;
    left: 0;
  }
  @media (max-width: 1023px) {
    .cards .answers {
      width: 100%;
    }
    .cards .answers :global(.card) {
      box-shadow: 0 2px 8px 0px rgba(0, 0, 0, 0.5);
    }
    .cards .answers :global(.card:not(:first-child)) {
      margin-top: -0.5em;
    }
    .cards .user-cards :global(.card:not(:first-child)) {
      margin-top: 0.5em;
    }
  }
  @media (min-width: 1024px) {
    .cards .answers {
      display: flex;
      justify-content: center;
    }
    .cards .answers :global(.card) {
      box-shadow: 2px 0 8px 0px rgba(0, 0, 0, 0.5);
    }
    .cards .answers :global(.card:not(:first-child)) {
      margin-left: -0.5em;
    }
    .cards .user-cards {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .cards .user-cards :global(.card) {
      margin: 0.25em;
    }
  }

  .submit-cards-btn {
    max-width: 16em;
    margin-top: 2em;
    font-size: 1.2em;
    font-weight: bold;
    border: solid 1px;
    border-radius: 0.25em;
    background: #5df1db;
  }
</style>

<script>
  import { stores } from '@sapper/app';
  import { onMount } from 'svelte';
  import Card from '../../components/Card.svelte';
  import Modal from '../../components/Modal.svelte';
  import User from '../../components/User.svelte';
  import {
    WS_MSG__CARDS_DEALT,
    WS_MSG__CARDS_SUBMITTED,
    WS_MSG__CHECK_USERNAME,
    WS_MSG__DEAL_CARDS,
    WS_MSG__ENTER_ROOM,
    WS_MSG__JOIN_GAME,
    WS_MSG__SET_ADMIN,
    WS_MSG__SET_CZAR,
    WS_MSG__SUBMIT_CARDS,
    WS_MSG__USER_JOINED,
    WS_MSG__USER_UPDATE,
  } from '../../constants';
  import { titleSuffix } from '../../store';
  import createGame from '../../utils/createGame';
  
  const MSG__SET_CZAR = 'Make <User> the Czar';
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
  let minimumNumberOfPlayersJoined = false;
  let localCards = [];
  let blackCard;
  let requiredWhiteCardsCount;
  let selectedCards = [];
  let maxCardsSelected = false;
  let showUserCards = false;

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

    if (localUser) {
      if (update && !localUser.admin) userClickHandler = undefined;

      if (localUser.admin) userClickHandler = handleUserClick;

      // Add an index after cards are dealt to make manipulation easier.
      if (localUser.cards) localUser.cards.forEach((card, ndx) => { card.ndx = ndx; });
    }

    if (!adminInstructionsShown && localUser && localUser.admin) {
      showAdminInstructions = true;
      adminInstructionsShown = true;

      window.sessionStorage.setItem(roomID, JSON.stringify({
        adminInstructionsShown: true,
        username: localUser.name,
      }));
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
    
    window.socket.emit(WS_MSG__DEAL_CARDS, { roomID });
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

  function handleCardsDealt(data) {
    parseUserData({
      username: localUser.name,
      users: data.users,
    }, true);

    blackCard = data.blackCard;
    requiredWhiteCardsCount = data.requiredWhiteCardsCount;

    if (!localUser.czar) showUserCards = true;
  }

  function handleCardSelect(ndx) {
    const card = localUser.cards[ndx];

    if (!maxCardsSelected) {
      card.selected = true;
      selectedCards = [...selectedCards, card];
    }
    
    if (selectedCards.length === requiredWhiteCardsCount) maxCardsSelected = true;
  }

  function handleCardDeselect(ndx) {
    const card = localUser.cards[ndx];
    card.selected = false;

    selectedCards.splice(selectedCards.indexOf(card.text), 1);
    selectedCards = [...selectedCards];
    localUser.cards = [...localUser.cards];
    maxCardsSelected = false;
  }

  function handleSubmitCards() {
    window.socket.emit(WS_MSG__SUBMIT_CARDS, {
      cards: selectedCards.map(({ text }) => text),
      roomID,
      username: localUser.name,
    });
    showUserCards = false;
  }

  function handleCardsSubmitted(data) {
    parseUserData({
      username: localUser.name,
      users: data.users,
    }, true);

    if (localUser.czar) {
      if (Object.keys(data.submittedCards).length === (users.length - 1)) {
        console.log(data.submittedCards);
        alert('show answers');
      }
    }
  }

  titleSuffix.set(`Game ${roomID}`);

  $: minimumNumberOfPlayersJoined = users.length > 1;

  onMount(() => {
    const { username, ...rest } = JSON.parse(window.sessionStorage.getItem(roomID) || '{}');
    adminInstructionsShown = rest.adminInstructionsShown;

    window.socketConnected.then(() => {
      window.socket.on(WS_MSG__CARDS_DEALT, handleCardsDealt);
      window.socket.on(WS_MSG__CARDS_SUBMITTED, handleCardsSubmitted);
      window.socket.on(WS_MSG__CHECK_USERNAME, handleUsernameCheck);
      window.socket.on(WS_MSG__ENTER_ROOM, handleEnteringRoom);
      window.socket.on(WS_MSG__USER_JOINED, handleUserJoin);
      window.socket.on(WS_MSG__USER_UPDATE, handleUserUpdate);

      window.socket.emit(WS_MSG__ENTER_ROOM, { roomID, username });
    });
  });
</script>

<div class="wrapper">
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
        {#if localUser.cards.length}
          <div class="cards">
            <div class="answers">
              <Card type="black" text={blackCard} />
              {#if showUserCards}
                {#each selectedCards as { ndx, text }}
                  <Card {ndx} {text} onClick={handleCardDeselect} rotate />
                {/each}
              {/if}
            </div>

            {#if showUserCards}
              {#if maxCardsSelected}
                <button
                  class="submit-cards-btn"
                  on:click={handleSubmitCards}
                >
                  {@html `Submit Card${selectedCards.length > 1 ? 's' : ''}`}
                </button>
              {/if}

              <div class="sep is--top"></div>
              
              <div class="user-cards" class:disabled={maxCardsSelected}>
                {#each localUser.cards as { ndx, selected, text }}
                  <Card {ndx} {text} onClick={handleCardSelect} {selected} />
                {/each}
              </div>

              <div class="sep is--btm"></div>
            {/if}
          </div>
        {:else}
          <div class="czar-pending-msg">
            Waiting for the Card Czar to be chosen.
          </div>
        {/if}
        
        <div class="user-ui">
          <User {...localUser} />
        </div>
      {/if}

      {#if !localUser}
        <Modal focusRef={usernameInputRef}>
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
        <Modal
          class="admin-instructions"
          focusRef={closeAdminInstructionsBtnRef}
        >
          <p>
            Congrats! You're the MC of this game, so you're running the game. When
            starting a new CAH game it's up to the group to choose the Card Czar.
            Y'all can do that via the typical <q>Who was the last to poop?</q>
            question, or by what ever means you choose.
          </p>
          <p>
            Once the group's chosen the Czar, you just have to click on that
            User and choose <q>{MSG__SET_CZAR}</q>. Once you do so, the game
            will start.
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
            disabled={userData.czar || !minimumNumberOfPlayersJoined}
          >
            {@html MSG__SET_CZAR.replace('<User>', `<q>${userData.name}</q>`)}
          </button>
          {#if !minimumNumberOfPlayersJoined}
            <div class="help">
              There has to be at least 2 players before you can assign a Czar.
            </div>
          {/if}
          {#if userData.czar}
            <div class="help">
              You're already the Czar, yuh silly goose.
            </div>
          {/if}
          <button
            type="button"
            on:click={setAdmin}
            disabled={userData.admin}
          >{@html `Make <q>${userData.name}</q> the MC`}</button>
          {#if userData.admin}
            <div class="help">
              You're already the MC, yuh silly goose.
            </div>
          {/if}
          <button
            type="button"
            on:click={closeUserDataMenu}
          >Cancel</button>
        </Modal>
      {/if}
    {:else}
      <Modal class="room-error" focusRef={createGameBtnRef}>
        Sorry, it looks like this room doesn't exist anymore.
        <button on:click={createGame} bind:this={createGameBtnRef}>
          Click here to create a new game.
        </button>
      </Modal>
    {/if}
  {/if}
</div>
