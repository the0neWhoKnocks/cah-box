<style>
  .wrapper {
    width: 100%;
    height: 100%;
    background: #eee;
    display: flex;
    flex-direction: column;
  }

  .top-nav {
    color: #ccc;
    margin-bottom: 1px;
    background: #000;
    display: flex;
    justify-content: flex-end;
  }
  .top-nav button {
    width: auto;
    color: #fff;
    line-height: 1em;
    padding: 0.25em 0.5em;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    outline: none;
  }
  .top-nav button:focus {
    box-shadow: 0px 0px 6px inset #fffcd5;
  }
  .top-nav button .icon {
    width: 1.5em;
    height: 1.5em;
    margin-left: 0.25em;
  }

  .game-ui {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
  }

  :global(.root .copyable-item.for--url .copyable-item__text) {
    max-width: 30vw;
  }
  :global(.root .copyable-item.for--code.copied::after) {
    font-size: 0.75em;
    justify-content: normal;
  }

  :global(.users-list) {
    width: 200px;
  }

  .czar-pending-msg {
    width: 100%;
    height: 100%;
    text-align: center;
    padding: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .czar-waiting-msg {
    margin-top: 1em;
  }

  .czar-pending-msg mark,
  :global(.czar-waiting-msg mark) {
    color: #fff;
    line-height: 1em;
    padding: 0.25em 0.5em;
    border-radius: 0.25em;
    background: black;
    display: inline-block;
  }

  :global(.modal.room-error .modal__body) {
    display: flex;
    flex-direction: column;
  }

  :global(body .modal.room-error .modal__body) {
    width: 440px;
    text-align: center;
    background: #ffffa9;
  }
  :global(body .modal.room-error button) {
    border: solid 1px;
    border-radius: 0.25em;
    background: #00ff95;
  }

  :global(body .modal.admin-instructions .modal__body) {
    width: 500px;
    font-size: 1.3em;
  }
  :global(body .modal.admin-instructions li) {
    margin: 0.5em 0;
  }

  :global(body .modal.user-data-menu .modal__body) {
    max-width: 400px;
  }
  :global(body .modal.user-data-menu button) {
    word-break: break-word;
  }
  :global(body .modal.user-data-menu button:not(:first-of-type)) {
    margin-top: 1em;
  }
  :global(body .modal.user-data-menu button q) {
    color: #ff00b1;
    background: transparent;
  }
  :global(body .modal.user-data-menu button:disabled q) {
    color: currentColor;
  }
  :global(body .modal.user-data-menu .help) {
    color: #666;
    font-size: 0.6em;
    padding: 0.25em 0.5em 0 0.5em;
  }

  :global(body .modal.points-awarded .modal__mask) {
    background: rgba(199, 199, 199, 0.85);
  }
  :global(body .modal.points-awarded .modal__body) {
    font-size: 1em;
    text-align: center;
    border: none;
    background: transparent;
  }
  :global(body .modal.points-awarded .points-awarded__msg) {
    padding: 0.75em;
    border: solid 1px;
    border-radius: 0.5em;
    margin-bottom: 1em;
    background: #fff;
  }
  :global(body .modal.points-awarded mark) {
    font-family: monospace;
    line-height: 1em;
    padding: 0 0.5em;
    background: transparent;
  }
  :global(body .modal.points-awarded .username) {
    max-width: 10.5em;
    font-size: 1.5em;
    font-weight: bold;
    word-break: break-all;
    display: inline-block;
  }
  :global(body .modal.points-awarded p) {
    font-size: 1.25em;
  }
  :global(body .modal.points-awarded .points) {
    border-radius: 1em;
    background-color: transparent;
  }
  :global(body .modal.points-awarded .card) {
    text-align: left;
  }
  :global(body .modal.points-awarded button) {
    padding: 1em;
    border-radius: 0.5em;
    border: solid 1px;
    margin-top: 1em;
    background-color: #fff;
    box-shadow: 0 0.1em;
  }

  :global(body .modal.game-menu .modal__body) {
    font-size: 1em;
  }
  :global(body .modal.game-menu section h3) {
    border-bottom: solid 1px;
  }
  :global(body .modal.game-menu .row) {
    display: flex;
  }
  :global(body .modal.game-menu .row:not(:first-of-type)) {
    margin-top: 0.75em;
  }
  :global(body .modal.game-menu .label) {
    width: 6em;
  }

  .cards {
    width: 100%;
    padding: 1em 1em 0 1em;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cards :global(.card) {
    flex-shrink: 0;
  }
  .cards .answers {
    max-width: 100%;
  }
  .cards .answers-wrapper {
    display: flex;
    overflow: auto;
    padding: 0.5em 1em;
  }
  .cards .user-cards-wrapper {
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  .cards .cards-nav {
    position: absolute;
    top: 0.25em;
    right: 0;
    z-index: 1;
  }
  .cards .cards-nav button {
    border: solid 1px #000;
    border-radius: 0.25em;
    padding: 0.5em 0.75em;
    background: #fff;
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
    justify-content: space-between;
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
    width: 49%;
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

  @media (max-width: 500px) {
    :global(.users-list) {
      width: 100px;
      font-size: 0.75em;
    }

    .top-nav {
      font-size: 0.7em;
    }
    .top-nav button .icon {
      width: 1.25em;
      height: 1.25em;
      margin-top: -0.05em;
    }

    .cards .answers :global(.card),
    .cards .user-cards-wrapper :global(.card) {
      font-size: 1em;
    }
  }
  @media (max-width: 849px) {
    .cards {
      padding-left: 2em;
    }
    .cards .answers :global(.card) {
      box-shadow: 0 2px 8px 0px rgba(0, 0, 0, 0.5);
    }
    .cards .answers :global(.card:not(:first-child)) {
      margin-top: -0.5em;
    }
    .cards .answers-wrapper {
      max-height: 90vh;
      padding: 1em 0.5em;
      flex-direction: column;
    }
    .cards .answers-wrapper.displaying-users-cards {
      max-height: 60vh;
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
      font-size: 1em;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .black-card-wrapper nav .pick-answer-btn {
      margin-top: 2em;
    }
  }
  @media (min-width: 850px) {
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
  import {
    WS__MSG_TYPE__ANSWER_REVIEW_STATE_UPDATED,
    WS__MSG_TYPE__CARD_SELECTION_TOGGLED,
    WS__MSG_TYPE__CARD_SWAPPED,
    WS__MSG_TYPE__CARDS_DEALT,
    WS__MSG_TYPE__CARDS_SUBMITTED,
    WS__MSG_TYPE__CHOSE_ANSWER,
    WS__MSG_TYPE__DEAL_CARDS,
    WS__MSG_TYPE__JOIN_GAME,
    WS__MSG_TYPE__POINTS_AWARDED,
    WS__MSG_TYPE__REMOVE_USER_FROM_ROOM,
    WS__MSG_TYPE__ROOM_DESTROYED,
    WS__MSG_TYPE__SERVER_DOWN,
    WS__MSG_TYPE__SET_ADMIN,
    WS__MSG_TYPE__SET_ANSWER_REVIEW_STATE,
    WS__MSG_TYPE__SET_CZAR,
    WS__MSG_TYPE__SUBMIT_CARDS,
    WS__MSG_TYPE__SWAP_CARD,
    WS__MSG_TYPE__TOGGLE_CARD_SELECTION,
    WS__MSG_TYPE__USER_DISCONNECTED,
    WS__MSG_TYPE__USER_ENTERED_ROOM,
    WS__MSG_TYPE__USER_JOINED,
    WS__MSG_TYPE__USER_LEFT_ROOM,
    WS__MSG_TYPE__USER_REMOVED,
    WS__MSG_TYPE__USER_UPDATE,
  } from '../../../../constants';
  import { title, titleSuffix } from '../../../store';
  import GameEntry from '../../../components/GameEntry.svelte';
  import Modal from '../../../components/Modal.svelte';
  import addSocketListeners from '../../../utils/addSocketListeners';
  import Card from './Card.svelte';
  import Copyable from './Copyable.svelte';
  import EnterUsername from './EnterUsername.svelte';
  import UsersList from './UsersList.svelte';
  
  export let roomID;

  const MSG__SET_CZAR = 'Make <User> the Czar';
  const ACTION__ANSWER_REVIEW_STATE_UPDATED = 'answerReviewStateUpdated';
  const ACTION__CARD_SELECTION_TOGGLED = 'cardSelectionToggled';
  const ACTION__CARD_SWAPPED = 'cardSwapped';
  const ACTION__CARDS_DEALT = 'cardsDealt';
  const ACTION__CARDS_SUBMITTED = 'cardsSubmitted';
  const ACTION__USER_DISCONNECTED = 'userDisconnected';
  const ACTION__USER_ENTERED_ROOM = 'userEnteredRoom';
  const ACTION__USER_JOINED = 'userJoined';
  const ACTION__USER_LEFT_ROOM = 'userLeftRoom';
  const ACTION__USER_REMOVED = 'userRemoved';
  const ACTION__USER_UPDATE = 'userUpdate';
  const sessionData = JSON.parse(window.sessionStorage.getItem(roomID) || '{}');
  let adminInstructionsShown = sessionData.adminInstructionsShown;
  let blackCard;
  let closeAdminInstructionsBtnRef;
  let czarSelected = false;
  let localUser = { name: sessionData.username };
  let minimumNumberOfPlayersJoined = false;
  let room;
  let showAdminInstructions = false;
  let showUserCards = false;
  let showUserDataMenu = false;
  let socketConnected = true;
  let socketConnectedAtLeastOnce = true;
  let userClickHandler;
  let userData;
  let users = [];
  let czarWaitingMsg = '';
  let showPointsAwarded = false;
  let pointsAwardedData = {};
  let roomCheckComplete = false;
  let gameMC;
  let swappingCards = false;
  let showGameMenu = false;

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
        
        const user = users.filter(({ admin, czar, name }) => {
          if (admin) gameMC = name;
          if (czar) someoneIsCzar = true;
          return name === localUser.name;
        })[0];

        if (user) localUser = { ...user };
        else localUser = {};
        
        czarSelected = someoneIsCzar;
      }

      if (action === ACTION__USER_ENTERED_ROOM) {
        roomCheckComplete = true;
        updateTurnProps();
      }
      else if (action === ACTION__USER_LEFT_ROOM) {
        updateTurnProps();
      }
      else if (action === ACTION__CARD_SWAPPED) {
        swappingCards = false;
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
        (
          localUser.czar
          || localUser.cardsSubmitted
        )
        && room.submittedCards.length < (users.length - 1)
      ) {
        const names = users.filter(({ cardsSubmitted, czar }) => !czar && !cardsSubmitted);
        const multiple = names.length > 1;
        const answer = multiple ? 'answers' : 'answer';
        const formattedNames = names.reduce((str, { name }, ndx) => {
          let prefix = '';
          let suffix = multiple ? ', ' : '';
          if (multiple && ndx === names.length - 1) {
            prefix = ' and ';
            suffix = '';
          }
          return `${str}${prefix}<mark>${name}</mark>${suffix}`;
        }, '');
        czarWaitingMsg = `Waiting for ${formattedNames} to submit their ${answer}.`;
      }
      else if (czarWaitingMsg) {
        czarWaitingMsg = '';
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

  function closeAdminInstructions() {
    showAdminInstructions = false;
  }

  function openUserDataMenu(username) {
    userData = users.filter(({ name }) => name === username)[0];
    showUserDataMenu = true;
  }

  function closeUserDataMenu() {
    showUserDataMenu = false;
  }

  function handleUserDataMenuClose() {
    userData = undefined;
  }

  function openGameMenu() {
    showGameMenu = true;
  }
  function closeGameMenu() {
    showGameMenu = false;
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

  function removeUserFromGame(ev) {
    const { username } = ev.currentTarget.dataset;
    window.clientSocket.emit(WS__MSG_TYPE__REMOVE_USER_FROM_ROOM, { admin: localUser.name, roomID, username });
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
    roomCheckComplete = true;
    window.sessionStorage.removeItem(roomID);
  }

  function handlePointsAwarded({ answer, blackCard, name, points }) {
    const p = (points > 1) ? 'points' : 'point';
    const msg = `<mark class="username">${name}</mark><p>got <mark class="points">${points}</mark> ${p} for</p>`;
    showPointsAwarded = true;
    pointsAwardedData = { answer, blackCard, msg };
  }
  function closePointsAwarded() {
    showPointsAwarded = false;
  }
  function handlePointsAwardedClose() {
    pointsAwardedData = {};
  }

  function handleUsernameSuccess(username) {
    localUser.name = username;
    window.clientSocket.emit(WS__MSG_TYPE__JOIN_GAME, { roomID, username });
    window.sessionStorage.setItem(roomID, JSON.stringify({ username }));
  }

  function toggleCardSwap() {
    swappingCards = !swappingCards;
  }

  function handleSwapClick(cardNdx) {
    window.clientSocket.emit(WS__MSG_TYPE__SWAP_CARD, {
      cardNdx,
      roomID,
      username: localUser.name,
    });
  }

  titleSuffix.set(`Game ${roomID}`);

  $: minimumNumberOfPlayersJoined = users.length > 1;

  addSocketListeners({
    [WS__MSG_TYPE__ANSWER_REVIEW_STATE_UPDATED]: updateGameState(ACTION__ANSWER_REVIEW_STATE_UPDATED),
    [WS__MSG_TYPE__CARD_SELECTION_TOGGLED]: updateGameState(ACTION__CARD_SELECTION_TOGGLED),
    [WS__MSG_TYPE__CARD_SWAPPED]: updateGameState(ACTION__CARD_SWAPPED),
    [WS__MSG_TYPE__CARDS_DEALT]: updateGameState(ACTION__CARDS_DEALT),
    [WS__MSG_TYPE__CARDS_SUBMITTED]: updateGameState(ACTION__CARDS_SUBMITTED),
    [WS__MSG_TYPE__POINTS_AWARDED]: handlePointsAwarded,
    [WS__MSG_TYPE__ROOM_DESTROYED]: handleRoomDestruction,
    [WS__MSG_TYPE__SERVER_DOWN]: handleServerDisconnect,
    [WS__MSG_TYPE__USER_DISCONNECTED]: updateGameState(ACTION__USER_DISCONNECTED),
    [WS__MSG_TYPE__USER_ENTERED_ROOM]: updateGameState(ACTION__USER_ENTERED_ROOM),
    [WS__MSG_TYPE__USER_JOINED]: updateGameState(ACTION__USER_JOINED),
    [WS__MSG_TYPE__USER_LEFT_ROOM]: updateGameState(ACTION__USER_LEFT_ROOM),
    [WS__MSG_TYPE__USER_REMOVED]: updateGameState(ACTION__USER_REMOVED),
    [WS__MSG_TYPE__USER_UPDATE]: updateGameState(ACTION__USER_UPDATE),
  });

  window.clientSocket.emit(WS__MSG_TYPE__USER_ENTERED_ROOM, {
    roomID,
    username: sessionData.username,
  });
</script>

<svelte:head>
  <title>{`${$title}${($title && $titleSuffix) ? ' | ' : ''}${$titleSuffix ? $titleSuffix : ''}`}</title>
</svelte:head>

<div class="wrapper">
  {#if socketConnected}
    {#if room}
      <nav class="top-nav">
        <button on:click={openGameMenu}>
          Menu
          <svg class="icon">
            <use
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xlink:href="#ui-icon__menu"
            ></use>
          </svg>
        </button>
      </nav>

      <div class="game-ui">
        <UsersList
          isAdmin={localUser.admin}
          localUsername={localUser.name}
          onUserClick={userClickHandler}
          users={users}
        />

        {#if localUser.cards}
          {#if (localUser.cards.length && czarSelected)}
            <div class="cards">
              <div class="answers">
                <div
                  class="answers-wrapper"
                  class:displaying-users-cards={showUserCards}
                >
                  <div class="black-card-wrapper">
                    <Card type="black" text={blackCard} answer={room.blackCardAnswer.cards} />
                    {#if czarWaitingMsg}
                      <div class="czar-waiting-msg">{@html czarWaitingMsg}</div>
                    {/if}
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
                  {#if localUser.points && !localUser.maxCardsSelected}
                    <nav class="cards-nav">
                      <button on:click={toggleCardSwap}>
                        {#if swappingCards}
                          Cancel Card Swap
                        {:else}
                          Swap Card
                        {/if}
                      </button>
                    </nav>
                  {/if}
                  
                  <div class="user-cards" class:disabled={localUser.maxCardsSelected}>
                    {#each localUser.cards as { ndx, selected, text }}
                      <Card
                        {ndx}
                        onClick={handleCardSelectionToggle}
                        onSwapClick={handleSwapClick}
                        {selected}
                        {text}
                        swappable={swappingCards}
                      />
                    {/each}
                  </div>
    
                  <div class="sep is--btm"></div>
                </div>
              {/if}
            </div>
          {:else}
            <div class="czar-pending-msg">
              <p>
                {#if localUser.admin}
                  You need to pick the Card Czar.
                  <br>
                  To do so, just click on a User in the side menu.
                {:else}
                  Waiting for <mark>{gameMC}</mark> to pick the Card Czar.
                {/if}
              </p>
            </div>
          {/if}
        {/if}
      </div>
      
      <EnterUsername
        onUsernameSuccess={handleUsernameSuccess}
        open={!localUser.name}
        roomID={roomID}
      />

      <Modal
        class="admin-instructions"
        focusRef={closeAdminInstructionsBtnRef}
        open={showAdminInstructions}
      >
        <p>
          Congrats! You're the MC, so you're running the game. In order for
          others to join, just send them
        </p>
        <ul>
          <li>this URL: <Copyable class="for--url" text={window.location.href} /></li>
          <li>or this code: <Copyable class="for--code" text={roomID} /></li>
        </ul>
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
      
      <Modal class="user-data-menu" onClose={handleUserDataMenuClose} open={showUserDataMenu}>
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
          on:click={removeUserFromGame}
          disabled={userData.admin}
          data-username={userData.name}
        >{@html `Remove <q>${userData.name}</q> from game`}</button>
        <button
          type="button"
          on:click={closeUserDataMenu}
        >Cancel</button>
      </Modal>
      
      <Modal class="points-awarded" onClose={handlePointsAwardedClose} open={showPointsAwarded}>
        <div class="points-awarded__msg">
          {@html pointsAwardedData.msg}
        </div>
        <Card type="black" text={pointsAwardedData.blackCard} answer={pointsAwardedData.answer} />
        <button on:click={closePointsAwarded}>Close</button>
      </Modal>
      
      <Modal class="game-menu" onMaskClick={closeGameMenu} open={showGameMenu}>
        <section>
          <h3>Copy</h3>
          <div class="row">
            <div class="label">Game URL:</div><Copyable class="for--url" onCopy={closeGameMenu} text={window.location.href} />
          </div>
          <div class="row">
            <div class="label">Game Code:</div><Copyable class="for--code" onCopy={closeGameMenu} text={roomID} />
          </div>
        </section>
      </Modal>
    {/if}

    <Modal class="room-error" open={roomCheckComplete && !room}>
      Sorry, it looks like this room doesn't exist anymore.
      <GameEntry />
    </Modal>
  {/if}
  
  <Modal class="room-error" open={!socketConnected && socketConnectedAtLeastOnce}>
    Sorry, it looks like the game has lost connection to the Server. You can 
    try refreshing the page, but it's likely the Server went down for 
    maintainence and you'll have to start a new game.
  </Modal>
</div>
