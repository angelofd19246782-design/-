(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const fmtKRW = (n) => '₩ ' + Number(n).toLocaleString('ko-KR');

  const STATUS_LABELS = {
    new: 'New',
    collecting: 'Collecting',
    on_the_way: 'On the way',
    delivered: 'Delivered'
  };
  const PAYMENT_LABELS = {
    cash: 'Cash on delivery',
    transfer: 'Bank transfer',
    card: 'Card on delivery'
  };
  const NEXT_STATUS = {
    new: { value: 'collecting', label: 'Start collecting' },
    collecting: { value: 'on_the_way', label: 'Mark as on the way' },
    on_the_way: { value: 'delivered', label: 'Mark as delivered' }
  };

  function statusPill(status) {
    const I = window.RadugaIcons;
    const iconName = I && I.statusIcons[status];
    const icon = iconName ? `<span class="status-icon">${I.get(iconName)}</span>` : '';
    return `<span class="status-pill ${status}">${icon}${STATUS_LABELS[status] || status}</span>`;
  }

  const state = {
    orders: [],
    filter: 'all',
    selectedId: null
  };

  // ---------- Auth check ----------
  fetch('/api/admin/me').then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!j.authenticated) location.href = '/admin/login';
    else $('#whoami').textContent = j.name ? `Hi, ${j.name}` : '';
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
        // SQLite created_at is UTC ('YYYY-MM-DD HH:MM:SS'); compare in local TZ
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
    // SQLite 'YYYY-MM-DD HH:MM:SS' is in UTC
    const d = new Date(sqlIso.replace(' ', 'T') + 'Z');
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} d ago`;
    return d.toLocaleDateString();
  }

  // ---------- Detail ----------
  async function loadDetail(id) {
    state.selectedId = id;
    $$('.order-row').forEach((r) => r.classList.remove('active'));
    renderOrders();
    detailEl.innerHTML = '<div class="state">Loading order…</div>';
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderDetail(data.order, data.items || []);
    } catch {
      detailEl.innerHTML = '<div class="state state-error">Could not load order.</div>';
    }
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

    detailEl.innerHTML = `
      <div class="detail-head">
        <div>
          <span class="muted">Order</span>
          <h2></h2>
          <span class="muted detail-time"></span>
        </div>
        ${statusPill(o.status)}
      </div>

      <div class="detail-grid">
        <div class="detail-block">
          <h3>Customer</h3>
          <p class="detail-customer"></p>
          <p class="muted detail-phone"></p>
        </div>
        <div class="detail-block">
          <h3>Delivery</h3>
          <p class="detail-address"></p>
        </div>
        <div class="detail-block">
          <h3>Payment</h3>
          <p>${PAYMENT_LABELS[o.payment_method] || o.payment_method}</p>
        </div>
        <div class="detail-block">
          <h3>ETA</h3>
          <p>${o.status === 'delivered' ? 'Delivered' : `${o.eta_min}–${o.eta_max} min`}</p>
        </div>
      </div>

      <div class="detail-items">
        <h3>Items</h3>
        <ul>${itemsHtml}</ul>
      </div>

      <div class="detail-total"><span>Total</span><strong>${fmtKRW(o.total)}</strong></div>

      <div class="detail-actions">
        ${next ? `<button class="btn btn-primary" data-next="${next.value}">${next.label}</button>` : ''}
        ${o.status !== 'delivered' && o.status !== 'new' ? `<button class="btn btn-ghost" data-next="new">Reset to new</button>` : ''}
        ${o.status === 'delivered' ? `<button class="btn btn-ghost" disabled>Order completed</button>` : ''}
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
        btn.disabled = true; btn.textContent = 'Updating…';
        try {
          const res = await fetch(`/api/admin/orders/${o.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          if (!res.ok) throw new Error();
          await loadOrders();
        } catch {
          btn.disabled = false; btn.textContent = 'Update failed — retry';
        }
      });
    });
  }

  // ---------- Init ----------
  loadOrders();
  // Light polling so the dashboard reflects new orders without a manual refresh
  setInterval(loadOrders, 30000);
})();
