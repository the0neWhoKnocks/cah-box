<script>
  import { onMount } from 'svelte';
  import {
    WS__MSG_TYPE__PING,
    WS__MSG_TYPE__PONG,
  } from '../../constants';
  import logger from '../../utils/logger';
  import Modal from '../components/Modal.svelte';

  const logHeartbeat = logger('Shell:heartbeat');

  let connectionVerified = false;
  let mounted = false;
  let socketConnected = false;
  let socketError = '';
  let heartbeat;

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
  }

  function startHeartbeat() {
    heartbeat = setInterval(() => {
      connectionVerified = false;
      window.clientSocket.emit(WS__MSG_TYPE__PING);

      setTimeout(() => {
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
        window.clientSocket.on(WS__MSG_TYPE__PONG, () => {
          logHeartbeat('socket connected');
          setConnectedState();
        });

        setConnectedState();
        startHeartbeat();
      })
      .catch((err) => {
        socketError = err;
      });
  });
</script>

{#if mounted && socketConnected}
  <svelte:component this={Route} {...routeProps} />
{/if}
 
<Modal open={socketError} force>
  <div>{socketError}</div>
</Modal>
