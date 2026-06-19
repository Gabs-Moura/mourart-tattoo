/* =========================================================
   MOURART TATTOO — interactions
   Matrix rain (hero bg), scroll reveal, nav, custom cursor.
========================================================= */

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Matrix rain (hero background) ---------- */
  const initMatrixRain = () => {
    const canvas = document.getElementById('matrixRain');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789:・"=*+-<>'.split('');
    const fontSize = 16;
    let columns = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lastFrame = 0;
    const frameInterval = 1000 / 24; // throttle to ~24fps, plenty for this effect

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columnCount = Math.floor(canvas.offsetWidth / fontSize);
      columns = Array.from({ length: columnCount }, () => Math.random() * -100);
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.fillStyle = 'rgba(10, 10, 10, 0.14)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px monospace`;

      columns.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const isHead = Math.random() > 0.96;

        ctx.fillStyle = isHead ? 'rgba(255, 60, 80, 0.85)' : 'rgba(255, 39, 65, 0.16)';
        ctx.fillText(char, x, y * fontSize);

        if (y * fontSize > h && Math.random() > 0.975) {
          columns[i] = 0;
        } else {
          columns[i] = y + 1;
        }
      });
    };

    const loop = (timestamp) => {
      if (timestamp - lastFrame >= frameInterval) {
        draw();
        lastFrame = timestamp;
      }
      if (!document.hidden) requestAnimationFrame(loop);
    };

    setup();
    requestAnimationFrame(loop);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 200);
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) requestAnimationFrame(loop);
    });
  };

  /* ---------- Scroll reveal ---------- */
  const initScrollReveal = () => {
    const targets = document.querySelectorAll('[data-reveal]');

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
      observer.observe(el);
    });
  };

  /* ---------- Nav: scroll state + mobile menu ---------- */
  const initNav = () => {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!nav || !toggle || !menu) return;

    const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  };

  /* ---------- Custom cursor (fine pointer only) ---------- */
  const initCustomCursor = () => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer || prefersReducedMotion) return;

    document.documentElement.classList.add('custom-cursor');

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    });

    const animateRing = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
  };

  /* ---------- Footer year ---------- */
  const setFooterYear = () => {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    initScrollReveal();
    initNav();
    initCustomCursor();
    setFooterYear();
  });
})();
