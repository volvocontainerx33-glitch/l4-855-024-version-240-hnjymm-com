(function () {
    window.initMoviePlayer = function (src) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var button = document.querySelector('[data-player-button]');
        if (!video || !src) {
            return;
        }
        var started = false;
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }
        function playNow() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            hideOverlay();
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = src;
            video.play().catch(function () {});
        }
        if (overlay) {
            overlay.addEventListener('click', playNow);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                playNow();
            });
        }
        video.addEventListener('click', playNow);
    };
})();
