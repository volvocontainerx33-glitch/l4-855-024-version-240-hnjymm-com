(function () {
  const menuButton = document.getElementById("mobileMenuButton");
  const navLinks = document.getElementById("mainNavLinks");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  let activeSlide = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const target = Number(dot.getAttribute("data-hero-dot"));
        showSlide(target);
        startHero();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(activeSlide - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeSlide + 1);
        startHero();
      });
    }
    startHero();
  }

  const searchInput = document.querySelector("[data-search-input]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const genreFilter = document.querySelector("[data-genre-filter]");
  const categoryFilter = document.querySelector("[data-category-filter]");
  const cards = Array.from(document.querySelectorAll(".movie-card"));

  function matchYear(cardYear, selected) {
    if (!selected) {
      return true;
    }
    const year = Number(cardYear);
    if (selected === "older") {
      return year < 2020;
    }
    return String(year) === selected;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedYear = yearFilter ? yearFilter.value : "";
    const selectedGenre = genreFilter ? genreFilter.value : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "";

    cards.forEach(function (card) {
      const text = (card.getAttribute("data-search") || "").toLowerCase();
      const year = card.getAttribute("data-year") || "";
      const genre = card.getAttribute("data-genre") || "";
      const category = card.getAttribute("data-category") || "";
      const visible =
        (!query || text.includes(query)) &&
        matchYear(year, selectedYear) &&
        (!selectedGenre || genre.includes(selectedGenre)) &&
        (!selectedCategory || category === selectedCategory);
      card.style.display = visible ? "" : "none";
    });
  }

  [searchInput, yearFilter, genreFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });
})();

function setupMoviePlayer(videoId, playId, overlayId, source) {
  const video = document.getElementById(videoId);
  const playButton = document.getElementById(playId);
  const overlay = document.getElementById(overlayId);
  let loaded = false;
  let hls = null;

  if (!video || !overlay || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function beginPlayback() {
    loadSource();
    overlay.classList.add("hidden");
    const request = video.play();
    if (request && typeof request.catch === "function") {
      request.catch(function () {});
    }
  }

  overlay.addEventListener("click", beginPlayback);

  if (playButton) {
    playButton.addEventListener("click", function (event) {
      event.stopPropagation();
      beginPlayback();
    });
  }

  video.addEventListener("click", function () {
    if (!loaded) {
      beginPlayback();
      return;
    }
    if (video.paused) {
      const request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
