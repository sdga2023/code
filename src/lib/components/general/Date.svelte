<script>
  import { locale } from 'svelte-i18n';

  export let month; // <- month from 0 to 11
  export let year;

  let formattedMonth = '';
  $: {
    const dateObj = new Date();
    dateObj.setMonth(month ?? 0);
    formattedMonth = dateObj.toLocaleString($locale, { month: 'short' });
  }
</script>

{formattedMonth}
{year}
