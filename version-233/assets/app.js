document.addEventListener('DOMContentLoaded', function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
            dot.setAttribute('aria-pressed', dotIndex === currentSlide ? 'true' : 'false');
        });
    }
    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });
    if (slides.length > 1) {
        setInterval(function() {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var status = document.querySelector('[data-filter-status]');
    function applyFilter() {
        if (!filterInput || !cards.length) {
            return;
        }
        var keyword = filterInput.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function(card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (status) {
            status.textContent = keyword ? '已筛选出 ' + visible + ' 部影片' : '输入关键词即可筛选影片';
        }
    }
    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
        }
        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }
});
