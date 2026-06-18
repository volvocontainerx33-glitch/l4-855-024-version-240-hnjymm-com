(function () {
  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = $(".menu-toggle");
    var panel = $(".mobile-panel");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = $$(".hero-slide");
    if (!slides.length) return;
    var dots = $$(".hero-dot");
    var prev = $(".hero-prev");
    var next = $(".hero-next");
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function setupFilters() {
    var input = $("[data-filter-input]");
    var select = $("[data-category-filter]");
    var cards = $$(".movie-card");
    if (!cards.length || (!input && !select)) return;

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var cat = select ? select.value : "all";
      cards.forEach(function (card) {
        var hay = ((card.dataset.title || "") + " " + (card.dataset.meta || "")).toLowerCase();
        var okQ = !q || hay.indexOf(q) !== -1;
        var okC = cat === "all" || card.dataset.category === cat;
        card.style.display = okQ && okC ? "" : "none";
      });
    }

    if (input) input.addEventListener("input", apply);
    if (select) select.addEventListener("change", apply);
    apply();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function setupSearchPage() {
    var form = $("[data-search-form]");
    var input = $("[data-search-input]");
    var results = $("#searchResults");
    if (!form || !input || !results || !window.siteMovieIndex) return;

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function render() {
      var q = input.value.trim().toLowerCase();
      var list = window.siteMovieIndex.filter(function (movie) {
        var hay = (movie.title + " " + movie.genre + " " + movie.tags + " " + movie.region + " " + movie.year).toLowerCase();
        return !q || hay.indexOf(q) !== -1;
      }).slice(0, 180);

      if (!list.length) {
        results.innerHTML = '<div class="no-results">没有找到匹配的影片</div>';
        return;
      }

      results.innerHTML = list.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-wrap" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
          '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<div class="card-tags"><span>' + escapeHtml(movie.genre.split(/[、,，\/]/)[0] || movie.type) + '</span></div>' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.desc) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
      history.replaceState(null, "", url);
      render();
    });

    input.addEventListener("input", render);
    render();
  }

  function initMoviePlayer(src) {
    var video = document.getElementById("mainVideo");
    var overlay = document.getElementById("playOverlay");
    if (!video || !src) return;
    var started = false;
    var hlsInstance = null;

    function attach() {
      if (started) return;
      started = true;
      if (overlay) overlay.classList.add("hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", attach);
    }

    video.addEventListener("click", function () {
      if (!started || video.paused) {
        attach();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) overlay.classList.add("hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
