(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function mountNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function mountHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function mountLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    inputs.forEach(function (input) {
      var section = input.closest('section') || document;
      var scope = section.querySelector('[data-filter-scope]');
      if (!scope) {
        scope = document.querySelector('[data-filter-scope]');
      }
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));
      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有找到匹配内容';
      empty.hidden = true;
      scope.parentNode.insertBefore(empty, scope.nextSibling);

      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var ok = !value || text.indexOf(value) !== -1;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });
        empty.hidden = shown !== 0;
      });
    });
  }

  function mountSiteSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
    var items = window.siteSearchItems || [];
    inputs.forEach(function (input) {
      var box = input.parentElement.querySelector('.site-search-results');
      if (!box) {
        return;
      }

      function close() {
        box.hidden = true;
        box.innerHTML = '';
      }

      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        if (!value) {
          close();
          return;
        }
        var results = items.filter(function (item) {
          return [
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            (item.tags || []).join(' '),
            item.oneLine
          ].join(' ').toLowerCase().indexOf(value) !== -1;
        }).slice(0, 18);
        if (!results.length) {
          box.innerHTML = '<div class="search-result-item"><strong>没有找到匹配内容</strong><span>可尝试更换关键词</span></div>';
          box.hidden = false;
          return;
        }
        box.innerHTML = results.map(function (item) {
          return '<a class="search-result-item" href="' + item.url + '">' +
            '<strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</span>' +
            '<span>' + escapeHtml(item.oneLine || '') + '</span>' +
            '</a>';
        }).join('');
        box.hidden = false;
      });

      document.addEventListener('click', function (event) {
        if (!input.parentElement.contains(event.target)) {
          close();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.mountPlayer = function (id, source) {
    var wrapper = document.getElementById(id);
    if (!wrapper) {
      return;
    }
    var video = wrapper.querySelector('video');
    var cover = wrapper.querySelector('.play-cover');
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded || !video) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
      loaded = true;
    }

    function play() {
      load();
      if (cover) {
        cover.hidden = true;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (cover) {
            cover.hidden = false;
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    mountNavigation();
    mountHero();
    mountLocalFilters();
    mountSiteSearch();
  });
})();
