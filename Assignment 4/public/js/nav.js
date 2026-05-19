(function () {
  'use strict';

  var toggle = document.getElementById('nav-toggle');
  var drawer = document.getElementById('nav-mobile');

  if (!toggle || !drawer) return;

  /* ── helpers ── */
  function openMenu() {
    drawer.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    drawer.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function isOpen() {
    return drawer.classList.contains('open');
  }

  /* ── hamburger click: classList.toggle via helpers ── */
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  /* ── close when any mobile nav link is clicked ── */
  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      /* small delay so the page can start scrolling before the drawer closes */
      setTimeout(closeMenu, 120);
    });
  });

  /* ── close on outside click ── */
  document.addEventListener('click', function (e) {
    if (isOpen() && !toggle.contains(e.target) && !drawer.contains(e.target)) {
      closeMenu();
    }
  });

  /* ── close on Escape key ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });

  /* ── close when viewport grows past the mobile breakpoint ── */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && isOpen()) closeMenu();
  });
})();
