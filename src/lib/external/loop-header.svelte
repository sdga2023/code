<script>
  import './loop-header-footer/css/style.scss';

  import LanguagePicker from '$lib/components/LanguagePicker.svelte';
  import NavigationMobile from '$lib/components/NavigationMobile.svelte';
  import { activeGoal } from '$lib/stores/activeGoal.js';
  import ReferenceCountrySelector from '$lib/components/ReferenceCountrySelector.svelte';
  import ReferenceContainerMobile from '$lib/components/ReferenceContainerMobile.svelte';

  import { base } from '$app/paths';
  import { isMobile } from '$lib/stores/isMobile';

  export let screenshot = false;
</script>

<header class:screenshot>
  <nav class="navbar navbar-default" aria-flowto="sdg-nav">
    <div class="container">
      <div class="navbar-header">
        <a href="https://www.worldbank.org"
          ><img
            class:desktop={true}
            title="World Bank Logo"
            alt="World Bank Logo"
            src="{base}/assets/external/loop-header-footer/img/logo-wb-header-en.svg"
          />
          <img
            class:mobile={true}
            title="World Bank Logo"
            alt="World Bank Logo"
            src="{base}/assets/external/loop-header-footer/img/logo-wb.svg"
          />
        </a>
        |
        <div class="navbar-text">
          <a href="{base}/"
            ><img title="SDG Atlas Logo" alt="SDG Atlas logo" src="{base}/assets/external/loop-header-footer/img/logo-atlas.svg" /></a
          >
        </div>
      </div>
      <!-- End Logo Section -->
      <div class="navigate">
        <!--
        <div class="ref-country-selector desktop">
          <ReferenceCountrySelector />
        </div>
        -->
        <div class="ref-country-selector">
          <ReferenceContainerMobile />
        </div>
        <div class="lang-switch">
          <LanguagePicker />
        </div>
        <div class="navigation">
          <NavigationMobile />
        </div>
      </div>
    </div>
    <!-- /.container-fluid -->
  </nav>
</header>

<style>
  header {
    height: var(--loop-header-height);
    position: sticky;
    top: 0;
    width: 100%;
    background-color: white;
    z-index: 101;
    padding: 0px 12px 0 15px;

    filter: drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.2));
  }

  header img.mobile,
  header div.mobile {
    display: none;
  }
  header div.navigation.mobile {
    display: block;
  }

  header div.ref-country-selector {
    height: 100%;
    display: flex;
    align-items: center;
    font-size: var(--font-size-s);
    color: var(--color-reference-country);
  }

  header.screenshot {
    display: none;
  }

  header .container {
    width: 100%;
    max-width: 100%;
    height: var(--loop-header-height);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  header img {
    height: 30px;
  }

  header .navbar-header {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    color: var(--color-grey-200);
  }
  header .navbar-text {
    font-family: var(--font-families-andes);
    font-weight: var(--font-weights-bold);
  }

  header .navigate {
    display: flex;
    align-items: center;
    height: 100%;
    gap: var(--space-s);
  }
  header .lang-switch {
    width: 41px;
    display: flex;
    justify-content: center;

    pointer-events: none;
    display: none;
  }

  @media screen and (max-width: 1024px) {
    header img.desktop {
      display: none;
    }
    header img.mobile {
      display: block;
    }
  }
  @media screen and (max-width: 872px) {
    header .lang-switch {
      display: none;
    }

    header .ref-country-selector.desktop {
      display: none;
    }

    header .ref-country-selector.mobile {
      display: block;
    }
  }

  @media screen and (max-width: 872px), (max-height: 599px), (hover: none) {
    header {
      position: fixed;
    }
  }
</style>
