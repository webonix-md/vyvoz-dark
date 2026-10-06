/* ECOVAN — меню, быстрая цена, подбор машины, появление блоков */
(function () {
  'use strict';

  /* ---------- мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
    });
  }

  /* ---------- уведомление ---------- */
  var toast = document.getElementById('toast');
  var tTimer;
  function say(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('on');
    clearTimeout(tTimer);
    tTimer = setTimeout(function () { toast.classList.remove('on'); }, 4200);
  }

  /* ---------- быстрая цена: собираем текст сообщения ---------- */
  var quick = document.getElementById('quick');
  if (quick) {
    var val = function (id) { var s = document.getElementById(id); return s ? s.options[s.selectedIndex].text : ''; };
    var message = function () {
      return quick.dataset.msg
        .replace('{what}', val('q-what').toLowerCase())
        .replace('{floor}', val('q-floor').toLowerCase())
        .replace('{lift}', val('q-lift'))
        .replace('{when}', val('q-when'));
    };

    // WhatsApp умеет принимать готовый текст
    var wa = quick.querySelector('.js-wa');
    var waBase = wa.getAttribute('href');
    var syncWa = function () { wa.href = waBase + '?text=' + encodeURIComponent(message()); };
    quick.addEventListener('change', syncWa);
    syncWa();

    // Viber не принимает текст в ссылке на чат — копируем его в буфер
    var vb = quick.querySelector('.js-viber');
    vb.addEventListener('click', function () {
      var text = message();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { say(quick.dataset.copied); }, function () {});
      }
    });
  }

  /* ---------- подбор машины ---------- */
  var dataEl = document.getElementById('calc-data');
  var chips = document.getElementById('chips');
  if (dataEl && chips) {
    var data = JSON.parse(dataEl.textContent);
    var res = document.getElementById('res');
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    var show = function (k) {
      var d = data[k]; if (!d) return;
      set('r-car', d.car); set('r-vol', d.vol); set('r-time', d.time);
      set('r-price', d.price); set('r-men', d.men); set('r-note', d.note);
      res.classList.remove('res__fade'); void res.offsetWidth; res.classList.add('res__fade');
    };
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      chips.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); });
      show(b.dataset.k);
    });
    var first = chips.querySelector('[aria-pressed="true"]');
    show(first ? first.dataset.k : 'bath');
  }

  /* ---------- появление при прокрутке ---------- */
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
})();
