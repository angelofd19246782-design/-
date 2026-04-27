(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const fmtKRW = (n) => '₩ ' + Number(n).toLocaleString('ko-KR');
  const STATUS_FLOW = ['new', 'collecting', 'on_the_way', 'delivered'];
  const PAYMENT_LABELS = {
    cash: 'Cash on delivery',
    transfer: 'Bank transfer',
    card: 'Card on delivery'
  };

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const data = new FormData(form);
    const orderNumber = String(data.get('orderNumber') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    if (!orderNumber || !phone) {
      return showError('Please enter both order number and phone.');
    }

    btn.disabled = true;
    btn.textContent = 'Looking up…';
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not find this order.');
      renderResult(json);
    } catch (err) {
      resultEl.hidden = true;
      showError(err.message || 'Could not find this order.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Find my order';
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function renderResult(order) {
    $('#resOrderNumber').textContent = order.orderNumber;
    $('#resAddress').textContent = order.address;
    $('#resPayment').textContent = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;

    if (order.status === 'delivered') {
      $('#resEta').textContent = 'Delivered';
    } else {
      $('#resEta').textContent = `${order.eta.min}–${order.eta.max} min`;
    }

    const items = $('#resItems');
    items.innerHTML = '';
    for (const it of order.items || []) {
      const li = document.createElement('li');
      li.innerHTML = `<span></span><span>${fmtKRW(it.price * it.quantity)}</span>`;
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
})();
