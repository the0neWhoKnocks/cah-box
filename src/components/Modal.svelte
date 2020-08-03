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
  }
  .modal__body {
    font-size: 1.5em;
    padding: 1em;
    border: solid 1px #888;
    border-radius: 0.25em;
    background: #fff;
  }
</style>

<script>
  let className = '';
  export { className as class };
</script>

<div class={`modal ${className}`}>
  <div class="modal__body">
    <slot></slot>
  </div>
</div>