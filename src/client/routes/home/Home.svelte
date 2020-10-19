<style>
  .start-form {
    max-width: 440px;
  }

  p {
    font-size: 0.9em;
    text-align: center;
  }

  @media (max-width: 849px) {
    .start-form {
      font-size: 0.7em;
    }

    p {
      font-size: 0.7em;
    }
  }
</style>

<script>
  import Modal from '../../components/Modal.svelte';
  import GameEntry from '../../components/GameEntry.svelte';
</script>

<Modal open>
  <div class="start-form">
    <p>
      Welcome to CAH-Box! A mashup of Cards Against Humanity and Jackbox games.
    </p>
    <GameEntry />
  </div>
</Modal>
