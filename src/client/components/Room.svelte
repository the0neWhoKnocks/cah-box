<script>
  import { tick } from 'svelte';
  import {
    WS__MSG__ANSWER_REVIEW_STATE_UPDATED,
    WS__MSG__CARD_SELECTION_TOGGLED,
    WS__MSG__CARD_SWAPPED,
    WS__MSG__CARDS_DEALT,
    WS__MSG__CARDS_SUBMITTED,
    WS__MSG__CHOSE_ANSWER,
    WS__MSG__DEAL_CARDS,
    WS__MSG__JOIN_GAME,
    WS__MSG__POINTS_AWARDED,
    WS__MSG__REMOVE_USER_FROM_ROOM,
    WS__MSG__ROOM_DESTROYED,
    WS__MSG__SERVER_DOWN,
    WS__MSG__SET_ANSWER_REVIEW_STATE,
    WS__MSG__SET_CZAR,
    WS__MSG__SET_HOST,
    WS__MSG__SUBMIT_CARDS,
    WS__MSG__SWAP_CARD,
    WS__MSG__TOGGLE_CARD_SELECTION,
    WS__MSG__USER_DISCONNECTED,
    WS__MSG__USER_ENTERED_ROOM,
    WS__MSG__USER_JOINED,
    WS__MSG__USER_LEFT_ROOM,
    WS__MSG__USER_REMOVED,
    WS__MSG__USER_UPDATE,
  } from '../../constants';
  import addSocketListeners from '../utils/addSocketListeners';
  import getRelativeCoords from '../utils/getRelativeCoords';
  import { title, titleSuffix } from '../store';
  import Card from './Card.svelte';
  import Copyable from './Copyable.svelte';
  import Dialog from './Dialog.svelte';
  import EnterUsername from './EnterUsername.svelte';
  import GameEntry from './GameEntry.svelte';
  import PointsAwarded from './PointsAwarded.svelte';
  import SVG, {
    ICON__CZAR,
    ICON__HOST,
    ICON__MENU,
    ICON__REMOVE_USER,
  } from './SVG.svelte';
  import UsersList from './UsersList.svelte';
  
  let { roomID } = $props();

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
  let answerCardsAnimRef = $state();
  let answersWrapperRef = $state();
  let blackCard = $state.raw();
  let closeHostInstructionsBtnRef = $state();
  let czarSelected = $state.raw(false);
  let hostInstructionsShown = sessionData.hostInstructionsShown;
  let localUser = $state.raw({ name: sessionData.username });
  let room = $state.raw();
  let showHostInstructions = $state.raw(false);
  let showUserCards = $state.raw(false);
  let showUserDataMenu = $state.raw(false);
  let socketConnected = $state.raw(true);
  let socketConnectedAtLeastOnce = true;
  let userCardsAnimRef = $state();
  let userCardsRef = $state();
  let userClickHandler = $state();
  let userData = $state.raw();
  let users = $state.raw([]);
  let czarWaitingMsg = $state.raw('');
  let pointsAwardedIsOpen = $state.raw(false);
  let pointsAwardedData = $state.raw({});
  let roomCheckComplete = $state.raw(false);
  let gameHost = $state.raw();
  let swappingCards = $state.raw(false);
  let showGameMenu = $state.raw(false);
  
  let minimumNumberOfPlayersJoined = $derived(users.length > 1);
  
  function updateTurnProps() {
    if (room && room.blackCard) blackCard = room.blackCard;

    showUserCards = !localUser.czar && !localUser.cardsSubmitted;
  }

  function updateGameState(action) {
    return (data) => {
      let prevLocalUser = {};
      
      if (data.room) room = data.room;

      if (room && room.users) users = [...room.users];
      
      if (users.length) {
        let someoneIsCzar = false;
        
        const user = users.filter(({ czar, host, name }) => {
          if (host) gameHost = name;
          if (czar) someoneIsCzar = true;
          return name === localUser.name;
        })[0];

        if (user) {
          prevLocalUser = { ...localUser };
          localUser = { ...user };
        }
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
      else if (action === ACTION__CARD_SELECTION_TOGGLED) {
        const getCard = (cardsA, cardsB) => {
          for (let a=0; a<cardsA.length; a++) {
            const card = cardsA[a];
            
            if (!cardsB.length) return card;
            else {
              const { ndx } = card;
              const ndxs = cardsB.map((c) => c.ndx);
              if (!ndxs.includes(ndx)) return card;
            }
          }
        };
        
        if (localUser.selectedCards.length > prevLocalUser.selectedCards.length) {
          const { ndx } = getCard(localUser.selectedCards, prevLocalUser.selectedCards);
          animateCardSelection('added', ndx);
        }
        else {
          const { ndx } = getCard(prevLocalUser.selectedCards, localUser.selectedCards);
          animateCardSelection('removed', ndx);
        }
      }

      userClickHandler = (localUser.host) ? handleUserClick : undefined;
      
      if (localUser.host && !hostInstructionsShown) {
        showHostInstructions = true;
        hostInstructionsShown = true;

        window.sessionStorage.setItem(roomID, JSON.stringify({
          hostInstructionsShown: true,
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
        window.clientSocket.emit(WS__MSG__SET_ANSWER_REVIEW_STATE, {
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
            window.clientSocket.emit(WS__MSG__DEAL_CARDS, { roomID });

            if (localUser.reviewingAnswers) resetAnswersReview();
          }

          break;
        }
      }
    };
  }

  function closeHostInstructions() {
    showHostInstructions = false;
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
    window.clientSocket.emit(WS__MSG__CHOSE_ANSWER, { roomID });
    resetAnswersReview();
  }

  function setCzar() {
    window.clientSocket.emit(WS__MSG__SET_CZAR, {
      roomID,
      username: userData.name,
    });
    closeUserDataMenu();
    
    window.clientSocket.emit(WS__MSG__DEAL_CARDS, { newRound: true, roomID });
  }

  function setHost() {
    window.clientSocket.emit(WS__MSG__SET_HOST, {
      roomID,
      username: userData.name,
    });
    closeUserDataMenu();
  }

  function removeUserFromGame(ev) {
    const { username } = ev.currentTarget.dataset;
    window.clientSocket.emit(WS__MSG__REMOVE_USER_FROM_ROOM, { host: localUser.name, roomID, username });
    closeUserDataMenu();
  }
  
  async function animateCardSelection(action, ndx) {
    const uBounds = userCardsAnimRef.getBoundingClientRect();
    const centerX = uBounds.width / 2;
    let aCard, aCardRot, aCoords, origACard, origACardTrans, origUCard, origUCardTrans, uCard, uCoords;
    
    const setACard = () => {
      origACard = answersWrapperRef.querySelector(`.card.is--white[data-ndx="${ndx}"]`);
      aCard = origACard.cloneNode(true);
      aCoords = getRelativeCoords(origACard);
      
      aCardRot = +origACard.style.transform.match(/rotate\((.+)deg\)/)[1];
    };
    const setUCard = () => {
      origUCard = userCardsRef.querySelector(`.card.is--white[data-ndx="${ndx}"]`);
      uCard = origUCard.cloneNode(true);
      uCoords = getRelativeCoords(origUCard);
    };
    
    if (action === 'added') {
      setUCard();
      await tick(); // wait for bottom card to render
      setACard();
      
      origACardTrans = origACard.style.transition;
      origACard.style.cssText += 'opacity: 0; transition: unset;';
      aCard.style.opacity = 0;
    }
    else {
      setACard();
      await tick(); // wait for top card to render
      setUCard();
      
      origUCardTrans = origUCard.style.transition;
      origUCard.style.cssText += 'opacity: 0; transition: unset;';
      uCard.style.opacity = 0;
    }
    
    uCard.classList.add('for--animation');
    uCard.style.cssText += `top: ${uCoords.y}px; left: ${uCoords.x}px;`;
    userCardsAnimRef.appendChild(uCard); // eslint-disable-line svelte/no-dom-manipulating
    
    // Since the wrapper has overflow, ensure the anim-wrapper is sized to matched.
    answerCardsAnimRef.style.cssText = `width: ${answersWrapperRef.offsetWidth}px; height: ${answersWrapperRef.offsetHeight}px;`;
    
    aCard.classList.add('for--animation');
    aCard.style.cssText += `top: ${aCoords.y}px; left: ${aCoords.x}px; transform: rotate(${aCardRot}deg);`;
    answerCardsAnimRef.appendChild(aCard); // eslint-disable-line svelte/no-dom-manipulating
    
    const spinRot = ((uCoords.x + uCard.offsetWidth) > centerX) ? -45 : 45;
    const keyframeOpts = { duration: 200, fill: 'forwards' };
    const aCardKeys = [
      { transform: `translate(0px, -${aCard.offsetHeight + 100}px) scale(1.05) rotate(45deg)` },
      { transform: `translate(0px, 0px) scale(1) rotate(${aCardRot}deg)` },
    ];
    const uCardKeys = [
      { transform: 'translate(0px, 0px) scale(1)' },
      {
        // TODO: shadow rotates with element instead of being fixed 
        // boxShadow: '0 1em 1em 0.25em rgba(0, 0, 0, 0.5)',
        transform: `translate(${(centerX - uCoords.x) - (uCard.offsetWidth/2)}px, -${uCoords.y + uCard.offsetHeight}px) scale(1.05) rotate(${spinRot}deg)`,
      },
    ];
    
    if (action === 'added') {
      const outAnim = uCard.animate(
        uCardKeys,
        { ...keyframeOpts, id: 'submitCardOut' }
      );
      outAnim.finished.then(async () => {
        uCard.remove();
        
        aCard.style.opacity = 1;
        const inAnim = aCard.animate(
          aCardKeys,
          { ...keyframeOpts, id: 'submitCardIn' }
        );
        inAnim.finished.then(async () => {
          origACard.style.opacity = 1;
          aCard.remove();
          setTimeout(() => { // `requestAnimationFrame` causes a flicker
            origACard.style.transition = origACardTrans;
          }, 300);
        });
      });
    }
    else {
      const outAnim = aCard.animate(
        [...aCardKeys].reverse(),
        { ...keyframeOpts, id: 'returnCardOut' }
      );
      outAnim.finished.then(async () => {
        aCard.remove();
        
        uCard.style.opacity = 1;
        const inAnim = uCard.animate(
          [...uCardKeys].reverse(),
          { ...keyframeOpts, id: 'returnCardIn' }
        );
        inAnim.finished.then(async () => {
          origUCard.style.opacity = 1;
          uCard.remove();
          setTimeout(() => { // `requestAnimationFrame` causes a flicker
            origUCard.style.transition = origUCardTrans;
            origUCard.style = '';
          }, 300);
        });
      });
    }
  }
  
  function handleCardSelectionToggle(ndx) {
    window.clientSocket.emit(WS__MSG__TOGGLE_CARD_SELECTION, {
      ndx,
      roomID,
      username: localUser.name,
    });
  }

  function handleSubmitCards() {
    window.clientSocket.emit(WS__MSG__SUBMIT_CARDS, {
      roomID,
      username: localUser.name,
    });
  }

  function resetAnswersReview() {
    window.clientSocket.emit(WS__MSG__SET_ANSWER_REVIEW_STATE, {
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
    window.clientSocket.emit(WS__MSG__SET_ANSWER_REVIEW_STATE, {
      answer: room.submittedCards[reviewNdx],
      roomID,
      state: { reviewNdx },
      username: localUser.name,
    });
  }

  function reviewNextAnswer() {
    const reviewNdx = localUser.reviewNdx + 1;
    window.clientSocket.emit(WS__MSG__SET_ANSWER_REVIEW_STATE, {
      answer: room.submittedCards[reviewNdx],
      roomID,
      state: { reviewNdx },
      username: localUser.name,
    });
  }

  function startedReviewingAnswers() {
    window.clientSocket.emit(WS__MSG__SET_ANSWER_REVIEW_STATE, {
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

  function showPointsAwarded(data) {
    pointsAwardedIsOpen = true;
    pointsAwardedData = {
      ...data,
      localUsername: localUser.name,
    };
  }
  function closePointsAwarded() {
    pointsAwardedIsOpen = false;
  }
  function handlePointsAwardedClose() {
    pointsAwardedData = {};
  }

  function handleUsernameSuccess(username) {
    localUser.name = username;
    window.clientSocket.emit(WS__MSG__JOIN_GAME, { roomID, username });
    window.sessionStorage.setItem(roomID, JSON.stringify({ username }));
  }

  function toggleCardSwap() {
    swappingCards = !swappingCards;
  }

  function handleSwapClick(cardNdx) {
    window.clientSocket.emit(WS__MSG__SWAP_CARD, {
      cardNdx,
      roomID,
      username: localUser.name,
    });
  }
  
  function handleFocusHost() {
    closeHostInstructionsBtnRef.focus();
  }

  titleSuffix.set(`Game ${roomID}`);

  addSocketListeners({
    [WS__MSG__ANSWER_REVIEW_STATE_UPDATED]: updateGameState(ACTION__ANSWER_REVIEW_STATE_UPDATED),
    [WS__MSG__CARD_SELECTION_TOGGLED]: updateGameState(ACTION__CARD_SELECTION_TOGGLED),
    [WS__MSG__CARD_SWAPPED]: updateGameState(ACTION__CARD_SWAPPED),
    [WS__MSG__CARDS_DEALT]: updateGameState(ACTION__CARDS_DEALT),
    [WS__MSG__CARDS_SUBMITTED]: updateGameState(ACTION__CARDS_SUBMITTED),
    [WS__MSG__POINTS_AWARDED]: showPointsAwarded,
    [WS__MSG__ROOM_DESTROYED]: handleRoomDestruction,
    [WS__MSG__SERVER_DOWN]: handleServerDisconnect,
    [WS__MSG__USER_DISCONNECTED]: updateGameState(ACTION__USER_DISCONNECTED),
    [WS__MSG__USER_ENTERED_ROOM]: updateGameState(ACTION__USER_ENTERED_ROOM),
    [WS__MSG__USER_JOINED]: updateGameState(ACTION__USER_JOINED),
    [WS__MSG__USER_LEFT_ROOM]: updateGameState(ACTION__USER_LEFT_ROOM),
    [WS__MSG__USER_REMOVED]: updateGameState(ACTION__USER_REMOVED),
    [WS__MSG__USER_UPDATE]: updateGameState(ACTION__USER_UPDATE),
  });

  window.clientSocket.emit(WS__MSG__USER_ENTERED_ROOM, {
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
        <button onclick={openGameMenu}>
          Menu
          <SVG icon={ICON__MENU} />
        </button>
      </nav>

      <div class="game-ui">
        <UsersList
          isHost={localUser.host}
          localUsername={localUser.name}
          onUserClick={userClickHandler}
          users={users}
        />
        
        {#if !czarSelected}
          <div popover role="tooltip" id="popover-card-czar">
            The Card Czar shuffles all of the answers and shares each card combination with the group. For full effect, the Card Czar should usually re-read the Black Card.
          </div>
        {/if}
        
        {#if localUser.cards}
          {#if (localUser.cards.length && czarSelected)}
            <div class="cards">
              <div class="answers">
                <div
                  class="answers-wrapper"
                  class:displaying-users-cards={showUserCards}
                  bind:this={answersWrapperRef}
                >
                  <div class="black-card-wrapper">
                    <Card type="black" text={blackCard} answer={room.blackCardAnswer.cards || localUser.selectedCards.map(({ text }) => text)} />
                    {#if czarWaitingMsg}
                      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                      <div class="czar-waiting-msg">{@html czarWaitingMsg}</div>
                    {/if}
                    {#if localUser.reviewingAnswers}
                      <nav>
                        <button
                          class="prev-btn"
                          class:hidden={!localUser.startedReviewingAnswers || room.submittedCards.length < 2}
                          disabled={localUser.reviewNdx === 0}
                          onclick={reviewPreviousAnswer}
                        >Previous</button>
                        <button
                          class="next-btn"
                          class:hidden={!localUser.startedReviewingAnswers || room.submittedCards.length < 2}
                          disabled={localUser.reviewNdx === room.submittedCards.length - 1}
                          onclick={reviewNextAnswer}
                        >Next</button>
                        <button
                          class="show-answer-btn"
                          class:hidden={localUser.startedReviewingAnswers}
                          onclick={startedReviewingAnswers}
                        >Show Answer</button>
                        <button
                          class="pick-answer-btn"
                          disabled={!localUser.startedReviewingAnswers}
                          onclick={chooseAnswer}
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
                <button
                  class="submit-cards-btn"
                  disabled={!localUser.maxCardsSelected}
                  onclick={handleSubmitCards}
                >
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html `Submit Card${localUser.selectedCards.length > 1 ? 's' : ''}`}
                </button>
                
                <div class="answer-cards-anim" bind:this={answerCardsAnimRef}></div>
                
                <div class="user-cards-wrapper">
                  <div class="sep is--top"></div>
                  {#if localUser.points && !localUser.maxCardsSelected}
                    <nav class="cards-nav">
                      <button onclick={toggleCardSwap}>
                        {#if swappingCards}
                          Cancel Card Swap
                        {:else}
                          Swap Card
                        {/if}
                      </button>
                    </nav>
                  {/if}
                  
                  <div
                    class="user-cards"
                    class:disabled={localUser.maxCardsSelected}
                    bind:this={userCardsRef}
                  >
                    {#each localUser.cards as { ndx, selected, text } (text)}
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
                  
                  <div class="user-cards-anim" bind:this={userCardsAnimRef}></div>
    
                  <div class="sep is--btm"></div>
                </div>
              {/if}
            </div>
          {:else}
            <div class="czar-pending-msg">
              <p>
                {#if localUser.host}
                  {#if users.length === 1}
                    Waiting for more users to join.
                  {:else}
                    You need to pick the <button popovertarget="popover-card-czar">Card Czar</button>.
                    <br>
                    To do so, just click on a User in the side menu.
                  {/if}
                {:else}
                  Waiting for <mark>{gameHost}</mark> to pick the <button popovertarget="popover-card-czar">Card Czar</button>.
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
      
      {#if showHostInstructions}
        <Dialog modal onOpenEnd={handleFocusHost}>
          {#snippet s_dialogBody()}
            <div class="host-instructions">
              <p>
                As the Host, you're running the game. In order for others to join,
                just send them
              </p>
              <ul>
                <li>
                  this URL:
                  <Copyable
                    class="for--url"
                    text={window.location.href}
                    title="Click to copy game URL"
                  />
                </li>
                <li>
                  or this code:
                  <Copyable
                    class="for--code"
                    text={roomID}
                    title="Click to copy game code"
                  />
                </li>
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
                onclick={closeHostInstructions}
                bind:this={closeHostInstructionsBtnRef}
              >Close</button>
            </div>
          {/snippet}
        </Dialog>
      {/if}
      
      {#if showUserDataMenu}
        <Dialog
          modal
          onCloseEnd={handleUserDataMenuClose}
        >
          {#snippet s_dialogBody()}
            <div class="user-data-menu">
              <button
                class="icon-btn"
                type="button"
                disabled={userData.czar || !minimumNumberOfPlayersJoined}
                onclick={setCzar}
              >
                <SVG icon={ICON__CZAR} />
                <span>
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html MSG__SET_CZAR.replace('<User>', `<q>${userData.name}</q>`)}
                </span>
              </button>
              {#if !minimumNumberOfPlayersJoined}
                <div class="help">
                  There has to be at least 2 players before you can assign a Czar.
                </div>
              {/if}
              {#if userData.czar}
                <div class="help">
                  {#if userData.host}You're{:else}They're{/if} already the Czar, yuh silly goose.
                </div>
              {/if}
              <button
                class="icon-btn for--host"
                type="button"
                disabled={userData.host}
                onclick={setHost}
              >
                <SVG icon={ICON__HOST} />
                <span>
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html `Make <q>${userData.name}</q> the Host`}
                </span>
              </button>
              {#if userData.host}
                <div class="help">
                  You're already the Host, yuh silly goose.
                </div>
              {/if}
              <button
                class="icon-btn for--rm-user"
                type="button"
                disabled={userData.host}
                data-username={userData.name}
                onclick={removeUserFromGame}
              >
                <SVG icon={ICON__REMOVE_USER} />
                <span>
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html `Remove <q>${userData.name}</q> from game`}
                </span>
              </button>
              <button
                type="button"
                onclick={closeUserDataMenu}
              >Close</button>
            </div>
          {/snippet}
        </Dialog>
      {/if}
      
      <PointsAwarded
        closeHandler={closePointsAwarded}
        onClose={handlePointsAwardedClose}
        open={pointsAwardedIsOpen}
        {...pointsAwardedData}
      />
      
      {#if showGameMenu}
        <Dialog onCloseClick={closeGameMenu}>
          {#snippet s_dialogBody()}
            <section class="game-menu">
              <h3>Copy</h3>
              <div class="row">
                <div class="label">Game URL:</div>
                <Copyable
                  class="for--url"
                  onCopy={closeGameMenu}
                  text={window.location.href}
                  title="Click to copy game URL"
                />
              </div>
              <div class="row">
                <div class="label">Game Code:</div>
                <Copyable
                  class="for--code"
                  onCopy={closeGameMenu}
                  text={roomID}
                  title="Click to copy game code"
                />
              </div>
            </section>
          {/snippet}
        </Dialog>
      {/if}
    {/if}
    
    {#if roomCheckComplete && !room}
      <Dialog modal>
        {#snippet s_dialogBody()}
          <div>
            <div class="room-error-msg">
              Sorry, it looks like room <code>{roomID}</code> doesn't exist anymore.
            </div>
            <GameEntry />
          </div>
        {/snippet}
      </Dialog>
    {/if}
  {/if}
  
  {#if !socketConnected && socketConnectedAtLeastOnce}
    <Dialog modal>
      {#snippet s_dialogBody()}
        <div class="room-error-msg">
          Sorry, it looks like the game has lost connection to the Server. You can
          try refreshing the page, but it's likely the Server went down for
          maintainence and you'll have to start a new game.
        </div>
      {/snippet}
    </Dialog>
  {/if}
</div>

<style>
  :root {
    --user-color__host: #228fff;
  }
  
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
  .top-nav button :global(.icon) {
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
  
  :global(.dialog__body:has( .room-error-msg)) {
    --dialog-body-color: #ffc9ae;
  }
  .room-error-msg {
    text-align: center;
    padding: 0.5em;
    border-radius: 0.25em;
    background: #ffffa9;
  }
  .room-error-msg code {
    color: #faffb7;
    background: #333;
  }

  .host-instructions {
    width: 500px;
    font-size: 1.3em;
  }
  .host-instructions li {
    margin: 0.5em 0;
  }

  .user-data-menu {
    max-width: 400px;
  }
  .user-data-menu button {
    word-break: break-word;
  }
  .user-data-menu button:not(:first-of-type) {
    margin-top: 1em;
  }
  .user-data-menu button :global(q) {
    color: #ff00b1;
    background: transparent;
  }
  .user-data-menu button:disabled :global(q) {
    color: currentColor;
  }
  .user-data-menu .icon-btn {
    overflow: hidden;
    padding: 2px;
    border: none;
    border-radius: 0.5em;
    box-shadow: 0px 0px 8px 0px #00000026;
    background-image: linear-gradient(180deg, #0000006b, #ffffff73);
    display: flex;
    align-items: stretch;
  }
  .user-data-menu .icon-btn:disabled {
    color: currentColor;
    opacity: 0.3;
  }
  .user-data-menu .icon-btn :global(.icon) {
    box-sizing: content-box;
    padding: 0.5em;
    border-radius: 0.4em 0 0 0.4em;
    background: linear-gradient(180deg, #cfcfcf, #222 12%, #222 90%, #000000);
  }
  .user-data-menu .icon-btn.for--host :global(.icon) {
    fill: var(--user-color__host);
  }
  .user-data-menu .icon-btn.for--rm-user :global(.icon) {
    fill: #ff4747;
  }
  .user-data-menu .icon-btn span {
    width: 100%;
    padding: 0 0.75em;
    border-radius: 0 0.4em 0.4em 0;
    background: linear-gradient(180deg, white, #ddd 12%, #ddd 90%, #bbb);
    align-content: center;
  }
  .user-data-menu .help {
    color: #666;
    font-size: 0.6em;
    padding: 0.25em 0.5em 0 0.5em;
  }

  .game-menu {
    font-size: 1em;
  }
  .game-menu section h3 {
    border-bottom: solid 1px;
  }
  .game-menu .row {
    display: flex;
  }
  .game-menu .row:not(:first-of-type) {
    margin-top: 0.75em;
  }
  .game-menu .label {
    width: 6em;
  }

  .cards {
    width: 100%;
    padding: 1em 1em 0 1em;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
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
    padding: 0.5em 1em; /* Card rotation can expand outside of the container's bounds. The padding allows for the rotation without overflow kicking in. */
    position: relative;
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
  .user-cards {
    width: 100%;
    height: 100%;
    padding-top: 4em;
    padding-bottom: 4em;
    overflow: auto;
  }
  .user-cards.disabled :global(.card) {
    opacity: 0.25;
    pointer-events: none;
  }
  .answer-cards-anim,
  .user-cards-anim {
    pointer-events: none;
    position: absolute;
  }
  .user-cards-anim {
    inset: 0;
  }
  .answer-cards-anim :global(.card.for--animation),
  .user-cards-anim :global(.card.for--animation) {
    position: absolute;
    transform-origin: center;
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
  .submit-cards-btn:disabled {
    background: #ddd;
    opacity: 0.5;
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
    .top-nav button :global(.icon) {
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
    .cards .user-cards {
      gap: 0.5em;
    }
  }
</style>
