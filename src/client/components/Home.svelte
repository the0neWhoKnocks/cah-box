<script>
  import Dialog from './Dialog.svelte';
  import GameEntry from './GameEntry.svelte';
</script>

<Dialog modal>
  <div class="start-form" slot="dialogBody">
    <p>
      Welcome to CAH-Box! A mashup of Cards Against Humanity and Jackbox games.
    </p>
    <GameEntry />
  </div>
</Dialog>

<style>
  p {
    text-align: center;
  }

  @media (max-width: 849px) {
    .start-form, p {
      font-size: 0.7em;
    }
  }
</style>
