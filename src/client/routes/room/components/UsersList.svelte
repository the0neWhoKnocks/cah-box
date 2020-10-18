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
  .users-list.is--admin :global(.user:hover) {
    cursor: pointer;
    background: rgba(255, 255, 0, 0.5);
  }
  .users-list.is--admin :global(.user.is--local:hover) {
    color: #000;
  }
</style>

<script>
  import User from './User.svelte';

  let localUser;
  let sortedUsers = [];

  export let isAdmin = false;
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

<div
  class="users-list"
  class:is--admin={isAdmin}
  on:click={onUserClick}
>
  {#if localUser}
    <User
      admin={localUser.admin}
      cardsSubmitted={localUser.cardsSubmitted}
      class="is--local"
      connected={localUser.connected}
      czar={localUser.czar}
      local
      name={localUser.name}
      points={localUser.points}
    />
  {/if}
  {#if sortedUsers.length}
    {#each sortedUsers as { admin, cardsSubmitted, connected, czar, name, points }}
      <User
        admin={admin}
        cardsSubmitted={cardsSubmitted}
        connected={connected}
        czar={czar}
        name={name}
        points={points}
      />
    {/each}
  {/if}
</div>
