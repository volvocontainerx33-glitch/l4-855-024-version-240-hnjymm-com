(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initLocalFilters() {
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var input = document.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
        var counter = document.querySelector('[data-filter-count]');

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' '));
        }

        function apply() {
            var keyword = input ? normalize(input.value) : '';
            var visibleCount = 0;
            cards.forEach(function (card) {
                var matched = true;
                if (keyword && cardText(card).indexOf(keyword) === -1) {
                    matched = false;
                }
                selects.forEach(function (select) {
                    var attr = select.getAttribute('data-filter-select');
                    var expected = normalize(select.value);
                    if (expected && normalize(card.getAttribute('data-' + attr)) !== expected) {
                        matched = false;
                    }
                });
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });
            if (counter) {
                counter.textContent = '当前显示 ' + visibleCount + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
    }

    function cardTemplate(movie) {
        var safeTitle = escapeHtml(movie.title);
        var safeDescription = escapeHtml(movie.description);
        var safeRegion = escapeHtml(movie.region);
        var safeType = escapeHtml(movie.type);
        var safeGenre = escapeHtml(movie.genre);
        var safeYear = escapeHtml(movie.year);
        var safeCover = escapeHtml(movie.cover);
        var safeUrl = escapeHtml(movie.url);

        return `
<article class="movie-card">
    <a href="${safeUrl}" class="movie-card-link" aria-label="观看 ${safeTitle}">
        <div class="poster-frame">
            <img src="${safeCover}" alt="${safeTitle}海报" loading="lazy" onerror="this.closest('.poster-frame').classList.add('poster-frame--empty'); this.remove();">
            <span class="poster-badge">${safeRegion}</span>
            <span class="poster-year">${safeYear}</span>
        </div>
        <div class="movie-card-body">
            <h3>${safeTitle}</h3>
            <p>${safeDescription}</p>
            <div class="movie-meta-row">
                <span>${safeType}</span>
                <span>${safeGenre}</span>
            </div>
            <div class="movie-stat-row">
                <span>热度 ${Number(movie.views).toLocaleString()}</span>
                <span>赞 ${Number(movie.likes).toLocaleString()}</span>
            </div>
        </div>
    </a>
</article>`;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-page-input]');
        var summary = document.querySelector('[data-search-summary]');
        if (!results || !input || !summary || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function render(rawQuery) {
            var terms = normalize(rawQuery).split(/\s+/).filter(Boolean);
            if (!terms.length) {
                results.innerHTML = '';
                summary.textContent = '请输入关键词开始搜索。';
                return;
            }
            var matches = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.description,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.category
                ].join(' '));
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            });
            summary.textContent = '找到 ' + matches.length + ' 部影片。';
            results.innerHTML = matches.slice(0, 240).map(cardTemplate).join('');
            if (matches.length > 240) {
                summary.textContent += ' 当前显示前 240 条，可继续增加关键词缩小范围。';
            }
        }

        render(query);
        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initLocalFilters();
        initSearchPage();
    });
}());
