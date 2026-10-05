/* Filter der Geschichten-Übersicht nach Land. Keine Netzwerkzugriffe. */
(function () {
  var buttons = document.querySelectorAll('.ls-filter-btn');
  var items = document.querySelectorAll('.ls-item');
  var empty = document.querySelector('.ls-leer');

  function show(land) {
    var visible = 0;
    items.forEach(function (it) {
      var ok = land === 'alle' || it.getAttribute('data-land') === land;
      it.hidden = !ok;
      if (ok) { visible++; }
    });
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-land') === land ? 'true' : 'false');
    });
    if (empty) { empty.hidden = visible > 0; }
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-land')); });
  });

  var m = /[?&]land=(eritrea|thailand|laos)/.exec(location.search);
  show(m ? m[1] : 'alle');
})();
