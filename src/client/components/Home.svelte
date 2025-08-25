<script>
  import Dialog from './Dialog.svelte';
  import GameEntry from './GameEntry.svelte';
</script>

<Dialog modal>
  {#snippet s_dialogBody()}
    <div class="start-form">
      <p>
        Welcome to CAH-Box! A mashup of Cards Against Humanity and Jackbox games.
      </p>
      <GameEntry />
    </div>
  {/snippet}
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
