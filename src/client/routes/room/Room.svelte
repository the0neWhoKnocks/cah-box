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
  .user-ui :global(.user:not(.is--admin):not(.is--czar) .user__icon),
  .user-ui :global(.user .user__points) {
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
    max-width: 300px;
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
    padding: 4em 1em 0 1em;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cards :global(.card) {
    flex-shrink: 0;
  }
  .cards .user-cards-wrapper {
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  .cards .user-cards {
    width: 100%;
    height: 100%;
    padding-top: 4em;
    padding-bottom: 4em;
    overflow: auto;
  }
  .cards .user-cards.disabled :global(.card) {
    opacity: 0.25;
    pointer-events: none;
  }
  .cards .sep {
    width: 100%;
    height: 6em;
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }
  .cards .sep.is--top {
    background: linear-gradient(180deg, #eeeeee 50%, transparent);
    top: 0;
  }
  .cards .sep.is--btm {
    background: linear-gradient(0deg, #eeeeee 20%, transparent);
    bottom: 0;
  }
  .cards .sep.is--top::after {
    content: '';
    width: 100%;
    border-top: dashed 2px #999;
    position: absolute;
    top: 25%;
    left: 0;
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

  .black-card-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .black-card-wrapper nav {
    width: 100%;
    margin-top: 1em;
    display: flex;
    flex-wrap: wrap;
  }
  .black-card-wrapper nav button {
    font-size: 1.2em;
    padding: 0.5em 1em;
    border: solid 1px #000;
    border-radius: 0.5em;
    background: #fff;
  }
  .black-card-wrapper nav button.hidden {
    display: none;
  }
  .black-card-wrapper nav .prev-btn,
  .black-card-wrapper nav .next-btn {
    width: 50%;
  }
  .black-card-wrapper nav .prev-btn {
    border-radius: 0.5em 0 0 0.5em;
  }
  .black-card-wrapper nav .next-btn {
    border-radius: 0 0.5em 0.5em 0;
  }
  .black-card-wrapper nav .pick-answer-btn {
    margin-top: 1em;
  }

  @media (max-width: 849px) {
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

    .black-card-wrapper {
      padding-bottom: 0.5em;
    }
    .black-card-wrapper :global(.card) {
      width: 100%;
    }
    .black-card-wrapper nav .prev-btn,
    .black-card-wrapper nav .next-btn {
      font-size: 4.5vw;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .black-card-wrapper nav .pick-answer-btn {
      margin-top: 2em;
    }

    :global(.root .modal .modal__body) {
      font-size: 1em;
    }
  }
  @media (min-width: 850px) {
    .users-ui {
      width: 200px;
    }

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
</style>

<script>
  import { onMount } from 'svelte';
  import {
    ERROR_CODE__NAME_TAKEN,
    ERROR_CODE__ROOM_DOES_NOT_EXIST,
    WS__MSG_TYPE__ANSWER_REVIEW_STATE_UPDATED,
    WS__MSG_TYPE__CARD_SELECTION_TOGGLED,
    WS__MSG_TYPE__CARDS_DEALT,
    WS__MSG_TYPE__CARDS_SUBMITTED,
    WS__MSG_TYPE__CHECK_USERNAME,
    WS__MSG_TYPE__CHOSE_ANSWER,
    WS__MSG_TYPE__DEAL_CARDS,
    WS__MSG_TYPE__USER_ENTERED_ROOM,
    WS__MSG_TYPE__JOIN_GAME,
    WS__MSG_TYPE__ROOM_DESTROYED,
    WS__MSG_TYPE__SERVER_DOWN,
    WS__MSG_TYPE__SET_ADMIN,
    WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE,
    WS__MSG_TYPE__SET_CZAR,
    WS__MSG_TYPE__SUBMIT_CARDS,
    WS__MSG_TYPE__TOGGLE_CARD_SELECTION,
    WS__MSG_TYPE__USER_JOINED,
    WS__MSG_TYPE__USER_LEFT_ROOM,
    WS__MSG_TYPE__USER_UPDATE,
  } from '../../../constants';
  import { title, titleSuffix } from '../../store';
  import Card from '../../components/Card.svelte';
  import Copyable from '../../components/Copyable.svelte';
  import Modal from '../../components/Modal.svelte';
  import User from '../../components/User.svelte';
  import createGame from '../../utils/createGame';
  
  const MSG__SET_CZAR = 'Make <User> the Czar';
  const ACTION__ANSWER_REVIEW_STATE_UPDATED = 'answerReviewStateUpdated';
  const ACTION__CARD_SELECTION_TOGGLED = 'cardSelectionToggled';
  const ACTION__CARDS_DEALT = 'cardsDealt';
  const ACTION__CARDS_SUBMITTED = 'cardsSubmitted';
  const ACTION__USER_ENTERED_ROOM = 'userEnteredRoom';
  const ACTION__USER_JOINED = 'userJoined';
  const ACTION__USER_LEFT_ROOM = 'userLeftRoom';
  const ACTION__USER_UPDATE = 'userUpdate';
  let adminInstructionsShown = false;
  let blackCard;
  let closeAdminInstructionsBtnRef;
  let createGameBtnRef;
  let czarSelected = false;
  let localUser = {};
  let minimumNumberOfPlayersJoined = false;
  let room;
  let showAdminInstructions = false;
  let showUserCards = false;
  let showUserDataMenu = false;
  let socketConnected = false;
  let socketConnectedAtLeastOnce = false;
  let userClickHandler;
  let userData;
  let usernameInputError;
  let usernameInputRef;
  let users = [];

  export let roomID;

  function handleJoinSubmit(ev) {
    ev.preventDefault();

    window.clientSocket.emit(WS__MSG_TYPE__CHECK_USERNAME, {
      roomID,
      username: usernameInputRef.value,
    });
  }

  function updateTurnProps() {
    if (room && room.blackCard) blackCard = room.blackCard;

    showUserCards = !localUser.czar && !localUser.cardsSubmitted;
  };

  function updateGameState(action) {
    return (data) => {
      if (data.room) room = data.room;

      if (room && room.users) users = [...room.users];
      
      if (users.length) {
        let someoneIsCzar = false;
        
        const user = users.filter(({ czar, name }) => {
          if (czar) someoneIsCzar = true;
          return name === localUser.name;
        })[0];

        if (user) localUser = { ...user };
        else localUser = {};
        
        czarSelected = someoneIsCzar;
      }

      if (action === ACTION__USER_ENTERED_ROOM) {
        updateTurnProps();
      }
      else if (action === ACTION__USER_LEFT_ROOM) {
        updateTurnProps();
      }

      userClickHandler = (localUser.admin) ? handleUserClick : undefined;
      
      if (localUser.admin && !adminInstructionsShown) {
        showAdminInstructions = true;
        adminInstructionsShown = true;

        window.sessionStorage.setItem(roomID, JSON.stringify({
          adminInstructionsShown: true,
          username: localUser.name,
        }));
      }

      if (
        localUser.czar
        && room.submittedCards.length === (users.length - 1)
        && !localUser.reviewingAnswers
      ) {
        window.clientSocket.emit(WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE, {
          roomID,
          state: { reviewingAnswers: true },
          username: localUser.name,
        });

        if (
          !document.hasFocus()
          && window.Notification.permission === 'granted'
        ) {
          const n = new window.Notification('All Users have submitted answers');
          setTimeout(() => { n.close(); }, 3000);

          const origTitle = $title;
          const origTitleSuffix = $titleSuffix;
          title.set('');
          const i = setInterval(() => {
            if (document.hasFocus()) {
              clearInterval(i);
              title.set(origTitle);
              titleSuffix.set(origTitleSuffix);
            }
            else {
              if ($titleSuffix === origTitle) titleSuffix.set('Come Back!');
              else titleSuffix.set(origTitle);
            }
          }, 500);
        }
      }

      switch (action) {
        case ACTION__CARDS_DEALT:
        case ACTION__CARDS_SUBMITTED: {
          updateTurnProps();
          break;
        }

        case ACTION__USER_JOINED: {
          if (room && room.blackCard) {
            window.clientSocket.emit(WS__MSG_TYPE__DEAL_CARDS, { roomID });

            if (localUser.reviewingAnswers) resetAnswersReview();
          }

          break;
        }
      }
    };
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
    else {
      localUser.name = username;
      window.clientSocket.emit(WS__MSG_TYPE__JOIN_GAME, { roomID, username });
      window.sessionStorage.setItem(roomID, JSON.stringify({ username }));
    }
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

  function chooseAnswer() {
    window.clientSocket.emit(WS__MSG_TYPE__CHOSE_ANSWER, { roomID });
    resetAnswersReview();
  }

  function setCzar() {
    window.clientSocket.emit(WS__MSG_TYPE__SET_CZAR, {
      roomID,
      username: userData.name,
    });
    closeUserDataMenu();
    
    window.clientSocket.emit(WS__MSG_TYPE__DEAL_CARDS, { newRound: true, roomID });
  }

  function setAdmin() {
    window.clientSocket.emit(WS__MSG_TYPE__SET_ADMIN, {
      roomID,
      username: userData.name,
    });
    closeUserDataMenu();
  }

  function handleCardSelectionToggle(ndx) {
    window.clientSocket.emit(WS__MSG_TYPE__TOGGLE_CARD_SELECTION, {
      ndx,
      roomID,
      username: localUser.name,
    });
  }

  function handleSubmitCards() {
    window.clientSocket.emit(WS__MSG_TYPE__SUBMIT_CARDS, {
      roomID,
      username: localUser.name,
    });
  }

  function resetAnswersReview() {
    window.clientSocket.emit(WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE, {
      roomID,
      state: {
        reviewNdx: 0,
        reviewingAnswers: false,
        startedReviewingAnswers: false,
      },
      username: localUser.name,
    });
  }

  function reviewPreviousAnswer() {
    const reviewNdx = localUser.reviewNdx - 1;
    window.clientSocket.emit(WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE, {
      answer: room.submittedCards[reviewNdx],
      roomID,
      state: { reviewNdx },
      username: localUser.name,
    });
  }

  function reviewNextAnswer() {
    const reviewNdx = localUser.reviewNdx + 1;
    window.clientSocket.emit(WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE, {
      answer: room.submittedCards[reviewNdx],
      roomID,
      state: { reviewNdx },
      username: localUser.name,
    });
  }

  function startedReviewingAnswers() {
    window.clientSocket.emit(WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE, {
      answer: room.submittedCards[localUser.reviewNdx],
      roomID,
      state: { startedReviewingAnswers: true },
      username: localUser.name,
    });
  }

  function handleServerDisconnect() {
    window.clientSocket.disconnect();
    socketConnected = false;
  }

  function handleRoomDestruction() {
    room = undefined;
  }

  titleSuffix.set(`Game ${roomID}`);

  $: minimumNumberOfPlayersJoined = users.length > 1;

  onMount(() => {
    const { username, ...rest } = JSON.parse(window.sessionStorage.getItem(roomID) || '{}');
    adminInstructionsShown = rest.adminInstructionsShown;
    localUser.name = username;

    window.socketConnected.then(() => {
      socketConnectedAtLeastOnce = true;
      socketConnected = true;

      window.clientSocket.on(WS__MSG_TYPE__ANSWER_REVIEW_STATE_UPDATED, updateGameState(ACTION__ANSWER_REVIEW_STATE_UPDATED));
      window.clientSocket.on(WS__MSG_TYPE__CARD_SELECTION_TOGGLED, updateGameState(ACTION__CARD_SELECTION_TOGGLED));
      window.clientSocket.on(WS__MSG_TYPE__CARDS_DEALT, updateGameState(ACTION__CARDS_DEALT));
      window.clientSocket.on(WS__MSG_TYPE__CARDS_SUBMITTED, updateGameState(ACTION__CARDS_SUBMITTED));
      window.clientSocket.on(WS__MSG_TYPE__CHECK_USERNAME, handleUsernameCheck);
      window.clientSocket.on(WS__MSG_TYPE__ROOM_DESTROYED, handleRoomDestruction);
      window.clientSocket.on(WS__MSG_TYPE__SERVER_DOWN, handleServerDisconnect);
      window.clientSocket.on(WS__MSG_TYPE__USER_ENTERED_ROOM, updateGameState(ACTION__USER_ENTERED_ROOM));
      window.clientSocket.on(WS__MSG_TYPE__USER_JOINED, updateGameState(ACTION__USER_JOINED));
      window.clientSocket.on(WS__MSG_TYPE__USER_LEFT_ROOM, updateGameState(ACTION__USER_LEFT_ROOM));
      window.clientSocket.on(WS__MSG_TYPE__USER_UPDATE, updateGameState(ACTION__USER_UPDATE));

      window.clientSocket.emit(WS__MSG_TYPE__USER_ENTERED_ROOM, { roomID, username });

      window.Notification.requestPermission();
    });
  });
</script>

<div class="wrapper">
  {#if socketConnected}
    {#if room}
      <div
        class="users-ui"
        class:is--admin={!!userClickHandler}
        on:click={userClickHandler}
      >
        {#each users as { admin, cardsSubmitted, czar, name, points }}
          <User
            class="user"
            admin={admin}
            cardsSubmitted={cardsSubmitted}
            czar={czar}
            name={name}
            points={points}
          />
        {/each}
      </div>

      {#if localUser.cards}
        {#if (localUser.cards.length && czarSelected)}
          <div class="cards">
            <div class="answers">
              <div class="black-card-wrapper">
                <Card type="black" text={blackCard} answer={room.blackCardAnswer.cards} />
                {#if localUser.reviewingAnswers}
                  <nav>
                    <button
                      class="prev-btn"
                      class:hidden={!localUser.startedReviewingAnswers || room.submittedCards.length < 2}
                      disabled={localUser.reviewNdx === 0}
                      on:click={reviewPreviousAnswer}
                    >Previous</button>
                    <button
                      class="next-btn"
                      class:hidden={!localUser.startedReviewingAnswers || room.submittedCards.length < 2}
                      disabled={localUser.reviewNdx === room.submittedCards.length - 1}
                      on:click={reviewNextAnswer}
                    >Next</button>
                    <button
                      class="show-answer-btn"
                      class:hidden={localUser.startedReviewingAnswers}
                      on:click={startedReviewingAnswers}
                    >Show Answer</button>
                    <button
                      class="pick-answer-btn"
                      disabled={!localUser.startedReviewingAnswers}
                      on:click={chooseAnswer}
                    >Pick Answer</button>
                  </nav>
                {/if}
              </div>
              {#if showUserCards}
                {#each localUser.selectedCards as { ndx, text } (`answer_${ndx}`)}
                  <Card {ndx} {text} onClick={handleCardSelectionToggle} rotate />
                {/each}
              {/if}
            </div>

            {#if showUserCards}
              {#if localUser.maxCardsSelected}
                <button
                  class="submit-cards-btn"
                  on:click={handleSubmitCards}
                >
                  {@html `Submit Card${localUser.selectedCards.length > 1 ? 's' : ''}`}
                </button>
              {/if}
              
              <div class="user-cards-wrapper">
                <div class="sep is--top"></div>
                
                <div class="user-cards" class:disabled={localUser.maxCardsSelected}>
                  {#each localUser.cards as { ndx, selected, text }}
                    <Card {ndx} {text} onClick={handleCardSelectionToggle} {selected} />
                  {/each}
                </div>
  
                <div class="sep is--btm"></div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="czar-pending-msg">
            Waiting for the Card Czar to be chosen.
          </div>
        {/if}
        
        <div class="user-ui">
          <User
            admin={localUser.admin}
            cardsSubmitted={localUser.cardsSubmitted}
            czar={localUser.czar}
            name={localUser.name}
            points={localUser.points}
          />
        </div>
      {/if}

      {#if !localUser.name}
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
            Congrats! You're the MC, so you're running the game. In order for
            others to join, just send them this URL:
            <Copyable text={window.location.href} />
          </p>
          <p>
            When starting a new CAH game it's up to the group to choose the Card
            Czar. Y'all can do that via the typical <q>Who was the last to poop?</q>
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
  {:else if !socketConnected && socketConnectedAtLeastOnce}
    <Modal class="room-error">
      Sorry, it looks like the game has lost connection to the Server. You can 
      try refreshing the page, but it's likely the Server went down for 
      maintainence and you'll have to start a new game.
    </Modal>
  {/if}
</div>
