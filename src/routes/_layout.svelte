<script>
  import { titleSuffix } from '../store';

  const title = 'CAH-Box';
</script>

<svelte:head>
  <title>{`${title}${$titleSuffix ? ` | ${$titleSuffix}` : ''}`}</title>
  <style>
    html, body {
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }

    button {
      cursor: pointer;
    }

    #sapper {
      width: 100%;
      height: 100%;
    }
  </style>
</svelte:head>

<slot></slot>
