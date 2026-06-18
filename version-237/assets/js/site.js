(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function(dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5000);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const categoryFilter = document.querySelector('[data-category-filter]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    const query = normalize(searchInput ? searchInput.value : '');
    const typeValue = normalize(typeFilter ? typeFilter.value : '');
    const categoryValue = normalize(categoryFilter ? categoryFilter.value : '');
    let visible = 0;

    cards.forEach(function(card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.category
      ].join(' '));
      const cardType = normalize(card.dataset.type);
      const cardCategory = normalize(card.dataset.category);
      const matchQuery = !query || haystack.includes(query);
      const matchType = !typeValue || cardType.includes(typeValue);
      const matchCategory = !categoryValue || cardCategory === categoryValue;
      const show = matchQuery && matchType && matchCategory;
      card.classList.toggle('is-filter-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0 && cards.length > 0);
    }
  }

  if (searchInput || typeFilter || categoryFilter) {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('q');
    if (preset && searchInput) {
      searchInput.value = preset;
    }
    [searchInput, typeFilter, categoryFilter].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  }
})();
