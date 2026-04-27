(function () {
  'use strict';

  // Category keys only — labels come from the i18n dict (categories.<key>)
  const CATEGORY_KEYS = ['all', 'drinks', 'sweets', 'dairy', 'frozen', 'bakery', 'groceries', 'meat', 'ready'];

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
  const t = (k, p, f) => (window.RadugaI18n ? window.RadugaI18n.t(k, p, f) : (f || k));

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
  function renderCategories() {
    categoriesEl.innerHTML = '';
    CATEGORY_KEYS.forEach((key) => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (state.filter === key ? ' active' : '');
      btn.textContent = t('categories.' + key, null, key);
      btn.dataset.cat = key;
      btn.addEventListener('click', () => {
        state.filter = key;
        $$('.categories .chip').forEach((x) => x.classList.toggle('active', x.dataset.cat === key));
        renderProducts();
      });
      categoriesEl.appendChild(btn);
    });
  }
  renderCategories();

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
    return t('categories.' + key, null, key);
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

  function isPlaceholder(url) {
    return !url || url === 'placeholder';
  }

  // Build a clean white-bg placeholder SVG with the product name and a
  // DEMO IMAGE watermark. Used when no licensed brand photo is available.
  // The data: URL is fully self-contained — no file lookup, no network.
  function placeholderSVG(name, accent) {
    const a = (accent || '#71717a').slice(0, 7);
    const txt = String(name || '').replace(/[<>&"']/g, '');
    // Split into max 2 lines, balanced near 18 chars
    const words = txt.split(/\s+/).filter(Boolean);
    let l1 = words[0] || '', l2 = '', i = 1;
    while (i < words.length && (l1 + ' ' + words[i]).length <= 18) {
      l1 += ' ' + words[i++];
    }
    l2 = words.slice(i).join(' ');
    if (l1.length > 22) l1 = l1.slice(0, 21) + '…';
    if (l2.length > 24) l2 = l2.slice(0, 23) + '…';
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
        '<rect width="400" height="400" fill="#fafafa"/>' +
        '<circle cx="200" cy="200" r="160" fill="' + a + '" fill-opacity="0.10"/>' +
        '<rect x="92" y="118" width="216" height="164" rx="14" fill="#ffffff" stroke="' + a + '" stroke-width="2"/>' +
        '<rect x="94" y="120" width="212" height="22" rx="12" fill="' + a + '" fill-opacity="0.55"/>' +
        '<text x="200" y="' + (l2 ? 195 : 208) + '" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="16" font-weight="700" fill="#1a1a1f">' + l1 + '</text>' +
        (l2 ? '<text x="200" y="220" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="500" fill="#52525b">' + l2 + '</text>' : '') +
        '<text x="200" y="345" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="9" font-weight="700" letter-spacing="3" fill="#9ca3af">DEMO IMAGE</text>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function productCard(p) {
    const card = document.createElement('article');
    card.className = 'card';

    const art = document.createElement('div');
    art.className = 'card-art';
    art.style.setProperty('--accent-color', p.accent || 'var(--accent)');

    const img = document.createElement('img');
    if (isPlaceholder(p.image_url)) {
      img.src = placeholderSVG(p.name, p.accent);
      img.classList.add('is-placeholder');
    } else {
      img.src = p.image_url;
      if (isPhoto(p.image_url)) img.classList.add('is-photo');
    }
    img.alt = p.name;
    img.loading = 'lazy';
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

    // Product name and description come from the DB and stay in the
    // original language — only UI chrome is translated.
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
    function setAddLabel() {
      const q = state.cart[p.id] || 0;
      btn.textContent = q > 0 ? t('catalog.inCart', { n: q }) : t('catalog.add');
      btn.classList.toggle('added', q > 0);
    }
    setAddLabel();
    btn.addEventListener('click', () => {
      addToCart(p.id);
      setAddLabel();
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

      let thumbSrc, thumbClass;
      if (isPlaceholder(product.image_url)) {
        thumbSrc = placeholderSVG(product.name, product.accent);
        thumbClass = 'is-placeholder';
      } else {
        thumbSrc = product.image_url;
        thumbClass = isPhoto(product.image_url) ? 'is-photo' : '';
      }

      li.innerHTML = `
        <div class="cart-thumb"><img src="${thumbSrc}" alt="" class="${thumbClass}" /></div>
        <div class="cart-info">
          <div class="cart-info-name"></div>
          <div class="cart-info-price">${fmtKRW(product.price)} × ${quantity} = ${fmtKRW(product.price * quantity)}</div>
        </div>
        <div class="cart-controls" style="display:flex;align-items:center;gap:6px;">
          <div class="qty">
            <button type="button" data-action="dec" aria-label="${t('aria.decrease')}">${I.get('minus')}</button>
            <span>${quantity}</span>
            <button type="button" data-action="inc" aria-label="${t('aria.increase')}">${I.get('plus')}</button>
          </div>
          <button type="button" class="remove-btn" data-action="rm" aria-label="${t('aria.remove')}">${I.get('trash')}</button>
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
    rows.push(`<div class="checkout-summary-row total"><span>${escapeHtml(t('cart.total'))}</span><span>${fmtKRW(cartTotal())}</span></div>`);
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

    if (!payload.customer.name || payload.customer.name.length < 2) return showCheckoutError(t('checkout.errName'));
    if (!payload.customer.phone || payload.customer.phone.replace(/\D/g, '').length < 7) return showCheckoutError(t('checkout.errPhone'));
    if (!payload.customer.address || payload.customer.address.length < 5) return showCheckoutError(t('checkout.errAddress'));

    const btn = $('#placeOrderBtn');
    btn.disabled = true; btn.textContent = t('checkout.placing');
    checkoutError.hidden = true;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || t('checkout.errGeneric'));

      // Success
      state.cart = {};
      saveCart();
      renderCart();
      renderProducts();
      closeCheckout();
      showSuccess(json, payload.customer.phone);
    } catch (err) {
      showCheckoutError(err.message || t('checkout.errGeneric'));
    } finally {
      btn.disabled = false; btn.textContent = t('checkout.place');
    }
  });

  function showCheckoutError(msg) {
    checkoutError.textContent = msg;
    checkoutError.hidden = false;
  }

  // ---------- Success modal ----------
  const successModal = $('#successModal');
  let lastSuccess = null;
  function showSuccess(order, phone) {
    lastSuccess = { order, phone };
    $('#successNumber').textContent = order.orderNumber;
    $('#successStatus').textContent = t('status.newShort');
    $('#successEta').textContent = t('common.etaRange', { min: order.eta.min, max: order.eta.max });
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

  // ---------- React to language switching ----------
  document.addEventListener('i18n:changed', () => {
    renderCategories();
    renderProducts();
    renderCart();
    if (!checkoutModal.hidden) renderCheckoutSummary();
    if (!successModal.hidden && lastSuccess) showSuccess(lastSuccess.order, lastSuccess.phone);
  });

  // ---------- Init ----------
  fetchProducts();
  renderCart();
})();
