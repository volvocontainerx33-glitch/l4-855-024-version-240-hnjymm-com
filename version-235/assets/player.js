(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setMessage(container, text) {
        var message = container.querySelector('[data-player-message]');
        if (message) {
            message.textContent = text || '';
        }
    }

    function startPlayer(container) {
        var video = container.querySelector('video');
        var overlay = container.querySelector('[data-player-start]');
        var source = container.getAttribute('data-video-src');
        if (!video || !source) {
            setMessage(container, '播放源未配置。');
            return;
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        setMessage(container, '正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setMessage(container, '');
                video.play().catch(function () {
                    setMessage(container, '浏览器已阻止自动播放，请再次点击播放器播放。');
                });
            }, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setMessage(container, '');
                video.play().catch(function () {
                    setMessage(container, '浏览器已阻止自动播放，请再次点击播放器播放。');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage(container, '播放加载失败，请刷新页面或检查网络后重试。');
                    hls.destroy();
                }
            });
            return;
        }

        video.src = source;
        video.load();
        video.play().catch(function () {
            setMessage(container, '当前浏览器可能不支持 HLS 播放，请换用支持 HLS 的浏览器。');
        });
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
        players.forEach(function (container) {
            var button = container.querySelector('[data-player-start]');
            if (button) {
                button.addEventListener('click', function () {
                    startPlayer(container);
                });
            }
        });
    });
}());
