<style>
  .card {
    font-size: 1.25em;
    padding: 1em;
    border: solid 1px #000;
    border-radius: 0.75em;
  }
  .card.is--white {
    color: #000;
    background: #fff;
  }
  .card.is--black {
    color: #fff;
    background: #000;
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
  export let text = '';
  export let type = 'white';
</script>

<div
  class="card"
  class:is--white={type === 'white'}
  class:is--black={type === 'black'}
>
  <div class="card__text">{text}</div>
</div>