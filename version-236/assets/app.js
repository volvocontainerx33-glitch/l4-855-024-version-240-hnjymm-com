(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';

      if (!query) {
        event.preventDefault();
        window.location.href = './movies.html';
      }
    });
  });

  function setCover(element) {
    var cover = element.getAttribute('data-cover');

    if (cover) {
      element.style.setProperty('--cover-url', 'url("' + cover + '")');
    }
  }

  var coverElements = Array.prototype.slice.call(document.querySelectorAll('[data-cover]'));

  if ('IntersectionObserver' in window) {
    var coverObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setCover(entry.target);
          coverObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '180px'
    });

    coverElements.forEach(function (element) {
      coverObserver.observe(element);
    });
  } else {
    coverElements.forEach(setCover);
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var searchInput = document.querySelector('[data-live-search]');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
  var noResult = document.querySelector('[data-no-result]');

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilters() {
    if (!filterItems.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var active = {};

    filterSelects.forEach(function (select) {
      active[select.getAttribute('data-filter-select')] = normalize(select.value);
    });

    var visible = 0;

    filterItems.forEach(function (item) {
      var haystack = normalize([
        item.getAttribute('data-filter-title'),
        item.getAttribute('data-filter-region'),
        item.getAttribute('data-filter-type'),
        item.getAttribute('data-filter-year'),
        item.getAttribute('data-filter-tags')
      ].join(' '));

      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchType = !active.type || normalize(item.getAttribute('data-filter-type')) === active.type;
      var matchRegion = !active.region || normalize(item.getAttribute('data-filter-region')) === active.region;
      var matchYear = !active.year || normalize(item.getAttribute('data-filter-year')) === active.year;
      var matched = matchQuery && matchType && matchRegion && matchYear;

      item.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');

    if (queryValue) {
      searchInput.value = queryValue;
    }

    searchInput.addEventListener('input', applyFilters);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  applyFilters();

  var video = document.querySelector('[data-movie-player]');
  var playButton = document.querySelector('[data-play-button]');
  var hlsPromise;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsPromise;
  }

  if (video && playButton) {
    var source = video.getAttribute('data-video-src');
    var initialized = false;

    function prepareVideo() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            maxBufferLength: 60,
            enableWorker: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }).catch(function () {
        video.src = source;
      });
    }

    function startPlayback() {
      prepareVideo().then(function () {
        playButton.classList.add('is-hidden');
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            video.controls = true;
          });
        }
      });
    }

    playButton.addEventListener('click', startPlayback);
  }
})();
