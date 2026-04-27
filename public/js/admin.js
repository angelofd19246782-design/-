(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const fmtKRW = (n) => '₩ ' + Number(n).toLocaleString('ko-KR');
  const t = (k, p, f) => (window.RadugaI18n ? window.RadugaI18n.t(k, p, f) : (f || k));

  const STATUS_FLOW = ['new', 'collecting', 'on_the_way', 'delivered'];
  const NEXT_STATUS = {
    new:        { value: 'collecting', labelKey: 'admin.startCollecting' },
    collecting: { value: 'on_the_way',  labelKey: 'admin.markOnTheWay' },
    on_the_way: { value: 'delivered',   labelKey: 'admin.markDelivered' }
  };
  const statusLabel = (s) => t('status.' + (s === 'new' ? 'newShort' : s), null, s);
  const paymentLabel = (m) => t('checkout.' + m, null, m);

  function statusPill(status) {
    const I = window.RadugaIcons;
    const iconName = I && I.statusIcons[status];
    const icon = iconName ? `<span class="status-icon">${I.get(iconName)}</span>` : '';
    return `<span class="status-pill ${status}">${icon}${statusLabel(status)}</span>`;
  }

  const state = {
    orders: [],
    filter: 'all',
    selectedId: null,
    selectedDetail: null  // cache last loaded detail so we can re-render on lang switch
  };

  // ---------- Auth check ----------
  fetch('/api/admin/me').then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!j.authenticated) location.href = '/admin/login';
    else {
      state.userName = j.name || '';
      $('#whoami').textContent = j.name ? t('admin.whoami', { name: j.name }) : '';
    }
  });

  // ---------- Filters ----------
  $$('.admin-filters .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.admin-filters .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      renderOrders();
    });
  });

  // ---------- Buttons ----------
  $('#refreshBtn').addEventListener('click', loadOrders);
  $('#logoutBtn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    location.href = '/admin/login';
  });

  // ---------- Load ----------
  const ordersListEl = $('#ordersList');
  const loadingEl = $('#ordersLoading');
  const errorEl = $('#ordersError');
  const emptyEl = $('#ordersEmpty');
  const detailEl = $('#adminDetail');

  async function loadOrders() {
    loadingEl.hidden = false; errorEl.hidden = true; emptyEl.hidden = true;
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) { location.href = '/admin/login'; return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      state.orders = data.orders || [];
      loadingEl.hidden = true;
      renderStats();
      renderOrders();
      if (state.selectedId) {
        const stillThere = state.orders.find((o) => o.id === state.selectedId);
        if (stillThere) loadDetail(state.selectedId);
      }
    } catch {
      loadingEl.hidden = true;
      errorEl.hidden = false;
    }
  }

  function renderStats() {
    const counts = { new: 0, collecting: 0, on_the_way: 0, delivered_today: 0 };
    const todayLocal = new Date().toLocaleDateString('en-CA');
    for (const o of state.orders) {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
      if (o.status === 'delivered') {
        const d = new Date(String(o.updated_at || o.created_at).replace(' ', 'T') + 'Z');
        if (d.toLocaleDateString('en-CA') === todayLocal) counts.delivered_today += 1;
      }
    }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('statNew', counts.new);
    set('statCollecting', counts.collecting);
    set('statOnTheWay', counts.on_the_way);
    set('statDelivered', counts.delivered_today);
  }

  function renderOrders() {
    const filtered = state.filter === 'all'
      ? state.orders
      : state.orders.filter((o) => o.status === state.filter);

    emptyEl.hidden = filtered.length !== 0;
    ordersListEl.innerHTML = '';

    for (const o of filtered) {
      const li = document.createElement('li');
      li.className = 'order-row' + (state.selectedId === o.id ? ' active' : '');
      li.innerHTML = `
        <div class="order-row-top">
          <span class="order-row-num"></span>
          ${statusPill(o.status)}
        </div>
        <div class="order-row-name"></div>
        <div class="order-row-meta">
          <span></span>
          <span></span>
        </div>
      `;
      li.querySelector('.order-row-num').textContent = o.order_number;
      li.querySelector('.order-row-name').textContent = o.customer_name;
      const metaSpans = li.querySelectorAll('.order-row-meta span');
      metaSpans[0].textContent = fmtKRW(o.total);
      metaSpans[1].textContent = relativeTime(o.created_at);
      li.addEventListener('click', () => loadDetail(o.id));
      ordersListEl.appendChild(li);
    }
  }

  function relativeTime(sqlIso) {
    if (!sqlIso) return '';
    const d = new Date(sqlIso.replace(' ', 'T') + 'Z');
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('time.justNow');
    if (mins < 60) return t('time.minAgo', { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('time.hAgo', { n: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return t('time.dAgo', { n: days });
    return d.toLocaleDateString();
  }

  // ---------- Detail ----------
  async function loadDetail(id) {
    state.selectedId = id;
    $$('.order-row').forEach((r) => r.classList.remove('active'));
    renderOrders();
    detailEl.innerHTML = `<div class="state">${escapeHtml(t('admin.loadingOrder'))}</div>`;
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      state.selectedDetail = { order: data.order, items: data.items || [] };
      renderDetail(data.order, data.items || []);
    } catch {
      detailEl.innerHTML = `<div class="state state-error">${escapeHtml(t('admin.loadFailed'))}</div>`;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderDetail(o, items) {
    const next = NEXT_STATUS[o.status];

    const itemsHtml = items.map((it) => `
      <li>
        <span class="item-name"></span>
        <span class="qty-pill">× ${it.quantity}</span>
        <span class="item-total">${fmtKRW(it.price * it.quantity)}</span>
      </li>
    `).join('');

    const etaText = o.status === 'delivered'
      ? t('common.delivered')
      : t('common.etaRange', { min: o.eta_min, max: o.eta_max });

    detailEl.innerHTML = `
      <div class="detail-head">
        <div>
          <span class="muted">${escapeHtml(t('admin.detailOrder'))}</span>
          <h2></h2>
          <span class="muted detail-time"></span>
        </div>
        ${statusPill(o.status)}
      </div>

      <div class="detail-grid">
        <div class="detail-block">
          <h3>${escapeHtml(t('admin.detailCustomer'))}</h3>
          <p class="detail-customer"></p>
          <p class="muted detail-phone"></p>
        </div>
        <div class="detail-block">
          <h3>${escapeHtml(t('admin.detailDelivery'))}</h3>
          <p class="detail-address"></p>
        </div>
        <div class="detail-block">
          <h3>${escapeHtml(t('admin.detailPayment'))}</h3>
          <p>${escapeHtml(paymentLabel(o.payment_method))}</p>
        </div>
        <div class="detail-block">
          <h3>${escapeHtml(t('admin.detailEta'))}</h3>
          <p>${escapeHtml(etaText)}</p>
        </div>
      </div>

      <div class="detail-items">
        <h3>${escapeHtml(t('admin.detailItems'))}</h3>
        <ul>${itemsHtml}</ul>
      </div>

      <div class="detail-total"><span>${escapeHtml(t('admin.detailTotal'))}</span><strong>${fmtKRW(o.total)}</strong></div>

      <div class="detail-actions">
        ${next ? `<button class="btn btn-primary" data-next="${next.value}">${escapeHtml(t(next.labelKey))}</button>` : ''}
        ${o.status !== 'delivered' && o.status !== 'new' ? `<button class="btn btn-ghost" data-next="new">${escapeHtml(t('admin.resetNew'))}</button>` : ''}
        ${o.status === 'delivered' ? `<button class="btn btn-ghost" disabled>${escapeHtml(t('admin.completed'))}</button>` : ''}
      </div>
    `;

    detailEl.querySelector('.detail-head h2').textContent = o.order_number;
    detailEl.querySelector('.detail-time').textContent = relativeTime(o.created_at);
    detailEl.querySelector('.detail-customer').textContent = o.customer_name;
    detailEl.querySelector('.detail-phone').textContent = o.phone;
    detailEl.querySelector('.detail-address').textContent = o.address;

    items.forEach((it, idx) => {
      detailEl.querySelectorAll('.item-name')[idx].textContent = it.name;
    });

    detailEl.querySelectorAll('[data-next]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const status = btn.dataset.next;
        btn.disabled = true; btn.textContent = t('admin.updating');
        try {
          const res = await fetch(`/api/admin/orders/${o.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          if (!res.ok) throw new Error();
          await loadOrders();
        } catch {
          btn.disabled = false; btn.textContent = t('admin.retry');
        }
      });
    });
  }

  // ---------- React to language switch ----------
  document.addEventListener('i18n:changed', () => {
    if (state.userName) $('#whoami').textContent = t('admin.whoami', { name: state.userName });
    renderOrders();
    if (state.selectedDetail) renderDetail(state.selectedDetail.order, state.selectedDetail.items);
  });

  // ---------- Init ----------
  loadOrders();
  setInterval(loadOrders, 30000);
})();
