<script>
  import variables from '$lib/variables';
  import { base } from '$app/paths';

  import './loop-header-footer/css/style.scss';
</script>

<!-- Begin  Global footer -->
<footer class="simplified-footer loop">
  <div class="row full-row-footer-components">
    <div class="container">
      <div class="lp__footer_top" />
      <!-- End right column footer follow and newsletter section -->
      <div class="row">
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <div class="lp__footer_bottom">
            <div class="row">
              <div class="col-lg-6 col-md-7 col-sm-12 col-xs-12">
                <div class="lp__listinline">
                  <ul>
                    <li class="disclaimer">
                      <a href="https://www.worldbank.org/en/about/legal">Legal</a>
                    </li>
                    <li class="disclaimer">
                      <a href="https://www.worldbank.org/en/about/legal/privacy-notice">Privacy Notice</a>
                    </li>
                    <li class="disclaimer">
                      <a href="https://www.worldbank.org/en/who-we-are/site-accessibility">Site Accessibility</a>
                    </li>
                    <li class="disclaimer">
                      <a href="https://www.worldbank.org/en/access-to-information">Access to Information</a>
                    </li>
                    <li class="disclaimer">
                      <a href="https://www.worldbank.org/en/about/careers">Jobs</a>
                    </li>
                    <li class="disclaimer">
                      <a href="https://www.worldbank.org/en/about/contacts">Contact</a>
                    </li>
                  </ul>
                </div>
              </div>
              <!-- End disclaimer-->
              <div class="col-lg-6 col-md-5 col-sm-12 col-xs-12">
                <div class="lp__footer_fraud">
                  <ul>
                    <li><a href="https://www.worldbank.org/en/about/legal/scams">SCAM ALERT</a></li>
                    <li>
                      <a href="https://wbgcmsprod.microsoftcrmportals.com/en-US/anonymous-users/int-fraud-management/create-new-complaint/"
                        >REPORT FRAUD OR CORRUPTION</a
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <!-- End disclaimer and copy right -->
        </div>
      </div>
      <!-- End footer Bottom row -->
    </div>
  </div>
  <!-- End Top Footer -->
  <!-- Begin bottom Footer -->
  <div class="row full-row-footer-black-components">
    <div class="container">
      <div class="row">
        <div class="lp__footer_bottom_left">
          <div class="col-md-12 col-sm-12 col-xs-12">
            <ul>
              <li>
                <a href="https://www.worldbank.org">
                  <img
                    src="{base}/assets/external/loop-header-footer/img/logo-wbg-footer-en.svg"
                    class="footer-logo"
                    title="World Bank Group logo"
                    alt="World Bank Group logo"
                  /></a
                >
              </li>
              <li>
                <a
                  class="lp__wbgpartnership"
                  title="International Bank for Reconstruction and Development"
                  href="https://www.worldbank.org/en/who-we-are/ibrd">IBRD</a
                >
              </li>
              <li>
                <a class="lp__wbgpartnership" title="International Development Association" href="https://ida.worldbank.org/">IDA</a>
              </li>
              <li>
                <a class="lp__wbgpartnership" title="International Finance Corporation" href="https://www.ifc.org">IFC</a>
              </li>
              <li>
                <a class="lp__wbgpartnership" title="Multilateral Investment Guarantee Agency" href="https://www.miga.org/">MIGA</a>
              </li>
              <li>
                <a
                  class="lp__wbgpartnership"
                  title="International Centre for Settlement of Investment Disputes"
                  href="https://icsid.worldbank.org">ICSID</a
                >
              </li>
            </ul>
          </div>
        </div>
        <!-- End logo and Wbg partnership -->

        <div class="lp__copyright">
          <div class="col-md-12 col-sm-12 col-xs-12">
            © <span id="footer-year" />
            <script language="JavaScript">
              var time = new Date();
              var year = time.getYear();
              if (year < 2000) year = year + 1900;
              document.getElementById('footer-year').innerHTML = year;
              // End -->
            </script>
            The World Bank Group, All Rights Reserved.
          </div>
        </div>
        <!-- End dropdown and fraud  -->
      </div>
    </div>
  </div>
</footer>
<!-- End  Global footer -->
