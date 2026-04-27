(function () {
  'use strict';

  const CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'drinks', label: 'Drinks' },
    { key: 'sweets', label: 'Sweets' },
    { key: 'dairy', label: 'Dairy' },
    { key: 'frozen', label: 'Frozen' },
    { key: 'bakery', label: 'Bakery' },
    { key: 'groceries', label: 'Groceries' },
    { key: 'meat', label: 'Meat & sausages' },
    { key: 'ready', label: 'Ready food' }
  ];

  const STORAGE_KEY = 'raduga.cart';

  const state = {
    products: [],
    filter: 'all',
    search: '',
    cart: loadCart() // { [productId]: quantity }
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const fmtKRW = (n) => '₩ ' + Number(n).toLocaleString('ko-KR');

  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Cart persistence ----------
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  }
  function saveCart() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart)); }

  // ---------- Render: categories ----------
  const categoriesEl = $('#categories');
  CATEGORIES.forEach((c) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (c.key === 'all' ? ' active' : '');
    btn.textContent = c.label;
    btn.dataset.cat = c.key;
    btn.addEventListener('click', () => {
      state.filter = c.key;
      $$('.categories .chip').forEach((x) => x.classList.toggle('active', x.dataset.cat === c.key));
      renderProducts();
    });
    categoriesEl.appendChild(btn);
  });

  // ---------- Load products ----------
  const loadingEl = $('#loadingState');
  const errorEl = $('#errorState');
  const emptyEl = $('#emptyState');
  const gridEl = $('#productGrid');

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      state.products = data.products || [];
      loadingEl.hidden = true;
      renderProducts();
    } catch {
      loadingEl.hidden = true;
      errorEl.hidden = false;
    }
  }

  function categoryLabel(key) {
    const c = CATEGORIES.find((x) => x.key === key);
    return c ? c.label : key;
  }

  function renderProducts() {
    const q = state.search.trim().toLowerCase();
    const filtered = state.products.filter((p) => {
      if (state.filter !== 'all' && p.category !== state.filter) return false;
      if (!q) return true;
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });

    emptyEl.hidden = filtered.length !== 0;
    gridEl.innerHTML = '';

    const frag = document.createDocumentFragment();
    for (const p of filtered) frag.appendChild(productCard(p));
    gridEl.appendChild(frag);
  }

  function isPhoto(url) {
    return /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(String(url || ''));
  }

  function productCard(p) {
    const card = document.createElement('article');
    card.className = 'card';

    const art = document.createElement('div');
    art.className = 'card-art';
    art.style.setProperty('--accent-color', p.accent || 'var(--accent)');

    const img = document.createElement('img');
    img.src = p.image_url || '/images/products/bag.svg';
    img.alt = p.name;
    img.loading = 'lazy';
    if (isPhoto(p.image_url)) img.classList.add('is-photo');
    art.appendChild(img);

    const cat = document.createElement('span');
    cat.className = 'card-cat';
    const catIconName = (window.RadugaIcons && window.RadugaIcons.categoryIcons[p.category]) || '';
    if (catIconName) {
      const catIcon = document.createElement('span');
      catIcon.className = 'card-cat-icon';
      catIcon.innerHTML = window.RadugaIcons.get(catIconName);
      cat.appendChild(catIcon);
    }
    cat.appendChild(document.createTextNode(categoryLabel(p.category)));
    art.appendChild(cat);

    const body = document.createElement('div');
    body.className = 'card-body';

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = p.name;

    const desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = p.description || '';

    const foot = document.createElement('div');
    foot.className = 'card-foot';

    const price = document.createElement('div');
    price.className = 'price';
    price.innerHTML = '<span class="price-cur">₩</span>' + Number(p.price).toLocaleString('ko-KR');

    const btn = document.createElement('button');
    btn.className = 'add-btn';
    const inCart = state.cart[p.id] || 0;
    btn.textContent = inCart > 0 ? `In cart · ${inCart}` : 'Add';
    if (inCart > 0) btn.classList.add('added');
    btn.addEventListener('click', () => {
      addToCart(p.id);
      const q = state.cart[p.id] || 0;
      btn.textContent = q > 0 ? `In cart · ${q}` : 'Add';
      btn.classList.toggle('added', q > 0);
    });

    foot.appendChild(price);
    foot.appendChild(btn);

    body.appendChild(name);
    body.appendChild(desc);
    body.appendChild(foot);

    card.appendChild(art);
    card.appendChild(body);
    return card;
  }

  // ---------- Search ----------
  $('#searchInput').addEventListener('input', (e) => {
    state.search = e.target.value || '';
    renderProducts();
  });

  // ---------- Cart ----------
  const cartEl = $('#cart');
  const scrimEl = $('#scrim');
  const cartListEl = $('#cartList');
  const cartEmptyEl = $('#cartEmpty');
  const cartTotalEl = $('#cartTotal');
  const cartCountEl = $('#cartCount');
  const checkoutBtn = $('#checkoutBtn');

  function openCart() {
    cartEl.classList.add('open');
    cartEl.setAttribute('aria-hidden', 'false');
    scrimEl.hidden = false;
  }
  function closeCart() {
    cartEl.classList.remove('open');
    cartEl.setAttribute('aria-hidden', 'true');
    scrimEl.hidden = true;
  }
  $('#cartButton').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#continueShoppingBtn').addEventListener('click', closeCart);
  scrimEl.addEventListener('click', closeCart);

  function addToCart(productId) {
    state.cart[productId] = (state.cart[productId] || 0) + 1;
    saveCart();
    renderCart();
  }
  function setQty(productId, qty) {
    if (qty <= 0) delete state.cart[productId];
    else state.cart[productId] = qty;
    saveCart();
    renderCart();
    renderProducts(); // sync "In cart · N"
  }

  function cartLines() {
    const lines = [];
    for (const id of Object.keys(state.cart)) {
      const product = state.products.find((p) => String(p.id) === String(id));
      if (!product) continue;
      lines.push({ product, quantity: state.cart[id] });
    }
    return lines;
  }
  function cartTotal() {
    return cartLines().reduce((s, l) => s + l.product.price * l.quantity, 0);
  }
  function cartCount() {
    return Object.values(state.cart).reduce((s, n) => s + n, 0);
  }

  function renderCart() {
    const lines = cartLines();
    cartCountEl.textContent = cartCount();
    cartTotalEl.textContent = fmtKRW(cartTotal());

    cartListEl.innerHTML = '';
    if (lines.length === 0) {
      cartEmptyEl.style.display = '';
      checkoutBtn.disabled = true;
      return;
    }
    cartEmptyEl.style.display = 'none';
    checkoutBtn.disabled = false;

    const I = window.RadugaIcons || { get: () => '' };
    for (const { product, quantity } of lines) {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.style.setProperty('--accent-color', product.accent || 'var(--accent)');

      const photoClass = isPhoto(product.image_url) ? ' is-photo' : '';
      const thumbSrc = product.image_url || '/images/products/bag.svg';

      li.innerHTML = `
        <div class="cart-thumb"><img src="${thumbSrc}" alt="" class="${photoClass.trim()}" /></div>
        <div class="cart-info">
          <div class="cart-info-name"></div>
          <div class="cart-info-price">${fmtKRW(product.price)} × ${quantity} = ${fmtKRW(product.price * quantity)}</div>
        </div>
        <div class="cart-controls" style="display:flex;align-items:center;gap:6px;">
          <div class="qty">
            <button type="button" data-action="dec" aria-label="Decrease">${I.get('minus')}</button>
            <span>${quantity}</span>
            <button type="button" data-action="inc" aria-label="Increase">${I.get('plus')}</button>
          </div>
          <button type="button" class="remove-btn" data-action="rm" aria-label="Remove">${I.get('trash')}</button>
        </div>
      `;
      li.querySelector('.cart-info-name').textContent = product.name;

      li.addEventListener('click', (e) => {
        const trigger = e.target && e.target.closest && e.target.closest('[data-action]');
        if (!trigger) return;
        const action = trigger.dataset.action;
        if (action === 'inc') setQty(product.id, quantity + 1);
        else if (action === 'dec') setQty(product.id, quantity - 1);
        else if (action === 'rm') setQty(product.id, 0);
      });

      cartListEl.appendChild(li);
    }
  }

  // ---------- Checkout ----------
  const checkoutModal = $('#checkoutModal');
  const checkoutForm = $('#checkoutForm');
  const checkoutSummary = $('#checkoutSummary');
  const checkoutError = $('#checkoutError');

  function openCheckout() {
    if (cartCount() === 0) return;
    renderCheckoutSummary();
    checkoutError.hidden = true;
    checkoutModal.hidden = false;
  }
  function closeCheckout() { checkoutModal.hidden = true; }
  checkoutBtn.addEventListener('click', openCheckout);
  $('#checkoutClose').addEventListener('click', closeCheckout);
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeCheckout();
  });

  function renderCheckoutSummary() {
    const lines = cartLines();
    const rows = lines.map((l) =>
      `<div class="checkout-summary-row"><span>${escapeHtml(l.product.name)} × ${l.quantity}</span><span>${fmtKRW(l.product.price * l.quantity)}</span></div>`
    );
    rows.push(`<div class="checkout-summary-row total"><span>Total</span><span>${fmtKRW(cartTotal())}</span></div>`);
    checkoutSummary.innerHTML = rows.join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(checkoutForm);
    const payload = {
      customer: {
        name: String(data.get('name') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        address: String(data.get('address') || '').trim()
      },
      payment: String(data.get('payment') || '').trim(),
      items: cartLines().map((l) => ({ productId: l.product.id, quantity: l.quantity }))
    };

    if (!payload.customer.name || payload.customer.name.length < 2) return showCheckoutError('Please enter your name.');
    if (!payload.customer.phone || payload.customer.phone.replace(/\D/g, '').length < 7) return showCheckoutError('Please enter a valid phone.');
    if (!payload.customer.address || payload.customer.address.length < 5) return showCheckoutError('Please enter a delivery address.');

    const btn = $('#placeOrderBtn');
    btn.disabled = true; btn.textContent = 'Placing…';
    checkoutError.hidden = true;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not place order.');

      // Success
      state.cart = {};
      saveCart();
      renderCart();
      renderProducts();
      closeCheckout();
      showSuccess(json, payload.customer.phone);
    } catch (err) {
      showCheckoutError(err.message || 'Could not place order.');
    } finally {
      btn.disabled = false; btn.textContent = 'Place order';
    }
  });

  function showCheckoutError(msg) {
    checkoutError.textContent = msg;
    checkoutError.hidden = false;
  }

  // ---------- Success modal ----------
  const successModal = $('#successModal');
  function showSuccess(order, phone) {
    $('#successNumber').textContent = order.orderNumber;
    $('#successStatus').textContent = 'New';
    $('#successEta').textContent = `${order.eta.min}–${order.eta.max} min`;
    $('#successTotal').textContent = fmtKRW(order.total);
    const trackUrl = `/track?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(phone)}`;
    $('#successTrack').setAttribute('href', trackUrl);
    successModal.hidden = false;
  }
  $('#successContinue').addEventListener('click', () => {
    successModal.hidden = true;
    closeCart();
  });
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) successModal.hidden = true;
  });

  // ---------- Init ----------
  fetchProducts();
  renderCart();
})();
