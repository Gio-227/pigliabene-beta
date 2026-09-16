(function(){
  'use strict';
  document.documentElement.classList.remove('nojs');
  var scena = document.getElementById('scena');
  var palco = document.getElementById('palco');
  var finestra = document.getElementById('finestra');
  var nastro = document.getElementById('nastro');
  var blocchi = [].slice.call(nastro.children);
  var piano = (window.CATALOGO || {});
  var menoMoto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- misura: quanto e' alto il nastro, e quanto deve scorrere la pagina */
  var mappa = [], altezzaNastro = 0, altezzaFinestra = 0;
  function misura(){
    altezzaFinestra = finestra.clientHeight;
    /* LA VIA DI MEZZO (Gio, 16/09 sera). Lo stacco era alto quanto la finestra
       per non far leggere due produttori insieme, ma lasciava troppo vuoto.
       Ora e' un terzo, e a separarli non e' il nulla: e' il cartiglio che
       annuncia chi arriva. Cosi' lo scorrimento resta libero, il passaggio si
       vede, e il vuoto scende da ~10 schermate a ~3 sui 21 produttori. */
    var stacco = Math.round(altezzaFinestra * 0.35);
    blocchi.forEach(function(b){ b.style.paddingBottom = stacco + 'px'; });
    altezzaNastro = nastro.scrollHeight;
    mappa = blocchi.filter(function(b){ return !b.hidden; }).map(function(b){
      return { id: b.dataset.p, cima: b.offsetTop,
               fine: b.offsetTop + b.offsetHeight - stacco,   /* dove finisce il TESTO */
               fondo: b.offsetTop + b.offsetHeight };
    });
    var corsa = Math.max(0, altezzaNastro - altezzaFinestra);
    /* la scena deve essere alta abbastanza da far arrivare in cima l'ultima
       riga: il palco resta appiccicato sotto la testata, quindi va contato
       anche quello, o la coda del catalogo non si vede mai */
    /* la barra in fondo non c'e' piu': i bottoni fluttuano e non rubano altezza */
    var utile = Math.max(palco.offsetHeight + parseFloat(getComputedStyle(palco).top || 0),
                         window.innerHeight);
    scena.style.height = (corsa + utile) + 'px';
    muovi();
  }

  /* ---- scorrimento: la pagina scorre, il nastro trasla, il telaio sta fermo */
  var attivo = null, ticchetta = false;
  function muovi(){
    /* La testata e' fissa e non occupa flusso: la scena parte da 0 e il palco
       e' gia' agganciato. Quindi l'avanzamento e' lo scroll puro: sottrarre
       anche l'aggancio decapitava la copertina di 39 px al primo sguardo.
       L'aggancio va contato in misura(), che e' un'altra cosa. */
    var avanzamento = Math.min(Math.max(-scena.getBoundingClientRect().top, 0),
                               Math.max(0, altezzaNastro - altezzaFinestra));
    nastro.style.transform = 'translateY(' + (-avanzamento) + 'px)';
    /* Il telaio cambia quando il CARTIGLIO del produttore che arriva ha
       superato il 42% della finestra, cioe' quando il suo nome e' bene in
       vista in alto. E' un segnale che si vede, non un calcolo di aree: con
       lo stacco corto due produttori restano un attimo in pagina insieme, e
       il cartiglio dice a chi appartiene quello che stai leggendo. */
    var mira = avanzamento + altezzaFinestra * 0.42;
    var id = mappa.length ? mappa[0].id : null;
    for (var i = 0; i < mappa.length; i++){
      if (mappa[i].cima <= mira) id = mappa[i].id; else break;
    }
    if (id && id !== attivo) cambia(id);
  }
  function suScroll(){
    if (ticchetta) return;
    ticchetta = true;
    requestAnimationFrame(function(){ ticchetta = false; muovi(); });
  }

  /* ---- il cambio: marchio, richiamo, foto e colori si sostituiscono */
  function cambia(id){
    attivo = id;
    var v = piano.produttori[id] || piano.produttori['copertina'];
    if (v){
      palco.style.setProperty('--fondo', v.fondo);
      palco.style.setProperty('--testo', v.testo);
      palco.style.setProperty('--fondo-foto', v.fondoFoto);
    }
    ['.marchio img', '.marchio .scritta', '.richiami a', '.pacchetto'].forEach(function(sel){
      [].forEach.call(palco.querySelectorAll(sel), function(el){
        el.classList.toggle('vivo', el.dataset.p === id);
      });
    });
    [].forEach.call(document.querySelectorAll('.lettere button'), function(b){
      b.classList.toggle('attiva', b.dataset.p === id);
    });
    avviaCarosello(id);
    if (history.replaceState) history.replaceState(null, '', id === 'copertina' ? location.pathname : '#' + id);
  }

  /* ---- le immagini di un produttore girano da sole */
  var tempo = null;
  function avviaCarosello(id){
    if (tempo) { clearInterval(tempo); tempo = null; }
    var pac = palco.querySelector('.pacchetto[data-p="' + id + '"]');
    if (!pac) return;
    var imgs = [].slice.call(pac.querySelectorAll('img'));
    if (!imgs.length) return;
    imgs.forEach(function(im, i){ im.classList.toggle('vivo', i === 0); });
    if (imgs.length < 2 || menoMoto) return;
    var k = 0;
    tempo = setInterval(function(){
      imgs[k].classList.remove('vivo');
      k = (k + 1) % imgs.length;
      imgs[k].classList.add('vivo');
    }, 3000);
  }
  palco.addEventListener('mouseenter', function(){ if (tempo){ clearInterval(tempo); tempo = null; } });
  palco.addEventListener('mouseleave', function(){ if (attivo) avviaCarosello(attivo); });

  /* ---- saltare a un produttore */
  function vaiA(id){
    var b = blocchi.filter(function(x){ return x.dataset.p === id && !x.hidden; })[0];
    if (!b) return;
    var y = scena.offsetTop + b.offsetTop;
    window.scrollTo({ top: y, behavior: menoMoto ? 'auto' : 'smooth' });
  }
  [].forEach.call(document.querySelectorAll('[data-vai]'), function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      chiudiPannello();
      vaiA(el.dataset.vai);
    });
  });

  /* ---- il pannello dei produttori */
  var bottProd = document.getElementById('btn-produttori');
  var pannelloProd = document.getElementById('pannello-produttori');
  function chiudiPannello(){
    pannelloProd.classList.remove('aperto');
    bottProd.setAttribute('aria-expanded', 'false');
  }
  bottProd.addEventListener('click', function(){
    var ap = pannelloProd.classList.toggle('aperto');
    bottProd.setAttribute('aria-expanded', ap ? 'true' : 'false');
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') chiudiPannello(); });

  /* ---- l'ordine dei produttori */
  var selOrdine = document.getElementById('ordine');
  function riordina(modo){
    var ordinati = blocchi.slice(1).sort(function(a, b){
      var A = piano.produttori[a.dataset.p], B = piano.produttori[b.dataset.p];
      if (modo === 'alfabetico') return A.chiave.localeCompare(B.chiave, 'it');
      if (modo === 'novita'){
        if (A.novita !== B.novita) return A.novita ? -1 : 1;
        return A.chiave.localeCompare(B.chiave, 'it');
      }
      if (A.catOrdine !== B.catOrdine) return A.catOrdine - B.catOrdine;
      return A.chiave.localeCompare(B.chiave, 'it');
    });
    ordinati.forEach(function(b){ nastro.appendChild(b); });
    blocchi = [].slice.call(nastro.children);
    /* anche la barra a lettere segue l'ordine, se no indica il posto sbagliato */
    var rail = document.querySelector('.lettere');
    ordinati.forEach(function(b){
      var bt = rail.querySelector('button[data-p="' + b.dataset.p + '"]');
      if (bt) rail.appendChild(bt);
    });
    misura();
  }
  if (selOrdine) selOrdine.addEventListener('change', function(){ riordina(selOrdine.value); });

  /* ---- il filtro a euro. La fascia sta sul PRODUTTORE, non sull'articolo
     (Gio, 16/09): il filtro quindi nasconde produttori interi, mai singole
     righe. Fascia 0 = nessuna referenza con costo in matrice: non si nasconde
     mai, perche' sparire da un filtro non e' la stessa cosa che non esserci. */
  var scelte = {};
  function applicaFiltro(){
    var attive = Object.keys(scelte).filter(function(k){ return scelte[k]; }).map(Number);
    blocchi.forEach(function(b){
      if (b.dataset.p === 'copertina'){ b.hidden = false; return; }
      var f = Number(b.dataset.f || 0);
      b.hidden = !(!attive.length || f === 0 || attive.indexOf(f) >= 0);
    });
    [].forEach.call(document.querySelectorAll('.lettere button'), function(bt){
      var b = blocchi.filter(function(x){ return x.dataset.p === bt.dataset.p; })[0];
      bt.disabled = !!(b && b.hidden);
    });
    [].forEach.call(document.querySelectorAll('.card'), function(c){
      var b = blocchi.filter(function(x){ return x.dataset.p === c.dataset.vai; })[0];
      c.hidden = !!(b && b.hidden);
    });
    misura();
    /* se il produttore che si stava guardando e' sparito, si riparte da capo */
    var vivo = blocchi.filter(function(x){ return x.dataset.p === attivo && !x.hidden; })[0];
    if (!vivo) window.scrollTo({ top: 0, behavior: 'auto' });
  }
  [].forEach.call(document.querySelectorAll('.fasce button[data-fascia]'), function(bt){
    bt.addEventListener('click', function(){
      var f = bt.dataset.fascia;
      scelte[f] = !scelte[f];
      bt.setAttribute('aria-pressed', scelte[f] ? 'true' : 'false');
      applicaFiltro();
    });
  });
  var azzera = document.querySelector('.fasce .azzera');
  if (azzera) azzera.addEventListener('click', function(){
    scelte = {};
    [].forEach.call(document.querySelectorAll('.fasce button[data-fascia]'), function(bt){
      bt.setAttribute('aria-pressed', 'false');
    });
    applicaFiltro();
  });

  window.addEventListener('scroll', suScroll, { passive: true });
  window.addEventListener('resize', misura);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(misura);
  [].forEach.call(document.images, function(im){
    if (!im.complete) im.addEventListener('load', misura, { once: true });
  });
  misura();
  cambia('copertina');
  if (location.hash) setTimeout(function(){ vaiA(location.hash.slice(1)); }, 60);
})();