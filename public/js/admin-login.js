(function () {
  'use strict';

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  const t = (k, p, f) => (window.RadugaI18n ? window.RadugaI18n.t(k, p, f) : (f || k));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const data = new FormData(form);
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');

    if (!username || !password) {
      return showError(t('admin.loginEmpty'));
    }

    btn.disabled = true;
    btn.textContent = t('admin.signingIn');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || t('admin.loginInvalid'));
      location.href = '/admin';
    } catch (err) {
      showError(err.message || t('admin.loginInvalid'));
      btn.disabled = false;
      btn.textContent = t('admin.signIn');
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
})();
