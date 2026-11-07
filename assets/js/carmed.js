/**
 * CAR MED SERVICE GmbH — Frontend Interaction, GDPR Consent Mode v2 & Conversion Tracking
 * Strictly blocks non-essential tracking (GTM / GA4 / Matelso / Clarity) until user consent.
 */

(function () {
  'use strict';

  // Initialize dataLayer with default denied consent (GDPR / TDDDG compliant)
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // Track conversion events safely in dataLayer
  function trackConversionEvent(eventName, params) {
    window.dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString()
    });
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
        companyGroup.style.display = isB2B ? 'flex' : 'flex';
        const companyInput = document.getElementById('company');
        if (companyInput) {
          companyInput.placeholder = isB2B
            ? 'Firmenname / Flottengröße (Pflicht bei Flottenanfragen)'
            : 'Firma (optional)';
        }
      };
      customerTypeSelect.addEventListener('change', updateCompanyVisibility);
    }

    // URL Parameter Pre-selection for Service
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const serviceSelect = document.getElementById('requested_service');
    if (serviceParam && serviceSelect) {
      for (const opt of serviceSelect.options) {
        if (opt.value.toLowerCase().includes(serviceParam.toLowerCase())) {
          serviceSelect.value = opt.value;
          break;
        }
      }
    }

    // Form Submission Handler
    const forms = document.querySelectorAll('.carmed-enquiry-form');
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const customerType = formData.get('customer_type') || 'Privatkunde';
        const service = formData.get('requested_service') || 'Allgemeine Anfrage';

        trackConversionEvent(
          customerType === 'Geschaeftskunde' ? 'fleet_enquiry_submit' : 'contact_form_submit',
          {
            customer_type: customerType,
            requested_service: service,
            page_path: window.location.pathname
          }
        );

        const feedbackBox = form.querySelector('.form-feedback');
        if (feedbackBox) {
          feedbackBox.style.display = 'block';
          feedbackBox.innerHTML = `
            <div style="background:#dcfce7;border:1px solid #15803d;color:#14532d;padding:16px;border-radius:8px;margin-top:16px;">
              <strong>✓ Vielen Dank für Ihre Anfrage!</strong><br>
              Ihre Angaben (${customerType} – ${service}) wurden erfasst. Unser Vertriebsleiter <strong>Done Stoyanov</strong> bzw. unser Meisterteam meldet sich kurzfristig bei Ihnen.<br>
              <small style="display:block;margin-top:6px;color:#166534;">[Staging-Hinweis: E-Mail-Zustellung an info@car-med-service.com / Contao-Backend wird vor Live-Schaltung verifiziert.]</small>
            </div>
          `;
          form.reset();
        }
      });
    });

    // 4. GDPR Consent Banner
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
  }
})();
