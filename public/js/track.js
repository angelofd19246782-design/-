(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const fmtKRW = (n) => '₩ ' + Number(n).toLocaleString('ko-KR');
  const STATUS_FLOW = ['new', 'collecting', 'on_the_way', 'delivered'];
  const t = (k, p, f) => (window.RadugaI18n ? window.RadugaI18n.t(k, p, f) : (f || k));
  const paymentLabel = (m) => t('checkout.' + m, null, m);

  document.getElementById('year').textContent = new Date().getFullYear();

  const form = $('#trackForm');
  const errorEl = $('#trackError');
  const resultEl = $('#trackResult');
  const btn = $('#trackBtn');

  // Pre-fill from query string (used after a successful order)
  const params = new URLSearchParams(location.search);
  if (params.get('orderNumber')) form.querySelector('[name="orderNumber"]').value = params.get('orderNumber');
  if (params.get('phone')) form.querySelector('[name="phone"]').value = params.get('phone');
  if (params.get('orderNumber') && params.get('phone')) {
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }

  let lastResult = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const data = new FormData(form);
    const orderNumber = String(data.get('orderNumber') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    if (!orderNumber || !phone) {
      return showError(t('track.missingFields'));
    }

    btn.disabled = true;
    btn.textContent = t('track.lookup');
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || t('track.notFound'));
      lastResult = json;
      renderResult(json);
    } catch (err) {
      resultEl.hidden = true;
      showError(err.message || t('track.notFound'));
    } finally {
      btn.disabled = false;
      btn.textContent = t('track.find');
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function renderResult(order) {
    $('#resOrderNumber').textContent = order.orderNumber;
    $('#resAddress').textContent = order.address;
    $('#resPayment').textContent = paymentLabel(order.paymentMethod);

    if (order.status === 'delivered') {
      $('#resEta').textContent = t('track.delivered');
    } else {
      $('#resEta').textContent = t('common.etaRange', { min: order.eta.min, max: order.eta.max });
    }

    const items = $('#resItems');
    items.innerHTML = '';
    for (const it of order.items || []) {
      const li = document.createElement('li');
      li.innerHTML = `<span></span><span>${fmtKRW(it.price * it.quantity)}</span>`;
      // Product name comes from DB and stays as-is
      li.firstElementChild.textContent = `${it.name} × ${it.quantity}`;
      items.appendChild(li);
    }
    $('#resTotal').textContent = fmtKRW(order.total);

    const idx = STATUS_FLOW.indexOf(order.status);
    document.querySelectorAll('#statusTrack li').forEach((li) => {
      const s = li.dataset.status;
      const i = STATUS_FLOW.indexOf(s);
      li.classList.remove('done', 'current');
      if (i < idx) li.classList.add('done');
      else if (i === idx) li.classList.add('current');
    });

    resultEl.hidden = false;
  }

  // Re-render localized parts of the result on language switch
  document.addEventListener('i18n:changed', () => {
    if (lastResult) renderResult(lastResult);
  });
})();
