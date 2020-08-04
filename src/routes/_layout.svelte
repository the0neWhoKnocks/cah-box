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

    #sapper {
      width: 100%;
      height: 100%;
    }
  </style>
</svelte:head>

<slot></slot>
