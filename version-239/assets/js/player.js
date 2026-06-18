document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(function (box) {
    const video = box.querySelector('video');
    const layer = box.querySelector('.play-layer');
    const source = box.getAttribute('data-stream');
    let hls = null;
    let attached = false;

    const attach = function () {
      if (!video || !source || attached) return;
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      }
    };

    const play = function () {
      if (layer) layer.classList.add('hidden');
      attach();
      video.play().catch(function () {});
    };

    if (layer) layer.addEventListener('click', play);
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  });
});
