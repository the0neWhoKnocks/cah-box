<script>
  // TODO delete file
  import { onDestroy, onMount, tick } from 'svelte';
  import logger from '../../utils/logger';

  const log = logger('Modal');

  const MODIFIER__CLOSING = 'modal--closing';
  const MODIFIER__OPEN = 'modal--open';
  const cssVars = {
    animationDuration: 300,
  };
  let className = '';
  let closing = false;
  let modalIsOpen = false;
  let modalRef;
  let mounted = false;

  export let focusRef = undefined;
  export let force = false;
  export let open = false;
  export let onClose = undefined;
  export let onMaskClick = undefined;
  export { className as class };

  function renderModal() {
    if (force && window.currentModal) window.currentModal.forceClose();

    if (!window.pendingModalCloses) window.pendingModalCloses = [];
    if (!window.modalResolvers) window.modalResolvers = [];

    if (!window.pendingModalCloses.length) {
      window.pendingModalCloses.push(Promise.resolve());
      window.modalResolvers.push(() => {});
    }
    else {
      window.pendingModalCloses.push(
        new Promise((resolve) => { window.modalResolvers.push(resolve); })
      );
    }

    if (window.modalCount) window.modalCount++;
    else window.modalCount = 1;

    window.pendingModalCloses.splice(0, 1)[0].then(() => {
      modalIsOpen = true;
  
      const portal = document.getElementById('portal');
      portal.appendChild(modalRef);
      document.body.classList.add(MODIFIER__OPEN);

      window.currentModal = {
        async forceClose() {
          await tick();

          if (this.portal.contains(this.modalRef)) {
            this.portal.removeChild(this.modalRef);
            if (this.focusTimeout) clearTimeout(this.focusTimeout);

            delete window.currentModal;
            
            document.body.classList.remove(MODIFIER__OPEN);
            document.body.classList.remove(MODIFIER__CLOSING);
            window.modalCount--;
            
            if (window.modalResolvers.length) window.modalResolvers.splice(0, 1)[0]();
          }
        },
        modalRef,
        portal,
      };
  
      if (focusRef) {
        window.currentModal.focusTimeout = setTimeout(() => {
          focusRef.focus();
          log(`renderModal [${className}] > focused el`);
        }, cssVars.animationDuration);
      }
      
      log(`renderModal [${className}] > moved Modal to Portal \n  classList: "${document.body.classList}"`);
    });
  }

  $: if (mounted) {
    // The `modalRef` will be `null` after the Modal is closed after the initial
    // open. This ensures that any further actions that try to re-open the Modal
    // will succeed by waiting for the Reactive `modalRef` to be redefined after
    // the markup is added back to the DOM.
    if (modalRef && open && !modalIsOpen) {
      renderModal();
    }
    else if (!open && modalIsOpen) {
      closing = true;

      // If another Modal will be opened immediately, no need to fade the BG
      // in and out.
      let wasClosing = false;
      if (window.modalCount === 1) {
        document.body.classList.remove(MODIFIER__OPEN);
        document.body.classList.add(MODIFIER__CLOSING);
        wasClosing = true;
      }
      log(`closing [${className}] > \n  modalCount: ${window.modalCount} \n  classList: "${document.body.classList}"`);
      
      delete window.currentModal;
      window.modalResolvers.splice(0, 1)[0]();
      
      setTimeout(() => {
        closing = false;
        modalIsOpen = false;

        if (wasClosing || window.modalCount === 1) document.body.classList.remove(MODIFIER__CLOSING);
        window.modalCount--;

        if (onClose) onClose();
        
        log(`closed [${className}] > \n  modalCount: ${window.modalCount} \n  classList: "${document.body.classList}"`);
      }, cssVars.animationDuration);
    }
  }

  onMount(() => {
    // Add global CSS vars since the Modal utilizes a Portal strategy and needs
    // to have the same data available in multiple areas.
    const root = document.documentElement;
    root.style.setProperty('--modalAnimationDuration', `${cssVars.animationDuration}ms`);

    mounted = true;

    // Uncomment if you need to test Modals more quickly
    // window.closeModal = () => { open = false; }
    // window.openModal = () => { open = true; }
  });

  onDestroy(() => {
    if (open && window.currentModal) window.currentModal.forceClose();
  });
</script>

{#if open || closing}
  <div
    class={`modal ${className}`}
    class:modal--closing={closing}
    class:modal--reveal={modalIsOpen}
    bind:this={modalRef}
  >
    <div class="modal__mask" on:click={onMaskClick}></div>
    <slot name="supplemental"></slot>
    <div class="modal__body">
      <slot></slot>
    </div>
  </div>
{/if}

<style>
  @keyframes blurBG {
    0% { filter: blur(0px); }
    100% { filter: blur(6px); }
  }
  @keyframes restoreBG {
    0% { filter: blur(6px); }
    100% { filter: blur(0px); }
  }

  @keyframes showMask {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes hideMask {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes showModal {
    0% {
      opacity: 0;
      transform: translateY(-3em);
    }
    100% {
      opacity: 1;
      transform: translateY(0em);
    }
  }
  @keyframes hideModal {
    0% {
      opacity: 1;
      transform: translateY(0em);
    }
    100% {
      opacity: 0;
      transform: translateY(3em);
    }
  }

  .modal {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: all;
  }

  .modal__mask {
    background: rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    animation: showMask var(--modalAnimationDuration);
    animation-fill-mode: forwards;
  }
  .modal--closing .modal__mask {
    animation: hideMask var(--modalAnimationDuration);
    animation-fill-mode: forwards;
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
    z-index: 1;
    animation: showModal var(--modalAnimationDuration);
    animation-fill-mode: forwards;
    animation-play-state: paused;
  }
  .modal--reveal .modal__body {
    animation-play-state: running;
  }
  .modal--closing .modal__body {
    animation: hideModal var(--modalAnimationDuration);
    animation-fill-mode: forwards;
  }

  :global(body.modal--open #route) {
    filter: blur(6px);
  }
</style>
