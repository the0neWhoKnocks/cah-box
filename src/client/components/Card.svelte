<script>
  import getGaps from '../../utils/getGaps';
  import randomNumber from '../utils/randomNumber';

  let {
    answer = undefined,
    ndx = undefined,
    onClick = undefined,
    onSwapClick = undefined,
    rotate = false,
    selected = false,
    swappable = false,
    text = '',
    type = 'white',
  } = $props();
  
  const elType = type === 'white' ? 'button' : 'figure';
  const isBtn = elType === 'button';
  
  function handleClick() {
    if (swappable && onSwapClick) onSwapClick(ndx);
    else if (onClick) onClick(ndx);
  }

  const transformAnswer = (t, a) => {
    const gaps = getGaps(t);
    const genGap = (gap) => `<span role="img" aria-label="blank">${gap}</span>`;
    let ret = t;
    
    if (Array.isArray(a) && a.length) {
      if (!gaps.length) {
        ret = `${t}<span class="answer">${a[0].trim()}</span>`;
      }
      else {
        ret = gaps.reduce((_t, gap, _ndx) => {
          return (a[_ndx])
            ? _t.replace(gap, `<span class="answer gap">${a[_ndx].trim().replace(/\.$/, '')}</span>`)
            : _t.replace(gap, genGap(gap));
        }, t);
      }
    }
    else {
      ret = gaps.reduce((_t, gap) => {
        return _t.replace(gap, genGap(gap));
      }, t);
    }
    
    return ret;
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
  this={elType}
  class="card"
  class:is--white={type === 'white'}
  class:is--black={type === 'black'}
  class:is--selected={selected}
  class:is--selectable={isBtn ? !selected : undefined}
  class:is--swappable={swappable}
  data-ndx={ndx}
  disabled={isBtn ? selected : undefined}
  tabindex={!isBtn ? '0' : undefined}
  style={rotate ? `transform: rotate(${randomNumber(-2, 2)}deg);` : undefined}
  onclick={isBtn ? handleClick : undefined}
>
  <div class="for--reader">({#if type === 'white'}white {:else}black{/if} card)</div>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="card__text">{@html transformAnswer(text, answer)}</div>
</svelte:element>

<style>
  .card {
    font-size: 1.25em;
    padding: 1em;
    border: solid 1px #000;
    border-radius: 0.75em;
    opacity: 1;
    transition: opacity 300ms;
  }
  .card:focus-visible {
    outline: solid 0.5em #ffff00;
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
    margin: 0; /* remove `figure` styling */
    background: #000;
  }
  .card.is--selectable {
    cursor: pointer;
  }
  .card.is--selected {
    color: transparent;
    border-style: dashed;
    background: transparent;
    opacity: 0.25;
    pointer-events: none;
    cursor: default;
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
