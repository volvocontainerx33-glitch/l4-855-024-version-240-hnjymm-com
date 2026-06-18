(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function toggleMobileNav() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function bindSearchForms() {
        selectAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = './search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function bindHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', slider);
        var dots = selectAll('[data-hero-dot]', slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
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

    function bindCardFilter() {
        selectAll('[data-card-filter]').forEach(function (input) {
            var scope = input.closest('[data-filter-scope]') || document;
            var cards = selectAll('[data-search-text]', scope);
            var summary = scope.querySelector('[data-filter-summary]');
            function apply() {
                var query = normalize(input.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search-text'));
                    var match = !query || haystack.indexOf(query) !== -1;
                    card.classList.toggle('is-hidden', !match);
                    if (match) {
                        shown += 1;
                    }
                });
                if (summary) {
                    summary.textContent = query ? '已匹配 ' + shown + ' 部影片' : '输入片名、地区、类型或标签快速筛选';
                }
            }
            input.addEventListener('input', apply);
            apply();
        });
    }

    function bindQuickFilters() {
        selectAll('[data-quick-filter]').forEach(function (button) {
            button.addEventListener('click', function () {
                var scope = button.closest('[data-filter-scope]') || document;
                var input = scope.querySelector('[data-card-filter]');
                var value = button.getAttribute('data-quick-filter') || '';
                selectAll('[data-quick-filter]', scope).forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                if (input) {
                    input.value = value;
                    input.dispatchEvent(new Event('input'));
                }
            });
        });
    }

    function applySearchQuery() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }
        var input = page.querySelector('[data-card-filter]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input && query) {
            input.value = query;
            input.dispatchEvent(new Event('input'));
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMobileNav();
        bindSearchForms();
        bindHero();
        bindCardFilter();
        bindQuickFilters();
        applySearchQuery();
    });
})();
