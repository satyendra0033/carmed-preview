/**
 * CAR MED SERVICE GmbH — Frontend Interaction, GDPR Consent Mode v2 & Conversion Tracking
 * Strictly blocks non-essential tracking (GTM / GA4 / Google Ads / Matelso / Microsoft Clarity)
 * until explicit user consent (DSGVO / TDDDG compliant).
 */

(function () {
  'use strict';

  const TRACKING_CONFIG = {
    gtmId: 'GTM-WGX3RRPP', // Preserved from live CAR MED Contao installation
    ga4Id: '', // Managed via GTM-WGX3RRPP or optional direct Measurement ID
    googleAdsId: '', // Managed via GTM-WGX3RRPP
    clarityProjectId: '', // Optional Microsoft Clarity Project ID (loaded only after consent)
    recipientEmail: 'info@car-med-service.com'
  };

  // Initialize dataLayer with default denied consent (GDPR / TDDDG compliant)
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  // Track conversion events safely in dataLayer (for GTM, GA4, Google Ads)
  function trackConversionEvent(eventName, params) {
    window.dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString()
    });
  }

  let scriptsInjected = false;
  function loadConsentedTrackingScripts() {
    if (scriptsInjected) return;
    scriptsInjected = true;

    // 1. Load Google Tag Manager (GTM-WGX3RRPP) only after explicit consent
    if (TRACKING_CONFIG.gtmId) {
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', TRACKING_CONFIG.gtmId);
    }

    // 2. Load Microsoft Clarity if configured
    if (TRACKING_CONFIG.clarityProjectId) {
      (function (c, l, a, r, i, t, y) {
        c[a] =
          c[a] ||
          function () {
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'script', 'clarity', TRACKING_CONFIG.clarityProjectId);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.textContent = isOpen ? '✕ Schließen' : '☰ Menü';
      });
    }

    // 2. Click Tracking for Phone, Email, Maps & Main CTAs
    document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
      el.addEventListener('click', () => {
        trackConversionEvent('phone_click', {
          phone_number: el.getAttribute('href'),
          page_path: window.location.pathname
        });
      });
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach((el) => {
      el.addEventListener('click', () => {
        trackConversionEvent('email_click', {
          email: el.getAttribute('href'),
          page_path: window.location.pathname
        });
      });
    });

    document.querySelectorAll('[data-track-cta]').forEach((el) => {
      el.addEventListener('click', () => {
        trackConversionEvent('cta_click', {
          cta_label: el.getAttribute('data-track-cta'),
          page_path: window.location.pathname
        });
      });
    });

    document.querySelectorAll('[data-track-directions]').forEach((el) => {
      el.addEventListener('click', () => {
        trackConversionEvent('directions_click', {
          destination: 'Donatusstraße 101, 50767 Köln',
          page_path: window.location.pathname
        });
      });
    });

    // 3. Inquiry Form Handling & B2B/B2C Dynamic Field Toggle
    const customerTypeSelect = document.getElementById('customer_type');
    const companyGroup = document.getElementById('company_group');
    if (customerTypeSelect && companyGroup) {
      const updateCompanyVisibility = () => {
        const isB2B = customerTypeSelect.value === 'Geschaeftskunde';
        const companyInput = document.getElementById('company');
        const companyLabel = companyGroup.querySelector('label');
        if (companyInput) {
          companyInput.required = isB2B;
          companyInput.placeholder = isB2B
            ? 'Firmenname & Flottengröße (z. B. Muster Logistik GmbH – 25 Transporter)'
            : 'Firmenname (optional für Privatkunden)';
        }
        if (companyLabel) {
          companyLabel.textContent = isB2B
            ? 'Unternehmen & Flottengröße *'
            : 'Unternehmen (optional)';
        }
      };
      customerTypeSelect.addEventListener('change', updateCompanyVisibility);
      updateCompanyVisibility();
    }

    // URL Parameter Pre-selection for Service & Customer Type
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const typeParam = urlParams.get('type');
    const serviceSelect = document.getElementById('requested_service');
    if (serviceParam && serviceSelect) {
      for (const opt of serviceSelect.options) {
        if (opt.value.toLowerCase().includes(serviceParam.toLowerCase())) {
          serviceSelect.value = opt.value;
          break;
        }
      }
    }
    if (typeParam && customerTypeSelect) {
      if (typeParam.toLowerCase().includes('flotte') || typeParam.toLowerCase().includes('b2b')) {
        customerTypeSelect.value = 'Geschaeftskunde';
        customerTypeSelect.dispatchEvent(new Event('change'));
      }
    }

    // 4. Working Form Submission & Lead Delivery
    const forms = document.querySelectorAll('.carmed-enquiry-form');
    forms.forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Anfrage wird übermittelt...';
        }

        const formData = new FormData(form);
        const payload = {
          customer_type: formData.get('customer_type') || 'Privatkunde',
          requested_service: formData.get('requested_service') || 'Allgemeine Anfrage',
          fullname: formData.get('fullname') || '',
          company: formData.get('company') || '-',
          phone: formData.get('phone') || '',
          email: formData.get('email') || '',
          vehicle_info: formData.get('vehicle_info') || '-',
          preferred_date: formData.get('preferred_date') || '-',
          message: formData.get('message') || '',
          source_url: window.location.href,
          _subject: `Neue Website-Anfrage (${formData.get('customer_type') || 'Kunde'}): ${formData.get('requested_service') || 'Service'} – CAR MED SERVICE`
        };

        // Fire GA4 / GTM / Google Ads conversion event
        trackConversionEvent(
          payload.customer_type === 'Geschaeftskunde' ? 'fleet_enquiry_submit' : 'contact_form_submit',
          {
            customer_type: payload.customer_type,
            requested_service: payload.requested_service,
            page_path: window.location.pathname
          }
        );

        let deliveredViaApi = false;
        try {
          const res = await fetch(`https://formsubmit.co/ajax/${TRACKING_CONFIG.recipientEmail}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            deliveredViaApi = true;
          }
        } catch (err) {
          deliveredViaApi = false;
        }

        const mailtoSubject = encodeURIComponent(
          `Werkstatt-Anfrage (${payload.customer_type}): ${payload.requested_service}`
        );
        const mailtoBody = encodeURIComponent(
          `Guten Tag Herr Stoyanov, guten Tag CAR MED Team,\n\n` +
            `hiermit sende ich folgende Reparatur-/Serviceanfrage:\n\n` +
            `• Kundentyp: ${payload.customer_type}\n` +
            `• Gewünschte Leistung: ${payload.requested_service}\n` +
            `• Name: ${payload.fullname}\n` +
            `• Unternehmen: ${payload.company}\n` +
            `• Telefon: ${payload.phone}\n` +
            `• E-Mail: ${payload.email}\n` +
            `• Fahrzeug / Kennzeichen / FIN: ${payload.vehicle_info}\n` +
            `• Wunschtermin: ${payload.preferred_date}\n\n` +
            `Nachricht:\n${payload.message}\n`
        );
        const mailtoHref = `mailto:${TRACKING_CONFIG.recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

        const feedbackBox = form.querySelector('.form-feedback');
        if (feedbackBox) {
          feedbackBox.style.display = 'block';
          feedbackBox.innerHTML = `
            <div style="background:#dcfce7;border:1px solid #15803d;color:#14532d;padding:18px;border-radius:8px;margin-top:16px;">
              <strong>✓ Vielen Dank, ${payload.fullname}! Ihre Anfrage wurde erfasst.</strong><br>
              Wir haben Ihre Anfrage zu <strong>${payload.requested_service}</strong> (${payload.customer_type}) registriert. Unser Vertriebsleiter <strong>Done Stoyanov</strong> bzw. unser Meisterteam in der Donatusstraße 101, Köln meldet sich zeitnah unter <strong>${payload.phone}</strong> bei Ihnen.
              <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:10px;">
                <a href="${mailtoHref}" class="btn btn-primary btn-sm">✉️ Kopie direkt per E-Mail-Programm senden</a>
                <a href="tel:+4915732225262" class="btn btn-outline-dark btn-sm">📞 Direkt anrufen: +49 157 32225262</a>
              </div>
              ${
                deliveredViaApi
                  ? '<small style="display:block;margin-top:8px;color:#166534;">Status: Online-Übermittlung an info@car-med-service.com erfolgreich ausgelöst.</small>'
                  : '<small style="display:block;margin-top:8px;color:#166534;">Tipp: Klicken Sie optional auf „Kopie direkt per E-Mail-Programm senden“ für den sofortigen Direktversand an info@car-med-service.com.</small>'
              }
            </div>
          `;
          form.reset();
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    });

    // 5. GDPR Consent Banner (Consent Mode v2)
    const CONSENT_KEY = 'carmed_gdpr_consent_v2';
    const banner = document.getElementById('consent-banner');
    const savedConsent = localStorage.getItem(CONSENT_KEY);

    if (!savedConsent && banner) {
      banner.classList.add('visible');
    } else if (savedConsent === 'all') {
      grantAnalyticsConsent();
    }

    const btnAcceptAll = document.getElementById('consent-accept-all');
    const btnEssential = document.getElementById('consent-essential');
    const btnOpenConsent = document.querySelectorAll('[data-open-consent]');

    if (btnAcceptAll) {
      btnAcceptAll.addEventListener('click', () => {
        localStorage.setItem(CONSENT_KEY, 'all');
        grantAnalyticsConsent();
        if (banner) banner.classList.remove('visible');
      });
    }

    if (btnEssential) {
      btnEssential.addEventListener('click', () => {
        localStorage.setItem(CONSENT_KEY, 'essential');
        if (banner) banner.classList.remove('visible');
      });
    }

    btnOpenConsent.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (banner) banner.classList.add('visible');
      });
    });
  });

  function grantAnalyticsConsent() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
    loadConsentedTrackingScripts();
  }
})();
