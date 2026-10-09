/* Cowork v1.0 | Feel Good srl | Script comune delle pagine di Natale (natale/, natale/confezioni/) | v2.1 | 2026-10-09 CEST (v2.1 — Gio 17:16: le porte si aprono senza dati; i prezzi restano coperti finché non si lasciano i dati, con l'avviso fisso; «Fai il conto» e la scheda PDF arrivano con i prezzi)
   Fa quattro cose: legge da dove arriva chi visita (?da=, link personale), tiene acceso il punto giusto in testata,
   gestisce il cancello (confezioni, prezzi e catalogo dopo i dati: Gio, 05/10/2026) e il conto delle confezioni.
   Niente chiamate a terzi: l'unica è al modulo di Gio (ENDPOINT in config.js), e solo quando si preme Invia. */
(function () {
  'use strict';
  var C = window.PB_NATALE || {};
  var EMAIL = C.EMAIL || 'bottegapigliabene@gmail.com';
  var WA = C.WHATSAPP || '3905751694910';
  var $ = function (id) { return document.getElementById(id); };
  var body = document.body, pagina = body.getAttribute('data-pagina') || 'stanza';
  var q = new URLSearchParams(location.search);
  var t0 = Date.now();

  /* --- il nome dell'azienda nel link: /natale/Rossi-Srl (via 404.html → ?per=Rossi-Srl) oppure ?per=Rossi Srl --- */
  function pulisci(s) { return (s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim(); }
  var perRaw = pulisci(q.get('per'));
  var per = perRaw.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  if (per.length > 80) per = per.slice(0, 79) + '…';
  var da = (q.get('da') || '').toLowerCase();
  if (!/^[a-z0-9-]{1,20}$/.test(da)) da = '';
  if (per && !da) da = 'link';
  var origine = da || 'sito';
  var slug = perRaw ? perRaw.replace(/\s+/g, '-') : '';

  /* la barra dell'indirizzo mostra il link pulito: /natale/Rossi-Srl (la pagina è già caricata, non si ricarica) */
  if (slug && pagina === 'stanza' && history.replaceState) {
    try {
      var baseDir = location.pathname.replace(/[^\/]*$/, '');   // …/natale/
      history.replaceState(null, '', baseDir + encodeURIComponent(slug).replace(/%2D/gi, '-') + location.hash);
    } catch (e) { }
  }

  /* --- testata: il punto in cui sei resta acceso; su telefono scompare scorrendo in giù e torna scorrendo in su --- */
  var testata = document.querySelector('header.testata');
  if (testata) {
    var ultimo = window.pageYOffset || 0, piccolo = window.matchMedia('(max-width:640px)');
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || 0;
      if (!piccolo.matches) { testata.classList.remove('via'); ultimo = y; return; }
      if (y > ultimo + 6 && y > 120) testata.classList.add('via');
      else if (y < ultimo - 6) testata.classList.remove('via');
      ultimo = y;
    }, { passive: true });
  }

  /* --- WhatsApp: il testo dice da dove arriva chi scrive --- */
  var frasi = {
    qr: 'Ciao, ho visto il manifesto di Natale.',
    mail: 'Ciao, dalla mail del catalogo di Natale.',
    wa: 'Ciao, dal messaggio di Natale su WhatsApp.',
    ig: 'Ciao, da Instagram.',
    pdf: 'Ciao, dalla scheda delle confezioni di Natale.',
    home: 'Ciao, dal sito, pagina di Natale.'
  };
  function fraseWA() {
    if (per) return 'Ciao, sono di ' + per + ': ho aperto la pagina di Natale che ci avete mandato.';
    return frasi[da] || 'Ciao, dalla pagina di Natale per le aziende.';
  }
  function linkWA(testo) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(testo); }
  Array.prototype.forEach.call(document.querySelectorAll('.js-wa'), function (a) { a.href = linkWA(fraseWA()); });

  /* --- «Preparato per …»: il nome dell'azienda in testa --- */
  var h1 = document.querySelector('h1');
  if (per) {
    document.title = per + ' · Regali aziendali di Natale 2026 · Piglia Bene';
    var perBox = $('per-box');
    if (perBox) {
      perBox.hidden = false;
      var nome = $('per-nome'); if (nome) nome.textContent = per;
      var h1std = $('h1-standard'); if (h1std) h1std.hidden = true;
      h1 = $('per-nome');
    }
    Array.prototype.forEach.call(document.querySelectorAll('.js-per'), function (e) { e.textContent = per; });
    Array.prototype.forEach.call(document.querySelectorAll('.js-per-frase'), function (e) { e.hidden = false; });
    var fA = $('f-azienda'); if (fA) fA.value = per;
  }
  /* un nome lungo si stringe finché la riga più lunga ci sta (misura vera, non stima) */
  function adatta(el) {
    if (!el) return;
    var fs = parseFloat(getComputedStyle(el).fontSize), largo = el.clientWidth, giri = 0;
    while (el.scrollWidth > largo + 1 && fs > 22 && giri < 40) { fs *= 0.94; el.style.fontSize = fs + 'px'; giri++; }
  }
  if (h1) { adatta(h1); window.addEventListener('resize', function () { h1.style.fontSize = ''; adatta(h1); }); }

  /* --- date: si scrivono in config.js --- */
  var MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  function parseData(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; }
  function scrivi(d) { var x = new Date(d); return x.getUTCDate() + ' ' + MESI[x.getUTCMonth()]; }
  function oggiRoma() {
    try {
      var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      return parseData(p);
    } catch (e) { var n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); }
  }
  var oggi = oggiRoma(), G = 864e5;
  var dSc = parseData(C.SCAGLIONI_FINO || '2026-10-30');
  var dAn = parseData(C.ANTICIPATO_FINO || '2026-11-15');
  var dCh = parseData(C.CHIUSURA_ORDINI);
  Array.prototype.forEach.call(document.querySelectorAll('.js-chiusura'), function (e) { if (dCh) e.textContent = scrivi(dCh); });
  Array.prototype.forEach.call(document.querySelectorAll('.js-scaglioni'), function (e) { if (dSc) e.textContent = scrivi(dSc); });
  Array.prototype.forEach.call(document.querySelectorAll('.js-anticipato'), function (e) { if (dAn) e.textContent = scrivi(dAn); });
  if (C.CONSEGNA && $('cond-consegna')) { $('cond-consegna').textContent = C.CONSEGNA; $('riga-consegna').hidden = false; }

  function giorni(d) { return Math.round((d - oggi) / G); }
  function conto(n, titolo, resto) {
    var nn = $('conto-n'), co = $('conto-cosa'); if (!co) return;
    co.textContent = '';
    var b = document.createElement('b'); b.textContent = titolo; co.appendChild(b);
    co.appendChild(document.createTextNode(resto));
    if (n === null) { nn.hidden = true; $('conto').classList.add('senza-n'); return; }
    nn.textContent = n;
  }
  if ($('conto')) {
    if (dSc !== null && oggi <= dSc) {
      var n1 = giorni(dSc);
      if (n1 === 0) conto(null, 'Oggi è l’ultimo giorno', ' degli sconti di quantità.');
      else conto(n1, n1 === 1 ? 'Giorno' : 'Giorni', ' agli sconti di quantità: valgono per gli ordini fino al ' + scrivi(dSc) + '.');
    } else if (dAn !== null && oggi <= dAn) {
      var n2 = giorni(dAn), insieme = dCh === dAn;
      if (n2 === 0) conto(null, 'Oggi chiudono le promozioni', insieme ? ' Ultimo giorno per ordinare online e per il −7 % con pagamento anticipato.' : ' Ultimo giorno del −7 % con pagamento anticipato.');
      else conto(n2, n2 === 1 ? 'Giorno' : 'Giorni', ' alla chiusura delle promozioni: −7 % con pagamento anticipato fino al ' + scrivi(dAn) + '.');
    } else if (dCh !== null && oggi <= dCh) {
      var n3 = giorni(dCh);
      if (n3 === 0) conto(null, 'Oggi', ' è l’ultimo giorno per ordinare.');
      else conto(n3, n3 === 1 ? 'Giorno' : 'Giorni', ' all’ultimo giorno per ordinare: ' + scrivi(dCh) + '.');
    } else {
      conto(null, 'Promozioni chiuse', dCh ? ' il ' + scrivi(dCh) + '. Si ordina in bottega, secondo disponibilità.' : '');
    }
  }

  /* --- fai il conto (pagina confezioni): la stessa regola della pagina Ordini del Database (Gio, 05/10/2026) --- */
  function preparaConto() {
    var box = $('calcola'), arts = document.querySelectorAll('article.canvas[data-prezzo]');
    if (!box || box.getAttribute('data-pronto')) return;
    box.setAttribute('data-pronto', '1');
    var chiuse = (dAn !== null && oggi > dAn) || (dCh !== null && oggi > dCh);
    if (!arts.length || chiuse) return;
    var entroSc = dSc !== null && oggi <= dSc;
    var righe = [], cont = $('calc-righe');
    function euro(v) { return v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
    Array.prototype.forEach.call(arts, function (a, i) {
      var r = { nome: a.getAttribute('data-nome') || '', prezzo: parseFloat(a.getAttribute('data-prezzo')), q: 0 };
      if (!(r.prezzo > 0)) return;
      var riga = document.createElement('div'); riga.className = 'calc-riga';
      var lab = document.createElement('label'); lab.htmlFor = 'q-' + i;
      var nm = document.createElement('span'); nm.className = 'calc-nome'; nm.textContent = r.nome;
      var pr = document.createElement('span'); pr.className = 'calc-prezzo'; pr.textContent = euro(r.prezzo) + ' a confezione';
      lab.appendChild(nm); lab.appendChild(pr);
      var inp = document.createElement('input'); inp.type = 'number'; inp.id = 'q-' + i; inp.min = '0'; inp.step = '1';
      inp.inputMode = 'numeric'; inp.placeholder = '0'; inp.setAttribute('aria-label', 'Quante «' + r.nome + '»');
      var out = document.createElement('span'); out.className = 'r-esito';
      riga.appendChild(lab); riga.appendChild(out); riga.appendChild(inp);
      cont.appendChild(riga);
      r.inp = inp; r.out = out; righe.push(r);
      inp.addEventListener('input', calcola);
    });
    if (!righe.length) return;
    $('calc-ant').addEventListener('change', calcola);
    box.hidden = false;
    function voce(dl, k, v, cls) {
      var d = document.createElement('div'); if (cls) d.className = cls;
      var t = document.createElement('dt'); t.textContent = k; var x = document.createElement('dd'); x.textContent = v;
      d.appendChild(t); d.appendChild(x); dl.appendChild(d);
    }
    function calcola() {
      var ant = $('calc-ant').checked ? 0.93 : 1, qual = 0, tot = 0, lordo = 0, netto = 0;
      righe.forEach(function (r) { var v = parseInt(r.inp.value, 10); r.q = v > 0 ? Math.min(v, 99999) : 0; tot += r.q; if (r.q >= 25) qual += r.q; });
      var tier = !entroSc ? 0 : qual >= 200 ? 10 : qual >= 100 ? 8 : qual >= 50 ? 6 : qual >= 25 ? 4 : 0;
      righe.forEach(function (r) {
        var sc = r.q >= 25 ? tier : 0, l = r.prezzo * r.q, n = l * (1 - sc / 100) * ant;
        lordo += l; netto += n;
        r.out.className = 'r-esito' + (sc || ant < 1 ? ' sconto' : '');
        r.out.textContent = r.q ? (sc ? '−' + sc + ' %' : 'prezzo pieno') + (ant < 1 ? ' · −7 %' : '') + ' · ' + euro(n) : '';
      });
      var dl = $('calc-tot'); dl.textContent = '';
      var cons = $('calc-consiglio'); cons.textContent = '';
      var wa = $('calc-wa');
      if (!tot) { wa.hidden = true; return; }
      voce(dl, 'Confezioni', String(tot));
      voce(dl, 'Sconto di quantità', !entroSc ? 'chiuso il ' + scrivi(dSc) : tier ? '−' + tier + ' % su ' + qual + ' pezzi' : 'nessuno');
      if (ant < 1) voce(dl, 'Pagamento anticipato', '−7 % su tutto');
      if (netto < lordo - 0.004) voce(dl, 'Risparmi', euro(lordo - netto));
      voce(dl, 'Totale, IVA esclusa', euro(netto), 'tot');
      if (entroSc) {
        var vicino = righe.filter(function (r) { return r.q >= 15 && r.q < 25; })[0];
        if (vicino) cons.textContent = 'Con ' + (25 - vicino.q) + ' «' + vicino.nome + '» in più' + (qual ? ', anche quella entra nello sconto di quantità.' : ' arrivi a 25 pezzi uguali: −4 %.');
        else if (!tier) cons.textContent = 'Lo sconto di quantità parte da 25 pezzi della stessa confezione.';
      }
      var testo = ['Ciao' + (per ? ', sono di ' + per : '') + '. Vorrei un preventivo per le confezioni di Natale:'];
      righe.forEach(function (r) { if (r.q) testo.push(r.q + ' × ' + r.nome); });
      testo.push('Pagamento anticipato: ' + (ant < 1 ? 'sì' : 'no'));
      testo.push('Totale indicativo: ' + euro(netto) + ' IVA esclusa (' + origine + ')');
      wa.href = linkWA(testo.join('\n')); wa.hidden = false;
    }
  }

  /* --- il cancello (Gio, 05/10/2026 14:50): confezioni, prezzi, conto e catalogo dopo i dati.
         Si ricorda nel browser; ?aperto=1 arriva solo dalla mail che manda lo script di Gio.
         È un cancello di cortesia per raccogliere i contatti, non una protezione: i file restano pubblici a chi ha l'indirizzo. --- */
  var CHIAVE = 'pbNatale2026Aperto';
  function giaAperto() {
    if (q.get('aperto') === '1') return true;
    try { return localStorage.getItem(CHIAVE) === '1'; } catch (e) { return false; }
  }
  function ricorda() { try { localStorage.setItem(CHIAVE, '1'); } catch (e) { } }
  var catalogo = (C.CATALOGO_URL || 'https://gio-227.github.io/pigliabene-beta/catalogo/');
  var confezioni = (C.CONFEZIONI_URL || 'confezioni/');
  function conCoda(url, conAperto) {   // il nome dell'azienda, l'origine e, se c'è, il via libera ai prezzi viaggiano con chi passa la porta
    var p = []; if (slug) p.push('per=' + encodeURIComponent(slug)); if (da) p.push('da=' + encodeURIComponent(da)); if (conAperto && giaAperto()) p.push('aperto=1');
    return url + (p.length ? (url.indexOf('?') >= 0 ? '&' : '?') + p.join('&') : '');
  }
  /* porte: data-porta="confezioni" | "catalogo" */
  var destinazione = null;
  function vaiA(porta) {
    if (porta === 'catalogo') { window.open(catalogo, '_blank', 'noopener'); return; }
    location.href = conCoda(confezioni);
  }
  var cancello = $('cancello');
  function apriCancello(porta) {
    destinazione = porta || null;
    if (!cancello) return;
    var titolo = $('cancello-h'); if (titolo) titolo.textContent = 'Vedi i prezzi';
    if (typeof cancello.showModal === 'function') { if (!cancello.open) cancello.showModal(); }
    else cancello.setAttribute('open', '');
    var primo = cancello.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio])'); if (primo && !primo.value) primo.focus();
  }
  function chiudiCancello() { if (!cancello) return; if (typeof cancello.close === 'function' && cancello.open) cancello.close(); else cancello.removeAttribute('open'); }
  /* le porte si aprono senza dati (Gio, 09/10/2026 17:16): si sfoglia tutto, i prezzi arrivano con i dati */
  function sistemaPorte() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-porta]'), function (a) {
      var porta = a.getAttribute('data-porta');
      if (porta === 'catalogo') { a.href = conCoda(catalogo, true); a.target = '_blank'; a.rel = 'noopener'; }
      else if (porta === 'confezioni') a.href = conCoda(confezioni, true);
    });
  }
  sistemaPorte();
  Array.prototype.forEach.call(document.querySelectorAll('[data-apri-cancello]'), function (b) { b.addEventListener('click', function () { apriCancello(''); }); });
  /* un prezzo coperto, se lo tocchi, apre la finestra dei dati */
  document.addEventListener('click', function (e) {
    if (!body.classList.contains('senza-prezzi')) return;
    var pz = e.target.closest && e.target.closest('.canvas .prezzo'); if (pz) { e.preventDefault(); apriCancello(''); }
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-chiudi-cancello]'), function (b) { b.addEventListener('click', chiudiCancello); });
  if (cancello) cancello.addEventListener('click', function (e) { if (e.target === cancello) chiudiCancello(); });

  /* pagina confezioni: tutto a vista; i prezzi, il conto e la scheda PDF dopo i dati */
  function scopri() {
    body.classList.remove('senza-prezzi');
    var av = $('avviso-prezzi'); if (av) av.hidden = true;
    preparaConto();
  }
  if (pagina === 'confezioni') {
    if (giaAperto()) { ricorda(); scopri(); }
    else body.classList.add('senza-prezzi');
  }

  /* --- il modulo del cancello --- */
  var f = $('modulo'), esito = $('esito'), invia = $('invia');
  if (f) {
    $('f-origine').value = origine;
    var reMail = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;
    var emailObbl = !(per && C.EMAIL_FACOLTATIVA_CON_LINK);
    if (!emailObbl) { var le = document.querySelector('label[for=f-email] .obb'); if (le) le.textContent = '(facoltativa: ce l’hai già data)'; $('f-email').required = false; }
    function campo(id) { return $(id).closest('.campo'); }
    function segna(id, ok) { var c = campo(id); if (c) c.classList.toggle('campo-err', !ok); $(id).setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; }
    function dati() {
      var r = f.querySelector('input[name=quantita]:checked');
      return {
        nome: $('f-nome').value.trim(), azienda: $('f-azienda').value.trim(), email: $('f-email').value.trim(),
        telefono: $('f-tel').value.trim(), quantita: r ? r.value : '', messaggio: ($('f-msg') ? $('f-msg').value : '').trim().slice(0, 1000),
        privacy: $('f-privacy').checked, aggiornamenti: $('f-agg').checked, origine: origine, per: per,
        porta: destinazione || '', sito: $('f-sito').value, pagina: location.pathname, ua: (navigator.userAgent || '').slice(0, 300), t: Date.now() - t0
      };
    }
    function valida(d) {
      var ok = true, primo = null;
      [['f-nome', !!d.nome], ['f-azienda', !!d.azienda], ['f-email', emailObbl ? reMail.test(d.email) : (!d.email || reMail.test(d.email))], ['f-privacy', d.privacy]].forEach(function (x) {
        if (!segna(x[0], x[1])) { ok = false; if (!primo) primo = x[0]; }
      });
      if (primo) $(primo).focus();
      return ok;
    }
    ['f-nome', 'f-azienda', 'f-email', 'f-privacy'].forEach(function (id) {
      $(id).addEventListener(id === 'f-privacy' ? 'change' : 'blur', function () {
        if (!campo(id).classList.contains('campo-err')) return;
        var d = dati(); segna(id, id === 'f-email' ? (emailObbl ? reMail.test(d.email) : (!d.email || reMail.test(d.email))) : id === 'f-privacy' ? d.privacy : !!$(id).value.trim());
      });
    });
    function mostra(testo) { esito.textContent = ''; var p = document.createElement('p'); p.textContent = testo; esito.appendChild(p); }
    function attesa(on) { invia.disabled = on; invia.textContent = on ? 'Un momento…' : 'Vedi i prezzi'; }
    function dopo() {
      ricorda(); chiudiCancello(); scopri(); sistemaPorte();
      mostra('Fatto: prezzi, conto e scheda sono aperti.');
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = dati();
      if (!valida(d)) { mostra('Mancano dei dati: li trovi segnati sopra.'); return; }
      if (d.sito) { dopo(); return; }   // esca: un programma, non una persona
      if (!C.ENDPOINT) { dopo(); return; }   // modulo di Gio non ancora attivo: la porta si apre lo stesso; i dati non vengono registrati (niente posta che si apre da sola: Gio, 09/10/2026)
      attesa(true);
      var corpo = JSON.stringify(d);
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      fetch(C.ENDPOINT, { method: 'POST', body: corpo, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { return r.json(); })
        .then(function () { clearTimeout(timer); attesa(false); dopo(); })
        .catch(function () {
          fetch(C.ENDPOINT, { method: 'POST', body: corpo, mode: 'no-cors' })
            .then(function () { clearTimeout(timer); attesa(false); dopo(); })
            .catch(function () { clearTimeout(timer); attesa(false); dopo(); });
        });
    });
  }
})();
