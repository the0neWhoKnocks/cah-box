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
    display: flex;
    justify-content: center;
    align-items: center;
    background: #eee;
  }

  .join-form {
    width: 300px;
    font-size: 1.5em;
    padding: 1em;
    border: solid 1px #888;
    border-radius: 0.25em;
    background: #fff;
  }
</style>

<script context="module">
	export async function preload(page) {
		const { roomID } = page.params;
		return { roomID };
	}
</script>

<script>
  export let roomID;

  import { onMount } from 'svelte';
  import { titleSuffix } from '../../store';
  import {
    WS_MSG__JOIN_GAME,
  } from '../../constants';
  
  let mounted = false;
  let roomData;

  function handleJoinClick() {
    // TODO 
    // - check if username is already in use
    //  - if it is, inform user that it's taken
    //  - else, join game
    //    - display the new user in a side-bar

    // window.socket.on(WS_MSG__JOIN_GAME, (data) => {
    //   console.log(data);
    // });
    // window.socket.emit(WS_MSG__JOIN_GAME);
  }

  titleSuffix.set(`Game ${roomID}`);

  onMount(() => {
    mounted = true;
    roomData = JSON.parse(window.sessionStorage.getItem(roomID));
  });
</script>

<div class="wrapper">
  {#if mounted}
    <form class="join-form" autocomplete="off">
      <label>
        Enter Username:
        <input type="text" name="username" />
      </label>
      <button 
        type="button"
        value="join"
        on:click={handleJoinClick}
      >Join Game</button>
    </form>
  {/if}
</div>
