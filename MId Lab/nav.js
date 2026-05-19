(function () {
  'use strict';

  /* ══════════════════════════════════════════
     NAV DATA SOURCE
     Edit this array to add, remove, or rename
     nav items — all three navs update automatically.
  ══════════════════════════════════════════ */
  var NAV_LINKS = [
    { label: 'Home',    href: '#' },
    { label: 'Shop',    href: '#' },
    { label: 'Men',     href: '#' },
    { label: 'Women',   href: '#' },
    { label: 'Contact', href: '#' }
  ];

  /* ══════════════════════════════════════════
     DYNAMIC BINDING
     Builds all three nav lists from NAV_LINKS.
  ══════════════════════════════════════════ */
  function buildNavList(ulEl, role) {
    if (!ulEl) return;
    ulEl.innerHTML = '';
    NAV_LINKS.forEach(function (item) {
      var li = document.createElement('li');
      var a  = document.createElement('a');
      a.href        = item.href;
      a.textContent = item.label;
      if (role === 'menu') {
        li.setAttribute('role', 'none');
        a.setAttribute('role', 'menuitem');
      }
      li.appendChild(a);
      ulEl.appendChild(li);
    });
  }

  buildNavList(document.getElementById('nav-desktop-list'), null);
  buildNavList(document.getElementById('nav-zoom-dropdown'), 'menu');
  buildNavList(document.getElementById('nav-mobile-list'), null);

  /* ══════════════════════════════════════════
     MOBILE HAMBURGER
  ══════════════════════════════════════════ */
  var toggle = document.getElementById('nav-toggle');
  var drawer = document.getElementById('nav-mobile');

  if (toggle && drawer) {
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

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen() ? closeMenu() : openMenu();
    });

    // delegated — works even after dynamic rebuild
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setTimeout(closeMenu, 120);
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !toggle.contains(e.target) && !drawer.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && isOpen()) closeMenu();
    });
  }

  /* ══════════════════════════════════════════
     ZOOM-COLLAPSED "MENU" DROPDOWN
     Detects browser zoom >= 125% on desktop
     and swaps the full nav for a dropdown.
  ══════════════════════════════════════════ */
  var header       = document.querySelector('header');
  var zoomWrap     = document.getElementById('nav-zoom');
  var zoomTrigger  = document.getElementById('nav-zoom-trigger');
  var zoomDropdown = document.getElementById('nav-zoom-dropdown');

  if (!header || !zoomWrap || !zoomTrigger || !zoomDropdown) return;

  // Capture base pixel ratio at load (assumed 100% zoom)
  var baseRatio = window.devicePixelRatio || 1;

  function getZoomLevel() {
    return (window.devicePixelRatio || 1) / baseRatio;
  }

  function isZoomed() {
    if (window.innerWidth <= 1024) return false;
    return getZoomLevel() >= 1.24; // fires at ~125%
  }

  function applyZoomState() {
    if (isZoomed()) {
      header.classList.add('zoom-active');
      zoomWrap.setAttribute('aria-hidden', 'false');
    } else {
      header.classList.remove('zoom-active');
      zoomWrap.setAttribute('aria-hidden', 'true');
      closeZoomDropdown();
    }
  }

  function openZoomDropdown() {
    zoomDropdown.classList.add('open');
    zoomTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeZoomDropdown() {
    zoomDropdown.classList.remove('open');
    zoomTrigger.setAttribute('aria-expanded', 'false');
  }

  function isZoomDropdownOpen() {
    return zoomDropdown.classList.contains('open');
  }

  zoomTrigger.addEventListener('click', function (e) {
    e.stopPropagation();
    isZoomDropdownOpen() ? closeZoomDropdown() : openZoomDropdown();
  });

  zoomTrigger.addEventListener('mouseenter', openZoomDropdown);
  zoomWrap.addEventListener('mouseleave', closeZoomDropdown);

  document.addEventListener('click', function (e) {
    if (isZoomDropdownOpen() && !zoomWrap.contains(e.target)) {
      closeZoomDropdown();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isZoomDropdownOpen()) {
      closeZoomDropdown();
      zoomTrigger.focus();
    }
  });

  // delegated — works even after dynamic rebuild
  zoomDropdown.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setTimeout(closeZoomDropdown, 120);
  });

  applyZoomState();
  window.addEventListener('resize', applyZoomState);

})();
