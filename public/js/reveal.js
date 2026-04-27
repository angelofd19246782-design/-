/* Tiny scroll-triggered fade-up. Adds .is-visible to any [.reveal] element
   the first time it enters the viewport. Pure progressive enhancement —
   if JS or IntersectionObserver are unavailable, elements are visible by
   default via the .no-js fallback in CSS. */
(function () {
  'use strict';
  document.documentElement.classList.add('has-reveal');

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  const mount = (root) => {
    (root || document).querySelectorAll('.reveal:not(.is-visible)').forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mount());
  } else {
    mount();
  }

  window.RadugaReveal = { mount };
})();
