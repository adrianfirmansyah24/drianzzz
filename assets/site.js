(() => {
  const root = document.documentElement;
  const storageKey = 'adrian-theme';
  const toggle = document.querySelector('[data-theme-toggle]');
  const menu = document.querySelector('.nav-menu');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const render = () => {
    const dark = root.dataset.theme === 'dark';
    toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    toggle.querySelector('[data-theme-label]').textContent = `Pull for ${dark ? 'light' : 'dark'} mode`;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#202725' : '#f5f2e9';
  };
  const changeTheme = () => {
    const dark = root.dataset.theme !== 'dark';
    if (dark) root.dataset.theme = 'dark'; else delete root.dataset.theme;
    try { localStorage.setItem(storageKey, dark ? 'dark' : 'light'); } catch {}
    render();
  };
  let startY = null;
  let distance = 0;
  let dragged = false;
  toggle.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    startY = event.clientY;
    distance = 0;
    dragged = false;
    toggle.setPointerCapture(event.pointerId);
    toggle.classList.add('is-dragging');
  });
  toggle.addEventListener('pointermove', event => {
    if (startY === null) return;
    distance = Math.max(0, Math.min(65, event.clientY - startY));
    if (distance > 8) dragged = true;
    toggle.style.setProperty('--pull', `${distance}px`);
  });
  const release = cancelled => {
    if (startY === null) return;
    if (!cancelled && distance >= 28) changeTheme();
    startY = null;
    toggle.classList.remove('is-dragging');
    toggle.style.setProperty('--pull', '0px');
  };
  toggle.addEventListener('pointerup', () => release(false));
  toggle.addEventListener('pointercancel', () => release(true));
  toggle.addEventListener('lostpointercapture', () => release(true));
  toggle.addEventListener('click', event => {
    if (dragged && event.detail !== 0) { dragged = false; return; }
    changeTheme();
    if (!motion.matches) {
      toggle.querySelector('.cord').animate([
        { transform: 'translateY(0)' }, { transform: 'translateY(12px)' },
        { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }
      ], { duration: 450, easing: 'ease-out' });
    }
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    try { if (localStorage.getItem(storageKey)) return; } catch {}
    if (event.matches) root.dataset.theme = 'dark'; else delete root.dataset.theme;
    render();
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
  matchMedia('(max-width: 800px)').addEventListener('change', () => { menu.open = false; });
  const roles = ['Useful websites.', 'Connected systems.', 'Community products.', 'Playful experiences.'];
  let currentRole = 0;
  const sheet = document.querySelector('[data-role-sheet]');
  document.querySelector('[data-role-next]').addEventListener('click', () => {
    currentRole = (currentRole + 1) % roles.length;
    sheet.textContent = roles[currentRole];
    sheet.classList.remove('is-flipping');
    void sheet.offsetWidth;
    sheet.classList.add('is-flipping');
  });
  document.querySelectorAll('.door').forEach(door => {
    door.addEventListener('click', () => {
      door.classList.add('is-opening');
      setTimeout(() => door.classList.remove('is-opening'), 900);
    });
  });
  render();
})();
