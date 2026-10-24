/* GA4: production only. Event parameters are fixed labels, never form values. */
(() => {
  'use strict';
  if (window.location.hostname !== 'lad-pocket.vercel.app') return;

  const measurementId = 'G-MGM1BK0TZD';
  const features = { cal: 'calendar', calc: 'converter', budget: 'wallet' };
  const actions = {
    calendar: ['month_change', 'date_select', 'filter_change'],
    converter: ['calculate', 'pack_quantity', 'pack_recommendation', 'pack_record_prefill'],
    wallet: ['budget_save', 'expense_add', 'expense_edit'],
  };
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Keep campaign attribution, discard arbitrary query strings and fragments.
  const pageUrl = new URL(window.location.origin + window.location.pathname);
  const incoming = new URLSearchParams(window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id']) {
    const value = incoming.get(key);
    if (value && /^[\w.~-]{1,100}$/.test(value)) pageUrl.searchParams.set(key, value);
  }
  let referrer = '';
  try { referrer = new URL(document.referrer).origin; } catch (_) { /* direct visit */ }
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_location: pageUrl.href,
    page_referrer: referrer,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  let currentFeature;
  window.LAD_ANALYTICS = {
    view(tab) {
      const feature = Object.hasOwn(features, tab) ? features[tab] : null;
      if (!feature || feature === currentFeature) return;
      currentFeature = feature;
      window.gtag('event', 'feature_view', { feature });
    },
    use(feature, action) {
      if (!Object.hasOwn(actions, feature) || !actions[feature].includes(action)) return;
      window.gtag('event', 'app_use', { feature, action });
    },
  };

  // Programmatic initialization/restoration emits no usage event.
  let calculationTimer;
  const calculatorInputs = ['curDia', 'curTickets', 'targetPulls', 'reservePulls', 'officialTickets'];
  document.addEventListener('input', event => {
    if (!calculatorInputs.includes(event.target?.id)) return;
    clearTimeout(calculationTimer);
    calculationTimer = setTimeout(() => window.LAD_ANALYTICS.use('converter', 'calculate'), 800);
  });
  document.addEventListener('change', event => {
    if (!['poolSel', 'packCurrency'].includes(event.target?.id)) return;
    clearTimeout(calculationTimer);
    window.LAD_ANALYTICS.use('converter', 'calculate');
  });
  window.LAD_ANALYTICS.view(document.querySelector('nav button[data-tab].active')?.dataset.tab);

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(script);
})();
