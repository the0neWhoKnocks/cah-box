<script>
  import { onMount } from 'svelte';
  import Modal from '../components/Modal.svelte';

  let mounted = false;
  let socketConnected = false;
  let socketError = '';

  export let Route;
  export let routeProps;

  onMount(() => {
    mounted = true;

    window.socketConnected
      .then(() => {
        socketConnected = true;
      })
      .catch((err) => {
        socketError = err;
      });
  });
</script>

{#if mounted && socketConnected}
  <svelte:component this={Route} {...routeProps} />
{/if}
 
<Modal open={socketError}>
  <div>{socketError}</div>
</Modal>
