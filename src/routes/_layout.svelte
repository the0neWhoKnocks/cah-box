<script>
  import { onMount } from 'svelte';
  import { titleSuffix } from '../store';

  const title = 'CAH-Box';
  let mounted = false;

  // NOTE - svelte's `onMount` (when fired within `_layout`) fires after the
  // child components `onMount` calls. This allows for any top-level
  // bootstrapping that needs to occur.
  if (typeof window !== 'undefined') {
    window.socketConnected = new Promise((resolve) => {
      window.socket = io();
      window.socket.on('connect', () => { resolve(); });
    });
  }

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>{`${title}${$titleSuffix ? ` | ${$titleSuffix}` : ''}`}</title>
  <style>
    *, *::after, *::before {
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }

    button:not(:disabled) {
      cursor: pointer;
    }

    input {
      font-size: 1em;
    }
    input[type="text"] {
      padding: 0.25em;
    }

    p {
      margin: 0;
    }
    p:not(:last-child) {
      margin-bottom: 1em;
    }

    q {
      color: #501600;
      font-style: italic;
      font-family: serif;
      font-weight: bold;
      padding: 0 0.5em;
      border-radius: 0.25em;
      background: #ffeb00;
      display: inline-block;
    }

    #sapper,
    #portal,
    .page {
      width: 100%;
      height: 100%;
    }

    #portal {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    @keyframes showMsg {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    .loading-msg {
      width: 100%;
      height: 100%;
      padding: 2em;
      display: flex;
      justify-content: center;
      align-items: center;
      animation-name: showMsg;
      animation-duration: 300ms;
      animation-delay: 300ms;
      animation-fill-mode: both;
    }
  </style>
</svelte:head>

{#if mounted}
  <div class="page">
    <slot></slot>
  </div>
  <div id="portal"></div>
{:else}
  <div class="loading-msg">
    <span class="msg">Loading...</span>
    <noscript>
      This App requires Javascript. You'll have to enable it if you want to play.
    </noscript>
  </div>
{/if}
