<div class="grid-test">
  <div class="layout-content">
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
    <div class="single" />
  </div>

  <div class="layout-content">
    <div class="double" />
    <div class="double" />
    <div class="double" />
    <div class="double" />
    <div class="double" />
    <div class="double" />
  </div>

  <div class="layout-content">
    <div class="triple" />
    <div class="triple" />
    <div class="triple" />
    <div class="triple" />
  </div>

  <div class="layout-content">
    <div class="quadruple" />
    <div class="quadruple" />
    <div class="quadruple" />
  </div>

  <div class="layout-content">
    <div class="quintuple" />
    <div class="quintuple" />
    <div class="double" />
  </div>

  <div class="layout-content">
    <div class="sixtuple" />
    <div class="sixtuple" />
  </div>
</div>

<style>
  .grid-test {
    margin-top: 200px;
    margin-bottom: 200px;
  }

  .layout-content {
    display: flex;
    gap: var(--grid-gutter);
    flex-wrap: wrap;

    margin-bottom: 50px;
  }

  .single,
  .double,
  .triple,
  .quadruple,
  .quintuple,
  .sixtuple {
    height: 20px;
  }

  .single {
    width: var(--col-1);
    background-color: pink;
  }
  .double {
    width: var(--col-2);
    background-color: cyan;
  }
  .triple {
    width: var(--col-3);
    background-color: magenta;
  }
  .quadruple {
    width: var(--col-4);
    background-color: red;
  }
  .quintuple {
    width: var(--col-5);
    background-color: green;
  }
  .sixtuple {
    width: var(--col-6);
    background-color: blue;
  }
</style>
