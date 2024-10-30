<script>
  import DisconnectIndicator from './DisconnectIndicator.svelte';

  let className = '';
  
  export let cardsSubmitted = false;
  export let connected = false;
  export let czar = false;
  export let host = false;
  export let name = '';
  export let points = 0;
  export { className as class };
</script>

<div
  class={`user ${className}`}
  class:is--connected={connected}
  class:is--czar={czar}
  class:is--host={host}
  class:cards-submitted={cardsSubmitted}
  data-name={name}
>
  <span class="user__icon">
    <svg class="icon">
      <use
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xlink:href={`#ui-icon__${czar ? 'crown' : 'star'}`}
      ></use>
    </svg>
  </span>
  {#if !connected}
    <DisconnectIndicator />
  {/if}
  <span class="user__name">{name}</span>
  <span class="user__points">{points}</span>
  <span class="user__status-indicator"></span>
</div>

<style>
  .user {
    font-size: 1.25em;
    display: flex;
    position: relative;
  }
  .user * {
    pointer-events: none;
  }

  .user :global(.disconnect-indicator) {
    width: 1.25em;
    position: absolute;
    top: 50%;
    left: 0.15em;
    transform: translateY(-50%) scale(1);
  }

  .user__icon,
  .user__name,
  .user__points,
  .user__status-indicator {
    line-height: 1em;
    padding: 0.25em;
    display: inline-block;
  }

  .user__name {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .user:not(.is--host):not(.is--czar) .user__icon {
    opacity: 0;
  }
  .user.is--host .icon {
    fill: #228fff;
  }

  .user__points {
    font-family: monospace;
    font-size: 1.09em;
  }

  .user__status-indicator {
    border-left: solid 2px #fff;
    background-color: #27cfb6;
    transition: background-color 300ms;
  }
  .user:not(.is--czar) .user__status-indicator {
    background-color: #393939;
  }
  .user:not(.is--connected) {
    background: yellow;
  }
  .user:not(.is--connected) .user__icon {
    opacity: 0;
  }
  .user:not(.is--connected) .user__name,
  .user:not(.is--connected) .user__points,
  .user:not(.is--connected) .user__status-indicator {
    opacity: 0.25;
  }

  @keyframes showCard {
    0% {
      opacity: 0;
      transform: translateX(-1em) rotate(-20deg);
    }
    100% {
      opacity: 1;
      transform: translateX(0em) rotate(0deg);
    }
  }
  .user.cards-submitted::after {
    content: '';
    width: 1em;
    height: 100%;
    border: solid 1px #000;
    border-radius: 0.1em;
    background: #fff;
    position: absolute;
    top: 0;
    left: calc(100% + 0.25em);
    box-shadow: 0 2px 8px 0px rgba(0, 0, 0, 0.5);
    animation-name: showCard;
    animation-fill-mode: both;
    animation-duration: 300ms;
  }
</style>
