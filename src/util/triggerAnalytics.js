import { browser } from '$app/environment';

export default (pageName) => {
  const analyticsMetadata = `var wbgData = wbgData || {};
    wbgData.page = {
      pageInfo: {
        pageName: 'DEC > /sdgatlas/${pageName}',
        isDefaultPageName: 'n',
        pageCategory: 'content page',
        contentType: 'Data',
        channel: 'DEC The Atlas of Sustainable Development Goals 2023'
      }
    }
    wbgData.site = {
      pageLoad: 'N',
      siteInfo: {
        siteLanguage: 'en',
        siteType: 'DEC',
        siteEnv: 'QA'
      },
      techInfo: {
        cmsType: 'Sveltekit',
        bussVPUnit: 'DEC',
        bussUnit: 'DECDG',
        bussUserGroup: 'external',
        bussAgency: 'ibrd'
      }
    }`;

  if (browser) {
    // insert tracking code
  }
};
