<script context="module">
  export const ICON__CLIPBOARD = 'clipboard';
	export const ICON__CZAR = 'crown';
  export const ICON__HOST = 'star';
  export const ICON__MENU = 'menu';
  export const ICON__REMOVE_USER = 'remove-user';
</script>
<script>
  let className = '';
  export { className as class };
  export let icon = undefined;
</script>

{#if icon}
	<svg class={`icon ${className}`}>
		<use
			xmlns:xlink="http://www.w3.org/1999/xlink"
			xlink:href={`#ui-icon__${icon}`}
		></use>  
	</svg>
{/if}

<style>
  .icon {
    width: 1em;
    height: 1em;
    fill: currentColor;
    display: inline-block;
    vertical-align: top;
    flex-shrink: 0;
  }
</style>