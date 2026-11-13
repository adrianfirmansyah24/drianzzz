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
  const scenes = [...document.querySelectorAll('.door-scene')];
  const closeTimers = new Map();
  let pointerType = 'mouse';
  const closeScene = scene => {
    clearTimeout(closeTimers.get(scene));
    closeTimers.delete(scene);
    scene.classList.remove('is-open');
    scene.querySelector('.door').setAttribute('aria-expanded', 'false');
    const preview = scene.querySelector('.door-preview');
    preview.inert = true;
    preview.setAttribute('aria-hidden', 'true');
  };
  const positionPreview = scene => {
    const preview = scene.querySelector('.door-preview');
    const rect = scene.getBoundingClientRect();
    const headerBottom = Math.max(
      document.querySelector('.site-header').getBoundingClientRect().bottom,
      toggle.getBoundingClientRect().bottom
    );
    preview.style.maxHeight = `${Math.max(150, innerHeight - headerBottom - 32)}px`;
    // Account for the slight tilt, so edge doors stay inside the viewport.
    const halfWidth = preview.offsetWidth / 2 + 9;
    const centerX = rect.left + rect.width / 2;
    const safeX = Math.max(halfWidth + 10, Math.min(innerWidth - halfWidth - 10, centerX));
    const halfHeight = preview.offsetHeight / 2 + 7;
    const centerY = rect.top + rect.height / 2;
    const safeY = Math.max(headerBottom + halfHeight + 12, Math.min(innerHeight - halfHeight - 12, centerY));
    scene.style.setProperty('--preview-shift', `${safeX - centerX}px`);
    scene.style.setProperty('--preview-top', `${safeY - rect.top}px`);
    scene.style.setProperty('--preview-return-y', `${centerY - safeY + 45}px`);
  };
  const openScene = scene => {
    clearTimeout(closeTimers.get(scene));
    closeTimers.delete(scene);
    scenes.forEach(other => { if (other !== scene) closeScene(other); });
    positionPreview(scene);
    scene.classList.add('is-open');
    scene.querySelector('.door').setAttribute('aria-expanded', 'true');
    const preview = scene.querySelector('.door-preview');
    preview.inert = false;
    preview.setAttribute('aria-hidden', 'false');
  };
  const scheduleClose = scene => {
    clearTimeout(closeTimers.get(scene));
    closeTimers.set(scene, setTimeout(() => {
      const focused = document.activeElement;
      if (scene.contains(focused) && focused.matches(':focus-visible')) return;
      closeScene(scene);
    }, 180));
  };
  document.addEventListener('pointerdown', event => {
    pointerType = event.pointerType;
    scenes.forEach(scene => { if (!scene.contains(event.target)) closeScene(scene); });
  });
  scenes.forEach(scene => {
    const door = scene.querySelector('.door');
    scene.querySelector('.preview-dismiss').addEventListener('click', () => {
      door.focus({ preventScroll: true });
      closeScene(scene);
    });
    const image = scene.querySelector('.preview-visual img');
    const fallback = document.createElement('span');
    fallback.className = 'preview-image-fallback';
    fallback.textContent = 'Image preview unavailable. You can still open the project.';
    fallback.hidden = true;
    image.after(fallback);
    const imageFailed = () => {
      image.style.visibility = 'hidden';
      fallback.hidden = false;
    };
    image.addEventListener('error', imageFailed);
    if (image.complete && image.naturalWidth === 0) imageFailed();
    scene.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') openScene(scene);
    });
    scene.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch') scheduleClose(scene);
    });
    scene.addEventListener('focusin', event => {
      if (event.target.matches(':focus-visible') && pointerType !== 'touch') openScene(scene);
    });
    scene.addEventListener('focusout', event => {
      if (!scene.contains(event.relatedTarget)) scheduleClose(scene);
    });
    door.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (pointerType === 'touch' && event.detail !== 0 && !scene.classList.contains('is-open')) {
        event.preventDefault();
        openScene(scene);
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') pointerType = 'keyboard';
    if (event.key !== 'Escape') return;
    scenes.forEach(scene => {
      if (scene.contains(document.activeElement) && document.activeElement !== scene.querySelector('.door')) {
        scene.querySelector('.door').focus({ preventScroll: true });
      }
      closeScene(scene);
    });
  });
  const resetScenes = () => scenes.forEach(closeScene);
  window.addEventListener('resize', resetScenes);
  window.addEventListener('scroll', resetScenes, { passive: true });
  window.addEventListener('pageshow', resetScenes);
  render();
})();
