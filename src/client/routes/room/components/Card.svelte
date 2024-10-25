<script>
  import getGaps from '../../../../utils/getGaps';
  import randomNumber from '../../../utils/randomNumber';

  export let answer = undefined;
  export let onClick = undefined;
  export let onSwapClick = undefined;
  export let rotate = false;
  export let selected = false;
  export let swappable = false;
  export let text = '';
  export let type = 'white';

  function handleClick() {
    if (swappable && onSwapClick) {
      onSwapClick($$props.ndx);
    }
    else if (onClick) {
      selected = !selected;
      onClick($$props.ndx);
    }
  }

  const transformAnswer = (t, a) => {
    let ret = t;

    if (Array.isArray(a) && a.length) {
      const gaps = getGaps(t);

      if (!gaps.length) {
        ret = `${t}<span class="answer">${a[0].trim()}</span>`;
      }
      else {
        ret = gaps.reduce((_t, gap, ndx) => {
          return _t.replace(gap, `<span class="answer gap">${a[ndx].trim().replace(/\.$/, '')}</span>`);
        }, t);
      }
    }
    
    return ret;
  }
</script>

<!-- TODO changed from div to button. verify styling -->
<!-- TODO should be a dynamic element, if white = button, else div -->
<button
  class="card"
  class:is--white={type === 'white'}
  class:is--black={type === 'black'}
  class:is--selected={selected}
  class:is--selectable={!!onClick && !selected}
  class:is--swappable={swappable}
  style={rotate ? `transform: rotate(${randomNumber(-2, 2)}deg);` : undefined}
  disabled={selected}
  on:click={!!onClick && handleClick}
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="card__text">{@html transformAnswer(text, answer)}</div>
</button>

<style>
  .card {
    font-size: 1.25em;
    padding: 1em;
    border: solid 1px #000;
    border-radius: 0.75em;
    opacity: 1;
    transition: opacity 300ms;
  }
  .card * {
    pointer-events: none;
  }
  .card.is--white {
    color: #000;
    background: #fff;
  }
  .card.is--black {
    color: #fff;
    background: #000;
  }
  .card.is--selectable {
    cursor: pointer;
  }
  .card.is--selected {
    cursor: default;
    opacity: 0.25;
    pointer-events: none;
  }
  .card.is--swappable {
    border-color: #27cfb6;
    border-width: 4px;
  }

  .card__text {
    font-size: 0.85em;
    max-height: 100%;
    overflow: auto;
  }

  :global(.answer) {
    color: yellow;
  }
  :global(.answer:not(.gap)) {
    margin-top: 0.5em;
    display: block;
  }

  @media (min-width: 850px) {
    .card {
      width: 10.5em;
      min-height: 14em;
      display: inline-block;
      vertical-align: top;
    }
  }
</style>