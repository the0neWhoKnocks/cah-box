<script>
  import User from './User.svelte';

  let localUser;
  let sortedUsers = [];

  export let isHost = false;
  export let localUsername = undefined;
  export let onUserClick = undefined;
  export let users = undefined;

  $: {
    if (users.length) {
      localUser = users.filter(({ name }) => name === localUsername)[0];
      sortedUsers = users
        .filter(({ name }) => name !== localUsername)
        .sort(({ name: nameA }, { name: nameB }) => {
          const optA = nameA.toLowerCase();
          const optB = nameB.toLowerCase();
          if (optA < optB) return -1;
          if (optA > optB) return 1;
          return 0;
        });
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="users-list"
  class:is--host={isHost}
  on:click={onUserClick}
>
  {#if localUser}
    <User
      cardsSubmitted={localUser.cardsSubmitted}
      class="is--local"
      connected={localUser.connected}
      czar={localUser.czar}
      host={localUser.host}
      name={localUser.name}
      points={localUser.points}
    />
  {/if}
  {#if sortedUsers.length}
    {#each sortedUsers as { cardsSubmitted, connected, czar, host, name, points }}
      <User
        {cardsSubmitted}
        {connected}
        {czar}
        {host}
        {name}
        {points}
      />
    {/each}
  {/if}
</div>

<style>
  .users-list {
    background: #fff;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .users-list :global(.user) {
    margin: 0.25em 0;
  }
  .users-list :global(.user.is--local) {
    color: #fff1be;
    font-weight: bold;
    margin-top: 0;
    background: #000;
  }
  .users-list.is--host :global(.user:hover) {
    cursor: pointer;
    background: rgba(255, 255, 0, 0.5);
  }
  .users-list.is--host :global(.user.is--local:hover) {
    color: #000;
  }
</style>
