<style>
	
</style>

<svelte:head>
	<title>CAH-Box</title>
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import {
    WS_MSG__CREATE_GAME,
  } from '../constants';

  let blackCards;
  let whiteCards;
  let roomID;

  function handleCreateClick() {
    window.socket.on(WS_MSG__CREATE_GAME, (data) => {
      blackCards = data.cards.black;
      whiteCards = data.cards.white;
      roomID = data.roomID;

      console.log(blackCards, whiteCards, roomID);
    });
    window.socket.emit(WS_MSG__CREATE_GAME);
  }
  
  onMount(() => {
    window.socket = io();
  });
</script>

<div>
  {#if roomID}
    <p>Room ID: {roomID}</p>
  {:else}
    <form>
      <button 
        type="button"
        value="create"
        on:click={handleCreateClick}
      >Create</button>
      or
      <button type="button" value="join">Join</button>
    </form>
  {/if}
</div>
