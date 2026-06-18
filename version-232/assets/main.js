(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
            menuButton.textContent = opened ? "×" : "☰";
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-arrow.prev");
    var next = document.querySelector(".hero-arrow.next");
    var heroIndex = 0;
    var heroTimer = null;

    function setHeroSlide(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("active", current === heroIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("active", current === heroIndex);
        });
    }

    function startHeroTimer() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            setHeroSlide(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            setHeroSlide(index);
            startHeroTimer();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            setHeroSlide(heroIndex - 1);
            startHeroTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            setHeroSlide(heroIndex + 1);
            startHeroTimer();
        });
    }

    setHeroSlide(0);
    startHeroTimer();

    var searchForm = document.querySelector(".search-panel form");
    var searchInput = document.querySelector("#search-input");
    var searchCards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-pill"));
    var searchCount = document.querySelector(".search-count");
    var activeFilter = "全部";

    function getQueryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applySearch() {
        var query = normalize(searchInput ? searchInput.value : "");
        var shown = 0;
        searchCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category"),
                card.getAttribute("data-year")
            ].join(" "));
            var category = card.getAttribute("data-category") || "";
            var matchesQuery = !query || haystack.indexOf(query) >= 0;
            var matchesFilter = activeFilter === "全部" || category === activeFilter;
            var visible = matchesQuery && matchesFilter;
            card.classList.toggle("is-hidden", !visible);
            if (visible) {
                shown += 1;
            }
        });
        if (searchCount) {
            searchCount.textContent = query ? "找到 " + shown + " 部作品" : "为你展示 " + shown + " 部作品";
        }
    }

    if (searchInput && searchCards.length) {
        searchInput.value = getQueryFromUrl();
        searchInput.addEventListener("input", applySearch);
        applySearch();
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applySearch();
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter") || "全部";
            filterButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });
            applySearch();
        });
    });
})();

function initializeMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
        return;
    }

    var overlay = button.closest(".player-overlay");
    var message = document.querySelector(".player-message");
    var hlsInstance = null;
    var loaded = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text;
        }
    }

    function loadSource() {
        if (loaded) {
            return;
        }
        loaded = true;
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function () {
                setMessage("播放暂时无法加载，请稍后再试");
            });
        } else {
            video.src = source;
        }
    }

    function playVideo() {
        loadSource();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
                setMessage("点击播放按钮开始观看");
            });
        }
    }

    button.addEventListener("click", function (event) {
        event.preventDefault();
        playVideo();
    });

    if (overlay) {
        overlay.addEventListener("click", function (event) {
            if (event.target !== button) {
                playVideo();
            }
        });
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("ended", function () {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
