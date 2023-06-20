<script>
  import { faTwitter, faLinkedinIn, faFacebook } from '@fortawesome/free-brands-svg-icons';
  import Fa from 'svelte-fa/src/fa.svelte';
  import { _ } from 'svelte-i18n';

  export let shareUrl;
  export let title;

  $: text = encodeURI(title + ' ' + shareUrl);

  $: twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
  $: linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURI(shareUrl)}&title=${encodeURI(title)}`;
  $: facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(shareUrl)}&t=${encodeURI(title)}"`;
</script>

<a
  class="social-media-link"
  data-customlink="social-media:twitter"
  href={twitterUrl}
  target="_blank"
  rel="noreferrer"
  aria-label={$_('alt.twitter')}><Fa icon={faTwitter} /></a
>
<a
  class="social-media-link"
  data-customlink="social-media:linked-in"
  href={linkedInUrl}
  target="_blank"
  rel="noreferrer"
  aria-label={$_('alt.linkedin')}><Fa icon={faLinkedinIn} /></a
>
<a
  class="social-media-link"
  data-customlink="social-media:facebook"
  href={facebookUrl}
  target="_blank"
  rel="noreferrer"
  aria-label={$_('alt.facebook')}><Fa icon={faFacebook} /></a
>

<style>
  .social-media-link :global(.svelte-fa) {
    display: inline-block;
    margin: 0 var(--space-2xs);
  }

  .social-media-link:hover {
    color: var(--color-theme-primary-stronger);
  }
</style>
