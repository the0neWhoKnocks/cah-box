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
  .card.is--selectedable {
    cursor: pointer;
  }
  .card.is--selected {
    cursor: default;
    opacity: 0.25;
    pointer-events: none;
  }

  .card__text {
    font-size: 0.85em;
    max-height: 100%;
    overflow: auto;
  }

  @media (min-width: 1024px) {
    .card {
      width: 10.5em;
      height: 14em;
      display: inline-block;
      vertical-align: top;
    }
  }
</style>

<script>
  import randomNumber from '../utils/randomNumber';

  export let onClick;
  export let rotate = false;
  export let selected = false;
  export let text = '';
  export let type = 'white';

  function handleClick() {
    if (onClick) {
      selected = !selected;
      onClick($$props.ndx);
    }
  }
</script>

<div
  class="card"
  class:is--white={type === 'white'}
  class:is--black={type === 'black'}
  class:is--selected={selected}
  class:is--selectedable={!!onClick}
  style={rotate ? `transform: rotate(${randomNumber(-3, 3)}deg);` : undefined}
  on:click={handleClick}
>
  <div class="card__text">{text}</div>
</div>