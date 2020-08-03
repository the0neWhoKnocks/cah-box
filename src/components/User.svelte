<style>
  .user {
    font-size: 1.25em;
    display: flex;
  }

  .user__icon,
  .user__status-indicator,
  .user__name {
    line-height: 1em;
    padding: 0.25em;
    display: inline-block;
  }

  .user__name {
    width: 100%;
  }

  .user:not(.is--admin) .user__icon {
    opacity: 0;
  }

  .user__status-indicator {
    background-color: #27cfb6;
    transition: background-color 300ms;
  }
  .user:not(.is--active) .user__status-indicator {
    background-color: #393939;
  }
</style>

<script>
  const ICON__ADMIN = '&#x2605;';
  const ICON__CZAR = '&#x1F451;';
  let className = '';
  
  export let active = false;
  export let admin = false;
  export let czar = false;
  export let name = '';
  export { className as class };

  const icon = czar ? ICON__CZAR : ICON__ADMIN;
</script>

<div
  class={`user ${className}`}
  class:is--active={active}
  class:is--admin={admin}
  class:is--czar={czar}
>
  <span class="user__icon">{@html icon}</span>
  <span class="user__name">{name}</span>
  <span class="user__status-indicator"></span>
</div>