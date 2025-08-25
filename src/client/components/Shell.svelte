<script>
  import { onMount } from 'svelte';
  import {
    WS__MSG__PING,
    WS__MSG__PONG,
  } from '../../constants';
  import logger from '../../utils/logger';
  import { gameFocused } from '../store';
  import Dialog from './Dialog.svelte';
  
  let { routeProps, routeName } = $props();
  
  const log = logger('Shell');
  let connectionVerified = false;
  let mounted = $state(false);
  let heartbeat;
  let heartbeatTimeout;
  let online = $state(false);
  let Route = $state();
  let socketConnected = $state(false);
  let socketError = $state('');
  let wentOffline = $state(false);

  function setConnectedState() {
    connectionVerified = true;
    socketConnected = true;
    socketError = '';
  }

  function stopHeartbeat() {
    log.debug('socket disconnected');
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
  
  function handleWinBlur() { gameFocused.set(false); }
  
  function handleWinFocus() { gameFocused.set(true); }

  onMount(async () => {
    mounted = true;

    window.socketConnected
      .then(() => {
        // Server checking if User connected
        window.clientSocket.on(WS__MSG__PING, () => {
          window.clientSocket.emit(WS__MSG__PONG);
        });
        
        // User checking if it has connection to Server
        window.clientSocket.on(WS__MSG__PONG, () => {
          log.debug('socket connected');
          setConnectedState();
        });
        
        startHeartbeat();
      })
      .catch((err) => {
        socketError = err;
      });
    
    switch (routeName) {
      case 'home':
        Route = (await import(
          /* webpackChunkName: "route_Home" */
          './Home.svelte'
        )).default;
        break;
      
      case 'room':
        Route = (await import(
          /* webpackChunkName: "route_Room" */
          './Room.svelte'
        )).default;
        break;
    }
  });

  $effect(() => {
    if (mounted && !online) {
      wentOffline = true;
      stopHeartbeat();
      log.info('Browser disconnected');
    }
    else if (wentOffline && online) {
      wentOffline = false;
      startHeartbeat();
      log.info('Browser reconnected');
    }
  });
</script>

<svelte:window
  onblur={handleWinBlur}
  onfocus={handleWinFocus}
  bind:online={online}
/>

{#if mounted && socketConnected}
  <Route {...routeProps} />
{/if}

{#if socketError}
  <Dialog modal>
    {#snippet s_dialogBody()}
      {socketError}
    {/snippet}
  </Dialog>
{/if}
