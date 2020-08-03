<script>
  import { titleSuffix } from '../store';

  const title = 'CAH-Box';

  // NOTE - svelte's `onMount` (when fired within `_layout`) fires after the
  // child components `onMount` calls. This allows for any top-level
  // bootstrapping that needs to occur.
  if (typeof window !== 'undefined') {
    window.socketConnected = new Promise((resolve) => {
      window.socket = io();
      window.socket.on('connect', () => { resolve(); });
    });
  }
</script>

<svelte:head>
  <title>{`${title}${$titleSuffix ? ` | ${$titleSuffix}` : ''}`}</title>
  <style>
    html, body {
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }

    button {
      cursor: pointer;
    }

    input {
      font-size: 1em;
    }
    input[type="text"] {
      padding: 0.25em;
    }

    #sapper {
      width: 100%;
      height: 100%;
    }
  </style>
</svelte:head>

<slot></slot>
