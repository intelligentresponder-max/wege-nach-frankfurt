/* Sprachumschalter: zeigt Blöcke mit passendem lang-Attribut. Keine Netzwerkzugriffe. */
(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll('.wf-lang-btn');
  var note = document.querySelector('.wf-lang-hinweis');

  function has(lang) {
    return lang === 'de' || document.querySelector('.wf-l[lang="' + lang + '"]') !== null;
  }

  function apply(lang) {
    if (!has(lang)) { lang = 'de'; }
    root.setAttribute('data-sprache', lang);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  var anyTranslation = false;
  buttons.forEach(function (b) {
    var lang = b.getAttribute('data-lang');
    if (has(lang)) {
      if (lang !== 'de') { anyTranslation = true; }
      b.addEventListener('click', function () {
        apply(lang);
        try { localStorage.setItem('wf-sprache', lang); } catch (e) {}
      });
    } else {
      b.disabled = true;
    }
  });
  if (note && anyTranslation) { note.hidden = true; }

  var saved = 'de';
  try { saved = localStorage.getItem('wf-sprache') || 'de'; } catch (e) {}
  apply(saved);
})();
