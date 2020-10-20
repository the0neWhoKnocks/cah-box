<script>
  const cssVars = {
    copiedMsgDuration: 2000,
  };
  let className = '';
  let copied = false;

  export let onCopy = undefined;
  export let text = '';
  export { className as class };

  function addValueToClipboard() {
    if (!copied) {
      const temp = document.createElement('textarea');
      temp.style.cssText = 'position: absolute; top: -100px; left: -100px;';
      document.body.appendChild(temp);
      temp.value = text;
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);

      copied = true;
      
      if (onCopy) {
        setTimeout(() => { onCopy(); }, cssVars.copiedMsgDuration / 4);
      }

      setTimeout(() => { copied = false; }, cssVars.copiedMsgDuration);
    }
  }
</script>

<button
  class={`copyable-item ${className}`}
  class:copied
  style="--copiedMsgDuration: {cssVars.copiedMsgDuration}ms;"
  title="Click to copy game URL"
  on:click={addValueToClipboard}
>
  <div class="copyable-item__text">{text}</div>
  <div class="copyable-item__clipboard-icon">
    <svg class="icon">
      <use
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xlink:href="#ui-icon__clipboard"
      ></use>
    </svg>
  </div>
</button>

<style>
  @keyframes copiedMsg {
    0% { opacity: 0; }
    10%,
    40% { opacity: 1; }
    100% { opacity: 0; }
  }

  .copyable-item {
    width: auto;
    font-size: 0.8em;
    text-align: left;
    padding: 0;
    border: solid 1px #666;
    border-radius: 0.25em;
    background: #eee;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    position: relative;
  }
  .copyable-item.copied::after {
    content: 'Copied';
    width: 100%;
    height: 100%;
    color: #045d80;
    font-weight: bold;
    padding: 0.5em;
    background: #b1ffb1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    animation: copiedMsg var(--copiedMsgDuration);
    animation-fill-mode: forwards;
  }
  .copyable-item > * {
    margin: 0 0.5em;
    user-select: none;
    pointer-events: none;
  }
  .copyable-item__text {
    max-width: 67vw;
    font-family: monospace;
    line-height: 2em;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
    border-top: dashed 1px #eee;
  }
  .copyable-item__clipboard-icon {
    margin: 0;
    margin-left: 0.25em;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .copyable-item__clipboard-icon .icon {
    width: 2.25em;
    height: 2.25em;
    margin-right: -0.4em;
    margin-left: -0.4em;
    margin-top: -0.25em;
  }
</style>