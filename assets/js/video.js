/* Klick-Einbettung für YouTube. Vor dem Klick gibt es keinen Aufruf an Fremdserver. */
(function () {
  var boxes = document.querySelectorAll('.vd-box[data-video-id]');
  boxes.forEach(function (box) {
    var id = box.getAttribute('data-video-id');
    var button = box.querySelector('.vd-button');
    if (!button || !/^[A-Za-z0-9_-]{11}$/.test(id)) { return; }
    button.hidden = false;
    var fallback = box.querySelector('.vd-fallback');
    if (fallback) { fallback.hidden = true; }

    button.addEventListener('click', function () {
      var frame = document.createElement('div');
      frame.className = 'vd-frame';
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = box.getAttribute('data-titel') || 'Video';
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.appendChild(iframe);
      box.textContent = '';
      box.appendChild(frame);
      box.setAttribute('data-geladen', 'ja');
    });
  });
})();
