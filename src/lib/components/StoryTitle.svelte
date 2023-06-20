<script>
  export let title;
</script>

<h1 class="layout-main">{title}</h1>

<style type="scss">
  h1 {
    font-family: var(--font-families-andes);
    font-size: var(--font-size-xl);
    color: var(--color-theme-text);
    line-height: var(--line-heights-120);
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.20);
    background-color: var(--color-theme-bg-weakest);
    text-align: center;

    width: calc(var(--col-8) + 2 * var(--space-m));
    transform: translate(0, -50%);
    padding: var(--space-m);
  }
</style>
