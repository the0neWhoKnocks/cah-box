<style>
  .modal {
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: all;
  }

  .modal__body {
    max-height: 90vh;
    font-size: 1.5em;
    overflow: auto;
    padding: 1em;
    border: solid 1px #888;
    border-radius: 0.25em;
    margin: 1em;
    background: #fff;
  }

  :global(body.modal--open .page) {
    filter: blur(6px);
  }
</style>

<script>
  import { onDestroy, onMount } from 'svelte';

  const MODIFIER__OPEN = 'modal--open';
  let className = '';
  let modalRef;

  export let focusRef;
  export { className as class };

  $: if (focusRef) {
    setTimeout(() => { focusRef.focus(); }, 0);
  }

  onMount(() => {
    const portal = document.getElementById('portal');
    portal.innerHTML = '';
    portal.appendChild(modalRef);
    document.body.classList.add(MODIFIER__OPEN);
  });

  onDestroy(() => {
    document.body.classList.remove(MODIFIER__OPEN);
  });
</script>

<div class={`modal ${className}`} bind:this={modalRef}>
  <div class="modal__body">
    <slot></slot>
  </div>
</div>