(function(){
  'use strict';
  document.documentElement.classList.remove('nojs');
  var menoMoto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var main = document.getElementById('catalogo');
  var sezioni = [].slice.call(main.querySelectorAll('.prod'));
  var piano = (window.CATALOGO || {}).produttori || {};
  var testata = document.querySelector('.testata');
  function barra(){ return testata ? testata.offsetHeight : 0; }

  /* ---- le foto. La prima di ogni produttore ha gia' il suo src (lazy): si vede
     anche senza JS. Le altre partono con data-src e si svegliano quando la
     galleria entra in vista; il carosello gira solo per la galleria visibile. */
  function sveglia(sez, tutte){
    var imgs = sez.querySelectorAll('.galleria img[data-src]');
    for (var i = 0; i < imgs.length; i++){
      imgs[i].src = imgs[i].getAttribute('data-src');
      imgs[i].removeAttribute('data-src');
      if (!tutte) break;
    }
  }
  var giri = {};
  function passo(sez, avanti){
    var imgs = [].slice.call(sez.querySelectorAll('.galleria img'));
    var punti = [].slice.call(sez.querySelectorAll('.punti i'));
    if (imgs.length < 2) return;
    var k = 0;
    for (var i = 0; i < imgs.length; i++) if (imgs[i].classList.contains('vivo')) { k = i; break; }
    var n = (k + (avanti === false ? imgs.length - 1 : 1)) % imgs.length;
    if (!imgs[n].getAttribute('src')) return;
    imgs[k].classList.remove('vivo'); imgs[n].classList.add('vivo');
    if (punti[k]) punti[k].classList.remove('vivo');
    if (punti[n]) punti[n].classList.add('vivo');
  }
  function avvia(sez){
    sveglia(sez, true);
    if (giri[sez.id] || menoMoto) return;
    giri[sez.id] = setInterval(function(){ passo(sez, true); }, 3800);
  }
  function ferma(sez){ if (giri[sez.id]){ clearInterval(giri[sez.id]); delete giri[sez.id]; } }
  function prossima(sez){
    var vivi = sezioni.filter(function(s){ return !s.hidden; });
    var i = vivi.indexOf(sez);
    return (i >= 0 && i < vivi.length - 1) ? vivi[i + 1] : null;
  }
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(voci){
      voci.forEach(function(v){
        var sez = v.target.parentNode;
        while (sez && !(sez.classList && sez.classList.contains('prod'))) sez = sez.parentNode;
        if (!sez) return;
        if (v.isIntersecting){ avvia(sez); var nx = prossima(sez); if (nx) sveglia(nx, false); }
        else ferma(sez);
      });
    }, { rootMargin: '150px 0px' });
    sezioni.forEach(function(s){ var g = s.querySelector('.galleria'); if (g) io.observe(g); });
  } else {
    sezioni.forEach(function(s){ sveglia(s, true); });
  }
  /* toccare la foto la fa andare avanti: sul telefono e' il gesto naturale */
  sezioni.forEach(function(s){
    var g = s.querySelector('.galleria');
    if (g) g.addEventListener('click', function(){ ferma(s); passo(s, true); });
  });

  /* ---- chi sto leggendo: aggiorna l'indirizzo e l'indice, senza far saltare niente */
  var attiva = null, ticchetta = false;
  function quale(){
    ticchetta = false;
    var y = barra() + 10, trovata = null;
    for (var i = 0; i < sezioni.length; i++){
      var s = sezioni[i];
      if (s.hidden) continue;
      var r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y){ trovata = s; break; }
    }
    var id = trovata ? trovata.id : null;
    if (id === attiva) return;
    attiva = id;
    if (history.replaceState) history.replaceState(null, '', id ? '#' + id : location.pathname);
    [].forEach.call(document.querySelectorAll('.indice a'), function(a){
      if (a.getAttribute('data-vai') === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function(){
    if (!ticchetta){ ticchetta = true; requestAnimationFrame(quale); }
  }, { passive: true });

  function vaiA(id, liscio){
    var s = document.getElementById(id);
    if (!s || s.hidden) return;
    var y = s.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - barra() + 1;
    try { window.scrollTo({ top: y, behavior: (liscio && !menoMoto) ? 'smooth' : 'auto' }); }
    catch (e) { window.scrollTo(0, y); }
  }

  /* ---- i due pannelli: indice dei produttori e filtro a € */
  var bProd = document.getElementById('btn-produttori'), pProd = document.getElementById('pannello-produttori');
  var bFil = document.getElementById('btn-filtro'), pFil = document.getElementById('filtro');
  var desktop = window.matchMedia('(min-width: 860px)');
  function stato(){
    var aperto = pProd.classList.contains('aperto') || (pFil.classList.contains('aperto') && !desktop.matches);
    document.body.classList.toggle('pannello-aperto', aperto);
  }
  function apri(p, b, si){
    p.classList.toggle('aperto', si);
    if (b) b.setAttribute('aria-expanded', si ? 'true' : 'false');
    if (si && p === pProd){
      [].forEach.call(pProd.querySelectorAll('img[data-src]'), function(im){
        im.src = im.getAttribute('data-src'); im.removeAttribute('data-src');
      });
    }
    stato();
  }
  bProd.addEventListener('click', function(e){
    e.stopPropagation();
    apri(pFil, bFil, false);
    apri(pProd, bProd, !pProd.classList.contains('aperto'));
  });
  bFil.addEventListener('click', function(e){
    e.stopPropagation();
    apri(pProd, bProd, false);
    apri(pFil, bFil, !pFil.classList.contains('aperto'));
  });
  [].forEach.call(document.querySelectorAll('[data-chiudi]'), function(b){
    b.addEventListener('click', function(){ apri(pProd, bProd, false); apri(pFil, bFil, false); });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){ apri(pProd, bProd, false); apri(pFil, bFil, false); }
  });
  document.addEventListener('click', function(e){
    if (pFil.classList.contains('aperto') && !desktop.matches && !pFil.contains(e.target)) apri(pFil, bFil, false);
  });
  [].forEach.call(document.querySelectorAll('.indice a'), function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      apri(pProd, bProd, false);
      vaiA(a.getAttribute('data-vai'), true);
    });
  });

  /* ---- l'ordine dei produttori */
  var selOrdine = document.getElementById('ordine');
  var indice = document.querySelector('.indice');
  function chiave(id){ return (piano[id] && piano[id].chiave) || id; }
  function riordina(modo){
    var ord = sezioni.slice().sort(function(a, b){
      var A = piano[a.id] || {}, B = piano[b.id] || {};
      if (modo === 'novita' && A.novita !== B.novita) return A.novita ? -1 : 1;
      if (modo === 'categoria' && A.catOrdine !== B.catOrdine) return A.catOrdine - B.catOrdine;
      return chiave(a.id).localeCompare(chiave(b.id), 'it');
    });
    ord.forEach(function(s){
      main.appendChild(s);
      var li = indice.querySelector('li[data-p="' + s.id + '"]');
      if (li) indice.appendChild(li);
    });
    sezioni = ord;
    window.scrollTo(0, 0);
  }
  if (selOrdine) selOrdine.addEventListener('change', function(){ riordina(selOrdine.value); });

  /* ---- il filtro a €. La fascia e' del PRODUTTORE (Gio, 16/09): si nascondono
     produttori interi. Fascia 0 = senza costi in matrice: non sparisce mai. */
  var scelte = {};
  var lblStato = bFil.querySelector('.stato');
  function applica(){
    var att = Object.keys(scelte).filter(function(k){ return scelte[k]; }).map(Number).sort();
    sezioni.forEach(function(s){
      var f = Number(s.getAttribute('data-f') || 0);
      s.hidden = !(!att.length || f === 0 || att.indexOf(f) >= 0);
      var li = indice.querySelector('li[data-p="' + s.id + '"]');
      if (li) li.hidden = s.hidden;
    });
    if (lblStato) lblStato.textContent = att.length ? att.map(function(n){ return new Array(n + 1).join('€'); }).join(' ') : 'tutte';
    var vivo = attiva && document.getElementById(attiva);
    if (!vivo || vivo.hidden) window.scrollTo(0, 0);
    quale();
  }
  [].forEach.call(document.querySelectorAll('.filtro button[data-fascia]'), function(b){
    b.addEventListener('click', function(){
      var f = b.getAttribute('data-fascia');
      scelte[f] = !scelte[f];
      b.setAttribute('aria-pressed', scelte[f] ? 'true' : 'false');
      applica();
    });
  });
  var azzera = document.querySelector('.filtro .azzera');
  if (azzera) azzera.addEventListener('click', function(){
    scelte = {};
    [].forEach.call(document.querySelectorAll('.filtro button[data-fascia]'), function(b){ b.setAttribute('aria-pressed', 'false'); });
    applica();
  });

  /* ---- all'arrivo con un indirizzo #produttore */
  if (location.hash && location.hash.length > 1){
    var id = decodeURIComponent(location.hash.slice(1));
    var vai = function(){ vaiA(id, false); };
    setTimeout(vai, 30);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(vai);
  }
  quale();
})();

/* ───────── i prezzi dopo i dati (Gio, 09/10/2026 17:16) — stessa regola di natale/porta.js.
   Senza dati si sfoglia tutto e i prezzi restano coperti; con ?aperto=1 (da chi ha già lasciato i dati sulla pagina
   di Natale) o con il segno nel browser si vedono subito. Il modulo manda i dati allo script di Gio (natale/config.js → ENDPOINT);
   se non c'è, i prezzi si aprono lo stesso. */
(function(){
  'use strict';
  var C = window.PB_NATALE || {};
  var $ = function(id){ return document.getElementById(id); };
  var q = new URLSearchParams(location.search), body = document.body, t0 = Date.now();
  var CHIAVE = 'pbNatale2026Aperto';
  function giaAperto(){ if (q.get('aperto') === '1') return true; try { return localStorage.getItem(CHIAVE) === '1'; } catch(e){ return false; } }
  function ricorda(){ try { localStorage.setItem(CHIAVE, '1'); } catch(e){} }
  var per = (q.get('per') || '').replace(/[\u0000-\u001f\u007f<>]/g,'').replace(/-/g,' ').replace(/\s+/g,' ').trim().slice(0,80);
  var da = (q.get('da') || '').toLowerCase(); if (!/^[a-z0-9-]{1,20}$/.test(da)) da = ''; if (per && !da) da = 'link';
  var origine = da || 'catalogo';
  /* i link in fondo portano con sé nome, origine e via libera */
  function coda(url, conAperto){ var p = []; if (per) p.push('per=' + encodeURIComponent(per.replace(/\s+/g,'-'))); if (da) p.push('da=' + encodeURIComponent(da)); if (conAperto && giaAperto()) p.push('aperto=1'); return url + (p.length ? '?' + p.join('&') : ''); }
  var vc = $('vai-confezioni'), vn = $('vai-natale');
  function sistemaLink(){ if (vc) vc.href = coda('../natale/confezioni/', true); if (vn) vn.href = coda('../natale/', false); }
  sistemaLink();
  function scopri(){ body.classList.remove('senza-prezzi'); ricorda(); sistemaLink(); }
  if (giaAperto()) scopri(); else body.classList.add('senza-prezzi');

  var cancello = $('cancello');
  function apri(){ if (!cancello) return; if (typeof cancello.showModal === 'function') { if (!cancello.open) cancello.showModal(); } else cancello.setAttribute('open',''); var primo = cancello.querySelector('input[type=text]'); if (primo && !primo.value) primo.focus(); }
  function chiudi(){ if (!cancello) return; if (typeof cancello.close === 'function' && cancello.open) cancello.close(); else cancello.removeAttribute('open'); }
  [].forEach.call(document.querySelectorAll('[data-apri-cancello]'), function(b){ b.addEventListener('click', apri); });
  [].forEach.call(document.querySelectorAll('[data-chiudi-cancello]'), function(b){ b.addEventListener('click', chiudi); });
  if (cancello) cancello.addEventListener('click', function(e){ if (e.target === cancello) chiudi(); });
  document.addEventListener('click', function(e){ if (!body.classList.contains('senza-prezzi')) return; var pz = e.target.closest && e.target.closest('.pz'); if (pz) { e.preventDefault(); apri(); } });

  var f = $('modulo'); if (!f) return;
  var esito = $('esito'), invia = $('invia');
  if (per && $('f-azienda')) $('f-azienda').value = per;
  $('f-origine').value = origine;
  var reMail = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;
  var emailObbl = !(per && C.EMAIL_FACOLTATIVA_CON_LINK);
  function campo(id){ return $(id).closest('.campo'); }
  function segna(id, ok){ var c = campo(id); if (c) c.classList.toggle('campo-err', !ok); $(id).setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; }
  function dati(){
    var r = f.querySelector('input[name=quantita]:checked');
    return { nome: $('f-nome').value.trim(), azienda: $('f-azienda').value.trim(), email: $('f-email').value.trim(), telefono: $('f-tel').value.trim(),
      quantita: r ? r.value : '', messaggio: '', privacy: $('f-privacy').checked, aggiornamenti: $('f-agg').checked, origine: origine, per: per, porta: 'catalogo',
      sito: $('f-sito').value, pagina: location.pathname, ua: (navigator.userAgent || '').slice(0,300), t: Date.now() - t0 };
  }
  function valida(d){
    var ok = true, primo = null;
    [['f-nome', !!d.nome], ['f-azienda', !!d.azienda], ['f-email', emailObbl ? reMail.test(d.email) : (!d.email || reMail.test(d.email))], ['f-privacy', d.privacy]].forEach(function(x){ if (!segna(x[0], x[1])) { ok = false; if (!primo) primo = x[0]; } });
    if (primo) $(primo).focus();
    return ok;
  }
  function mostra(t){ esito.textContent = t; }
  function attesa(on){ invia.disabled = on; invia.textContent = on ? 'Un momento…' : 'Vedi i prezzi'; }
  function dopo(){ chiudi(); scopri(); }
  f.addEventListener('submit', function(e){
    e.preventDefault();
    var d = dati();
    if (!valida(d)) { mostra('Mancano dei dati: li trovi segnati sopra.'); return; }
    if (d.sito || !C.ENDPOINT) { dopo(); return; }
    attesa(true);
    var corpo = JSON.stringify(d);
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function(){ if (ctrl) ctrl.abort(); }, 15000);
    fetch(C.ENDPOINT, { method: 'POST', body: corpo, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: ctrl ? ctrl.signal : undefined })
      .then(function(r){ return r.json(); }).then(function(){ clearTimeout(timer); attesa(false); dopo(); })
      .catch(function(){ fetch(C.ENDPOINT, { method: 'POST', body: corpo, mode: 'no-cors' }).then(function(){ clearTimeout(timer); attesa(false); dopo(); }).catch(function(){ clearTimeout(timer); attesa(false); dopo(); }); });
  });
})();
