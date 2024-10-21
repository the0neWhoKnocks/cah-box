<script>
  import { onMount } from 'svelte';
  import {
    WS__MSG__PING,
    WS__MSG__PONG,
  } from '../../constants';
  import logger from '../../utils/logger';
  import Dialog from '../components/Dialog.svelte';

  const log = logger('Shell');
  const logHeartbeat = logger('Shell:heartbeat');

  let connectionVerified = false;
  let mounted = false;
  let heartbeat;
  let heartbeatTimeout;
  let online = false;
  let socketConnected = false;
  let socketError = '';
  let wentOffline = false;

  export let Route;
  export let routeProps;

  function setConnectedState() {
    connectionVerified = true;
    socketConnected = true;
    socketError = '';
  }

  function stopHeartbeat() {
    logHeartbeat('socket disconnected');
    socketConnected = false;
    socketError = "You've lost connection to the Server";
    clearInterval(heartbeat);
    clearTimeout(heartbeatTimeout);
  }

  function startHeartbeat() {
    setConnectedState();

    heartbeat = setInterval(() => {
      connectionVerified = false;
      window.clientSocket.emit(WS__MSG__PING);

      heartbeatTimeout = setTimeout(() => {
        if (!connectionVerified) {
          stopHeartbeat();
        }
      }, 1000);
    }, 2000);
  }

  onMount(() => {
    mounted = true;

    window.socketConnected
      .then(() => {
        window.clientSocket.on(WS__MSG__PONG, () => {
          logHeartbeat('socket connected');
          setConnectedState();
        });
        
        startHeartbeat();
      })
      .catch((err) => {
        socketError = err;
      });
  });

  $: if (mounted && !online) {
    wentOffline = true;
    stopHeartbeat();
    log('Browser disconnected');
  }
  else if (wentOffline && online) {
    wentOffline = false;
    startHeartbeat();
    log('Browser reconnected');
  }
</script>

<svelte:window bind:online={online}/>

{#if mounted && socketConnected}
  <svelte:component this={Route} {...routeProps} />
{/if}

{#if socketError}
  <Dialog modal>
    <svelte:fragment slot="dialogBody">{socketError}</svelte:fragment>
  </Dialog>
{/if}
