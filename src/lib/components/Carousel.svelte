<div class="carousel">
  <div class="carousel-scroller">
    <div class="box" />
    <div class="box" />
    <div class="box" />
    <div class="box" />
    <div class="box" />
  </div>
</div>

<style>
  .carousel {
    grid-column: content;
  }

  .carousel-scroller {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }

  .box {
    width: var(--col-4);
    min-width: var(--col-4);
    margin-right: var(--grid-gutter);
    height: 50px;
    background-color: purple;
  }

  .box:last-of-type {
    margin-right: 0;
  }
</style>
