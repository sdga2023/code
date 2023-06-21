<script></script>

<div class="multiples-container">
  <slot />
</div>

<style>
  .multiples-container {
    width: 100%;
    display: flex;
    row-gap: var(--space-xl);
    column-gap: var(--grid-gutter);
    justify-content: center;
    flex-wrap: wrap;
    padding-top: var(--space-s-m);
    /* grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));*/
  }
</style>
