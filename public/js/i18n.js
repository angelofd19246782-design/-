/* Tiny i18n engine. No dependencies.
 *
 * Markup pattern:
 *   <a data-i18n="nav.catalog">Catalog</a>
 *   <h1 data-i18n-html="hero.title">A taste of <em>home</em>...</h1>
 *   <input data-i18n-placeholder="catalog.searchPlaceholder" placeholder="Search…" />
 *   <button data-i18n-aria="aria.cartOpen" aria-label="Open cart">…</button>
 *
 * JS pattern:
 *   const { t } = window.RadugaI18n;
 *   document.addEventListener('i18n:changed', () => rerenderDynamic());
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'raduga.lang';
  const SUPPORTED = ['en', 'ru'];
  const DEFAULT_LANG = 'en';

  const dict = {
    en: {
      nav: { catalog: 'Catalog', track: 'Track order', staff: 'Staff' },
      brand: {
        sub: 'CIS food store · Korea',
        subStaff: 'Staff portal',
        subDashboard: 'Staff dashboard',
        subFooter: 'CIS food · Korea'
      },
      aria: {
        cartOpen: 'Open cart',
        cartClose: 'Close cart',
        checkoutClose: 'Close checkout',
        decrease: 'Decrease',
        increase: 'Increase',
        remove: 'Remove',
        language: 'Language'
      },
      hero: {
        eyebrow: 'Delivery across Korea',
        title: 'A taste of <em>home</em>,<br /><span class="accent">delivered fresh.</span>',
        description: 'Pelmeni, smetana, Borodinsky, kvass and everything else you miss — sourced for the CIS community in Korea and brought to your door in <strong>30–90 minutes</strong>.',
        ctaShop: 'Shop catalog',
        ctaTrack: 'Track my order'
      },
      trust: {
        timeTitle: '30–90 min', timeSub: 'Express delivery',
        koreaTitle: 'Korea-wide', koreaSub: 'Seoul · Busan · more',
        cisTitle: 'CIS authentic', cisSub: 'Sourced for you',
        freshTitle: 'Fresh daily', freshSub: 'Restocked every day'
      },
      pills: {
        live: 'Live now', liveSub: 'Avg. delivery 42 min',
        fresh: 'Fresh today', freshSub: '36 SKUs in stock'
      },
      catalog: {
        eyebrow: 'Catalog',
        title: 'Today\'s <em>fresh</em> picks',
        description: 'Hand-picked CIS classics — refreshed every morning across eight categories.',
        searchPlaceholder: 'Search for pelmeni, kvass, smetana…',
        loading: 'Loading products…',
        error: 'Could not load products. Please refresh the page.',
        empty: 'No products match your search.',
        add: 'Add',
        inCart: 'In cart · {n}'
      },
      categories: {
        all: 'All', drinks: 'Drinks', sweets: 'Sweets', dairy: 'Dairy',
        frozen: 'Frozen', bakery: 'Bakery', groceries: 'Groceries',
        meat: 'Meat & sausages', ready: 'Ready food'
      },
      cart: {
        title: 'Your cart',
        empty: 'Your cart is empty.',
        emptyHint: 'Add a few items from the catalog to get started.',
        total: 'Total',
        checkout: 'Proceed to checkout',
        continue: 'Continue shopping'
      },
      checkout: {
        title: 'Checkout',
        name: 'Full name', namePlaceholder: 'Anna Ivanova',
        phone: 'Phone number', phonePlaceholder: '010-1234-5678',
        address: 'Delivery address', addressPlaceholder: '서울시 강남구 ...',
        payment: 'Payment method',
        cash: 'Cash on delivery',
        transfer: 'Bank transfer',
        card: 'Card on delivery',
        place: 'Place order',
        placing: 'Placing…',
        errName: 'Please enter your name.',
        errPhone: 'Please enter a valid phone.',
        errAddress: 'Please enter a delivery address.',
        errGeneric: 'Could not place order.'
      },
      success: {
        title: 'Order placed!',
        subtitle: 'Thank you. We have received your order and will get in touch shortly.',
        orderNumber: 'Order number',
        status: 'Status',
        eta: 'ETA',
        total: 'Total',
        track: 'Track this order',
        continue: 'Continue shopping'
      },
      track: {
        pageTitle: 'Track your order',
        hint: 'Enter the order number from the confirmation screen and the phone number you used at checkout.',
        orderNumber: 'Order number', orderPlaceholder: 'R250427-1234',
        phone: 'Phone number', phonePlaceholder: '010-1234-5678',
        find: 'Find my order',
        lookup: 'Looking up…',
        eta: 'ETA',
        delivered: 'Delivered',
        orderHeader: 'Order',
        delivery: 'Delivery',
        items: 'Items',
        total: 'Total',
        missingFields: 'Please enter both order number and phone.',
        notFound: 'Could not find this order.'
      },
      status: {
        new: 'New order',
        newShort: 'New',
        collecting: 'Collecting',
        on_the_way: 'On the way',
        delivered: 'Delivered'
      },
      statusFilter: {
        all: 'All', new: 'New', collecting: 'Collecting',
        on_the_way: 'On the way', delivered: 'Delivered'
      },
      time: {
        justNow: 'just now',
        minAgo: '{n} min ago',
        hAgo: '{n} h ago',
        dAgo: '{n} d ago'
      },
      why: {
        eyebrow: 'Why Raduga',
        title: 'Built for our <em>community</em>.',
        description: 'Not a logistics app pretending to be a grocery store. A real CIS deli that delivers — fast, careful and human.',
        card1Title: 'Express in 30–90 min',
        card1Body: 'Live route planning across Seoul and major Korean cities — most orders arrive in under an hour.',
        card2Title: 'Fresh every morning',
        card2Body: 'Dairy, frozen and bakery restocked daily. We never ship anything we wouldn\'t put on our own table.',
        card3Title: 'Authentic CIS sourcing',
        card3Body: 'Direct relationships with importers and producers. Real Borodinsky, real Borjomi, real prices.',
        card4Title: 'Human support',
        card4Body: 'A real person picks up. Wrong item, missed time, special request — we make it right, no chatbots.'
      },
      footer: {
        tagline: 'A taste of home, delivered fresh across Korea — for the community, by the community.',
        shop: 'Shop',
        shopCatalog: 'Catalog',
        shopTrack: 'Track order',
        shopCategories: 'Categories',
        delivery: 'Delivery',
        delivery1: '30–90 min express',
        delivery2: 'Seoul · Busan · Daegu',
        delivery3: 'Cash, transfer, card',
        help: 'Help',
        help1: 'Order issue? We make it right.',
        help2: 'Daily 9:00 – 22:00 KST',
        help3Pre: 'Staff portal:',
        help3Link: 'login',
        bottomCopy: 'Made with care for the CIS community in Korea.'
      },
      admin: {
        signIn: 'Sign in',
        signInDesc: 'Enter your staff credentials to manage incoming orders.',
        signingIn: 'Signing in…',
        username: 'Username',
        password: 'Password',
        backToStore: '← Back to store',
        whoami: 'Hi, {name}',
        refresh: 'Refresh',
        signOut: 'Sign out',
        orders: 'Orders',
        ordersLoading: 'Loading…',
        ordersError: 'Could not load orders.',
        ordersEmpty: 'No orders to show.',
        placeholder: 'Select an order to see details and update its status.',
        statNew: 'New orders',
        statCollecting: 'Collecting',
        statOnTheWay: 'On the way',
        statDelivered: 'Delivered today',
        detailOrder: 'Order',
        detailCustomer: 'Customer',
        detailDelivery: 'Delivery',
        detailPayment: 'Payment',
        detailEta: 'ETA',
        detailItems: 'Items',
        detailTotal: 'Total',
        loadingOrder: 'Loading order…',
        loadFailed: 'Could not load order.',
        startCollecting: 'Start collecting',
        markOnTheWay: 'Mark as on the way',
        markDelivered: 'Mark as delivered',
        resetNew: 'Reset to new',
        completed: 'Order completed',
        updating: 'Updating…',
        retry: 'Update failed — retry',
        loginEmpty: 'Please enter username and password.',
        loginInvalid: 'Could not sign in.'
      },
      misc: {
        and: 'and'
      },
      common: {
        etaRange: '{min}–{max} min',
        delivered: 'Delivered'
      }
    },
    ru: {
      nav: { catalog: 'Каталог', track: 'Отследить заказ', staff: 'Сотрудникам' },
      brand: {
        sub: 'Магазин СНГ · Корея',
        subStaff: 'Портал сотрудников',
        subDashboard: 'Панель сотрудника',
        subFooter: 'СНГ · Корея'
      },
      aria: {
        cartOpen: 'Открыть корзину',
        cartClose: 'Закрыть корзину',
        checkoutClose: 'Закрыть оформление',
        decrease: 'Уменьшить',
        increase: 'Увеличить',
        remove: 'Удалить',
        language: 'Язык'
      },
      hero: {
        eyebrow: 'Доставка по Корее',
        title: 'Вкус <em>дома</em>,<br /><span class="accent">с доставкой.</span>',
        description: 'Пельмени, сметана, Бородинский, квас и всё, чего так не хватает — собираем для русскоязычной общины Кореи и привозим за <strong>30–90 минут</strong>.',
        ctaShop: 'Открыть каталог',
        ctaTrack: 'Отследить заказ'
      },
      trust: {
        timeTitle: '30–90 мин', timeSub: 'Экспресс-доставка',
        koreaTitle: 'Вся Корея', koreaSub: 'Сеул · Пусан · и дальше',
        cisTitle: 'Настоящие СНГ', cisSub: 'Привозим под заказ',
        freshTitle: 'Свежее каждый день', freshSub: 'Завоз каждое утро'
      },
      pills: {
        live: 'В работе', liveSub: 'В среднем 42 мин',
        fresh: 'Сегодня свежее', freshSub: '36 позиций в наличии'
      },
      catalog: {
        eyebrow: 'Каталог',
        title: 'Свежие <em>позиции</em> сегодня',
        description: 'Подобранная классика СНГ — обновляем каждое утро в восьми категориях.',
        searchPlaceholder: 'Поиск: пельмени, квас, сметана…',
        loading: 'Загружаем товары…',
        error: 'Не удалось загрузить товары. Обновите страницу.',
        empty: 'Ничего не найдено.',
        add: 'В корзину',
        inCart: 'В корзине · {n}'
      },
      categories: {
        all: 'Все', drinks: 'Напитки', sweets: 'Сладкое', dairy: 'Молочное',
        frozen: 'Замороженное', bakery: 'Хлеб', groceries: 'Бакалея',
        meat: 'Мясо и колбасы', ready: 'Готовая еда'
      },
      cart: {
        title: 'Корзина',
        empty: 'Корзина пуста.',
        emptyHint: 'Добавьте несколько товаров из каталога — это займёт минуту.',
        total: 'Итого',
        checkout: 'Перейти к оформлению',
        continue: 'Продолжить покупки'
      },
      checkout: {
        title: 'Оформление',
        name: 'Имя и фамилия', namePlaceholder: 'Анна Иванова',
        phone: 'Телефон', phonePlaceholder: '010-1234-5678',
        address: 'Адрес доставки', addressPlaceholder: 'Сеул, Каннам-гу ...',
        payment: 'Способ оплаты',
        cash: 'Наличные курьеру',
        transfer: 'Банковский перевод',
        card: 'Картой при получении',
        place: 'Оформить заказ',
        placing: 'Оформляем…',
        errName: 'Введите ваше имя.',
        errPhone: 'Введите корректный телефон.',
        errAddress: 'Укажите адрес доставки.',
        errGeneric: 'Не удалось оформить заказ.'
      },
      success: {
        title: 'Заказ оформлен!',
        subtitle: 'Спасибо! Мы получили ваш заказ и скоро свяжемся.',
        orderNumber: 'Номер заказа',
        status: 'Статус',
        eta: 'Время доставки',
        total: 'Сумма',
        track: 'Отследить заказ',
        continue: 'Продолжить покупки'
      },
      track: {
        pageTitle: 'Отследить заказ',
        hint: 'Введите номер заказа с экрана подтверждения и телефон, указанный при оформлении.',
        orderNumber: 'Номер заказа', orderPlaceholder: 'R250427-1234',
        phone: 'Телефон', phonePlaceholder: '010-1234-5678',
        find: 'Найти заказ',
        lookup: 'Ищем…',
        eta: 'Время доставки',
        delivered: 'Доставлен',
        orderHeader: 'Заказ',
        delivery: 'Доставка',
        items: 'Состав',
        total: 'Итого',
        missingFields: 'Введите номер заказа и телефон.',
        notFound: 'Заказ не найден.'
      },
      status: {
        new: 'Новый заказ',
        newShort: 'Новый',
        collecting: 'Сборка',
        on_the_way: 'В пути',
        delivered: 'Доставлен'
      },
      statusFilter: {
        all: 'Все', new: 'Новые', collecting: 'Сборка',
        on_the_way: 'В пути', delivered: 'Доставлены'
      },
      time: {
        justNow: 'только что',
        minAgo: '{n} мин назад',
        hAgo: '{n} ч назад',
        dAgo: '{n} дн назад'
      },
      why: {
        eyebrow: 'Почему Радуга',
        title: 'Сделано для <em>своих</em>.',
        description: 'Не логистическое приложение, играющее в магазин. Настоящий магазин СНГ с доставкой — быстро, аккуратно, по-человечески.',
        card1Title: 'Экспресс за 30–90 мин',
        card1Body: 'Маршруты по Сеулу и крупным городам Кореи — большинство заказов доезжает быстрее часа.',
        card2Title: 'Свежее каждое утро',
        card2Body: 'Молочка, замороженное и хлеб — поставка ежедневно. Не отправим ничего, что не положили бы на свой стол.',
        card3Title: 'Настоящий СНГ',
        card3Body: 'Прямые связи с поставщиками. Бородинский — настоящий, Боржоми — настоящий, цены — честные.',
        card4Title: 'Человеческая поддержка',
        card4Body: 'Отвечает живой человек. Перепутали, опоздали, особый запрос — решим, без чат-ботов.'
      },
      footer: {
        tagline: 'Вкус дома с доставкой по Корее — для своих, своими.',
        shop: 'Магазин',
        shopCatalog: 'Каталог',
        shopTrack: 'Отследить заказ',
        shopCategories: 'Категории',
        delivery: 'Доставка',
        delivery1: 'Экспресс 30–90 мин',
        delivery2: 'Сеул · Пусан · Тэгу',
        delivery3: 'Наличные, перевод, карта',
        help: 'Помощь',
        help1: 'Что-то не так? Решим.',
        help2: 'Ежедневно 9:00 – 22:00 KST',
        help3Pre: 'Портал сотрудников:',
        help3Link: 'войти',
        bottomCopy: 'С заботой о русскоязычной общине Кореи.'
      },
      admin: {
        signIn: 'Войти',
        signInDesc: 'Введите учётные данные, чтобы управлять заказами.',
        signingIn: 'Входим…',
        username: 'Логин',
        password: 'Пароль',
        backToStore: '← В магазин',
        whoami: 'Привет, {name}',
        refresh: 'Обновить',
        signOut: 'Выйти',
        orders: 'Заказы',
        ordersLoading: 'Загрузка…',
        ordersError: 'Не удалось загрузить заказы.',
        ordersEmpty: 'Нет заказов.',
        placeholder: 'Выберите заказ, чтобы увидеть детали и обновить статус.',
        statNew: 'Новых заказов',
        statCollecting: 'В сборке',
        statOnTheWay: 'В пути',
        statDelivered: 'Доставлено сегодня',
        detailOrder: 'Заказ',
        detailCustomer: 'Клиент',
        detailDelivery: 'Доставка',
        detailPayment: 'Оплата',
        detailEta: 'Время',
        detailItems: 'Состав',
        detailTotal: 'Итого',
        loadingOrder: 'Загружаем заказ…',
        loadFailed: 'Не удалось загрузить заказ.',
        startCollecting: 'Начать сборку',
        markOnTheWay: 'Отметить в пути',
        markDelivered: 'Отметить как доставлен',
        resetNew: 'Вернуть в новые',
        completed: 'Заказ завершён',
        updating: 'Обновляем…',
        retry: 'Ошибка — повторить',
        loginEmpty: 'Введите логин и пароль.',
        loginInvalid: 'Не удалось войти.'
      },
      misc: { and: 'и' },
      common: {
        etaRange: '{min}–{max} мин',
        delivered: 'Доставлен'
      }
    }
  };

  // ---- core ----
  let current = (function () {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(stored)) return stored;
    } catch (_) {}
    // Default: English. (Could auto-detect via navigator.language but spec says EN default.)
    return DEFAULT_LANG;
  })();

  // Set <html lang> as early as possible to reduce FOUC
  document.documentElement.lang = current;

  function resolve(key, lang) {
    const path = String(key).split('.');
    let v = dict[lang];
    for (const p of path) {
      if (v && typeof v === 'object' && p in v) v = v[p];
      else return null;
    }
    return typeof v === 'string' ? v : null;
  }

  function format(str, params) {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : '{' + k + '}'));
  }

  function t(key, params, fallback) {
    const v = resolve(key, current) || resolve(key, DEFAULT_LANG);
    if (v == null) return fallback != null ? fallback : key;
    return format(v, params);
  }

  function applyTo(rootEl) {
    const scope = rootEl || document;

    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const v = resolve(key, current);
      if (v != null) el.textContent = v;
    });

    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const v = resolve(key, current);
      if (v != null) el.innerHTML = v;
    });

    const attrMap = [
      ['data-i18n-placeholder', 'placeholder'],
      ['data-i18n-aria',        'aria-label'],
      ['data-i18n-title',       'title'],
      ['data-i18n-value',       'value']
    ];
    attrMap.forEach(([dataAttr, htmlAttr]) => {
      scope.querySelectorAll(`[${dataAttr}]`).forEach((el) => {
        const key = el.getAttribute(dataAttr);
        const v = resolve(key, current);
        if (v != null) el.setAttribute(htmlAttr, v);
      });
    });

    // Update active state on switchers
    document.querySelectorAll('.lang-switch [data-lang]').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === current);
      b.setAttribute('aria-pressed', String(b.dataset.lang === current));
    });

    document.documentElement.lang = current;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    if (lang === current) return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    applyTo();
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
  }

  function getLang() { return current; }

  // Wire up clicks on any .lang-switch buttons (works even if rendered later)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.lang-switch [data-lang]');
    if (!btn) return;
    e.preventDefault();
    setLang(btn.dataset.lang);
  });

  // Initial application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyTo());
  } else {
    applyTo();
  }

  window.RadugaI18n = { t, setLang, getLang, applyTo, supported: SUPPORTED.slice() };
})();
