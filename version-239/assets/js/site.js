document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const opened = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;

    const show = function (next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-box]').forEach(function (box) {
    const scope = box.closest('section') || document;
    const input = box.querySelector('[data-search]');
    const chips = Array.from(box.querySelectorAll('[data-filter-type]'));
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const empty = scope.querySelector('[data-empty]');
    let activeType = 'all';

    const matchType = function (card) {
      const type = (card.dataset.type || '').toLowerCase();
      const genre = (card.dataset.genre || '').toLowerCase();
      if (activeType === 'all') return true;
      if (activeType === 'movie') return type.includes('电影');
      if (activeType === 'series') return type.includes('剧') || genre.includes('剧集');
      if (activeType === 'variety') return type.includes('综艺') || genre.includes('真人秀') || genre.includes('纪实');
      if (activeType === 'animation') return type.includes('动画') || genre.includes('动画');
      return true;
    };

    const apply = function () {
      const q = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        const matched = haystack.includes(q) && matchType(card);
        card.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    if (input) input.addEventListener('input', apply);

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeType = chip.dataset.filterType || 'all';
        apply();
      });
    });
  });
});
