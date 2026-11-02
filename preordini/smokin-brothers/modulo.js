const CFG={"ENDPOINT": "https://script.google.com/macros/s/AKfycbyXlQ6RCpILBDyApKfZARBrLNJsQgZl7132ltkYDYwmTvpo7jPrmof4ArRm2eQ1Yqwf/exec", "CHIUSURA": "2026-11-08T22:00:00+01:00", "CHIUSURA_TXT": "domenica 8 novembre, ore 22:00", "IBAN": "IT31 C030 6971 6171 0000 0005 899", "INTESTATARIO": "Feel Good S.r.l.", "RITIRO_DAL": "martedì 15 dicembre", "WA": "3905751694910", "CAMPAGNA": "smokin-2026", "PREFISSO": "PB-SMK-", "USCITA": "../"};
/* Cowork v1.0 | Feel Good srl | preordini/smokin-brothers/modulo.js — il modulo del preordine (quantità, dati, invio al foglio o WhatsApp, QR SEPA) | v1.3 | 2026-11-02 09:52 CET | generato da genera-sito.py da web.js */
const Q = {};
const $ = (s) => document.querySelector(s);
/* sul beta (github.io) la pagina registra nel foglio solo con ?prova nel link: altrimenti WhatsApp, così le prove non diventano ordini veri */
if (/github\.io$/.test(location.hostname) && !/[?&]prova/.test(location.search)) CFG.ENDPOINT = '';
const eur = (x) => x.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chiusura = new Date(CFG.CHIUSURA);
let chiuso = false;
let RIC = null, ANCORA = '#ricordo';   /* l'ultimo preordine salvato su questo dispositivo e dove porta il suo link nella barra in alto */

function righeScelte() {
  const out = [];
  document.querySelectorAll('.riga').forEach((r) => {
    const q = Q[r.dataset.id] || 0;
    if (q) out.push({ id: r.dataset.id, nome: r.dataset.nome, qta: q, pre: +r.dataset.pre, bott: +r.dataset.bott });
  });
  return out;
}

function agg() {
  let t = 0, tb = 0;
  document.querySelectorAll('.riga').forEach((r) => { r.querySelector('output').value = Q[r.dataset.id] || 0; });
  const righe = righeScelte();
  righe.forEach((x) => { t += x.qta * x.pre; tb += x.qta * x.bott; });
  $('#tot').textContent = eur(t);
  $('#risp').textContent = t ? 'risparmi ' + eur(tb - t) + ' sul prezzo in bottega' : '';
  $('#vai').setAttribute('aria-disabled', t ? 'false' : 'true');
  $('#riep').innerHTML = righe.length
    ? '<b>Il tuo preordine</b><ul>' + righe.map((x) => `<li>${x.qta} × ${x.nome} — ${eur(x.qta * x.pre)}</li>`).join('') + `</ul><p style="margin:8px 0 0"><b>Totale ${eur(t)}</b> · risparmi ${eur(tb - t)}</p>`
    : '<span class="nota">Non hai ancora scelto niente: torna su e metti le quantità.</span>';
  $('#invia').disabled = !righe.length || chiuso;
}

function conto() {
  const ms = chiusura - new Date();
  const mio = RIC ? ` · <a href="${ANCORA}">il tuo preordine ${esc(RIC.codice)}</a>` : '';
  if (ms <= 0) {
    if (!chiuso) {   /* una volta sola: conto() gira ogni minuto */
      chiuso = true;
      document.querySelectorAll('.qta button').forEach((b) => { b.disabled = true; });
      $('#form').insertAdjacentHTML('beforebegin', '<div class="chiuso">I preordini sono chiusi. A bottega prendiamo solo pochi pezzi oltre i preordini: passa o scrivici su WhatsApp.</div>');
      $('#form').hidden = true;
    }
    $('#conto').innerHTML = `<span>Preordini chiusi ${esc(CFG.CHIUSURA_TXT)}. Scrivici: forse c’è ancora qualcosa.${mio}</span>`;
    return;
  }
  const g = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
  $('#conto').innerHTML = `<span>Preordini aperti fino a ${esc(CFG.CHIUSURA_TXT)} · ${g ? `${g} giorn${g === 1 ? 'o' : 'i'} e ${h} ore` : `${h} ore`}${mio}</span>`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-d]');
  if (!b || chiuso) return;
  const id = b.closest('.riga').dataset.id;
  Q[id] = Math.max(0, (Q[id] || 0) + +b.dataset.d);
  agg();
});
document.querySelectorAll('input[name=pag]').forEach((r) => r.addEventListener('change', agg));

/* ---------- IBAN e QR SEPA (EPC069-12) ---------- */
function ibanOk(s) {
  s = (s || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  const t = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => c.charCodeAt(0) - 55);
  let m = 0;
  for (let i = 0; i < t.length; i += 7) m = +(String(m) + t.substr(i, 7)) % 97;
  return m === 1;
}
function epcQr(nome, iban, importo, causale) {
  const dati = ['BCD', '002', '1', 'SCT', '', nome.slice(0, 70), iban.replace(/\s+/g, '').toUpperCase(), 'EUR' + importo.toFixed(2), '', '', causale.slice(0, 140), ''].join('\n');
  const q = qrcode(0, 'M');
  q.addData(dati);
  q.make();
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}
function copia(btn, testo) {
  const ok = () => { const t = btn.textContent; btn.textContent = 'Copiato'; setTimeout(() => { btn.textContent = t; }, 1500); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(testo).then(ok, () => fallback());
  else fallback();
  function fallback() {
    const ta = document.createElement('textarea'); ta.value = testo; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch (e) { /* niente */ }
    ta.remove();
  }
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-copia]');
  if (b) copia(b, b.dataset.copia);
});

/* ---------- invio ---------- */
function leggiForm() {
  const f = $('#form');
  return {
    nome: f.nome.value.trim(), tel: f.tel.value.trim(), email: f.email.value.trim(), note: f.note.value.trim(),
    pag: f.pag.value, cons: $('#cons').checked,
  };
}
function valida(d, righe) {
  if (!righe.length) return 'Scegli almeno un formato.';
  if (d.nome.length < 3) return 'Scrivi nome e cognome.';
  if (d.tel.replace(/\D/g, '').length < 8) return 'Scrivi un numero di telefono valido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return 'Scrivi un’email valida: lì ti arriva il riepilogo.';
  if (!d.cons) return 'Serve il consenso per gestire il preordine.';
  return '';
}
function codiceLocale() {
  const n = String(Date.now()).slice(-5);
  return CFG.PREFISSO + 'W' + n;
}
function testoWa(codice, d, righe, tot, intero) {
  const r = righe.map((x) => `${x.qta} × ${x.nome} (${eur(x.pre)})`).join('\n');
  const paga = d.pag === 'bonifico' ? 'bonifico' : 'in cassa';
  if (intero) return `Preordine Smokin’ Brothers ${codice}\n${r}\nTotale: ${eur(tot)}\nPagamento: ${paga}\nNome: ${d.nome}\nTelefono: ${d.tel}\nEmail: ${d.email}${d.note ? '\nNote: ' + d.note : ''}`;
  return `Ciao Piglia Bene, sono ${d.nome}: preordine ${codice} (${eur(tot)}, ${paga}). `;
}
/* testo con i dati per pagare, da mandarsi su WhatsApp (wa.me senza numero: il cliente sceglie la chat, anche quella con se stesso) */
function testoDati(codice, d, righe, tot, causale) {
  const r = righe.map((x) => `${x.qta} × ${x.nome}`).join(', ');
  const paga = d.pag === 'bonifico'
    ? `Bonifico a ${CFG.INTESTATARIO}\nIBAN ${CFG.IBAN || 'da confermare'}\nImporto ${eur(tot)}\nCausale: ${causale}`
    : `Da pagare in cassa a Piglia Bene (POS o contanti): ${eur(tot)}, codice ${codice}`;
  return `Preordine Piglia Bene ${codice} — ${d.nome}\n${r}\nTotale ${eur(tot)}\n${paga}\nEntro ${CFG.CHIUSURA_TXT}: senza pagamento il preordine decade. Ritiro in bottega dal ${CFG.RITIRO_DAL || 'giorno che ti scriviamo'}.`;
}

/* ---------- memoria locale: l'ultimo preordine fatto da questo dispositivo (per ritrovare i dati per pagare) ---------- */
const CHIAVE = 'pb-preordine-' + CFG.CAMPAGNA;
function salvaLocale(codice, d, righe, tot, fallback) {
  try { localStorage.setItem(CHIAVE, JSON.stringify({ codice, d, righe, tot, fallback, quando: Date.now() })); } catch (e) { /* niente: resta la mail */ }
}
function leggiLocale() {
  try {
    const s = JSON.parse(localStorage.getItem(CHIAVE) || 'null');
    if (!s || !s.codice || !s.d || !Array.isArray(s.righe) || Date.now() - s.quando > 50 * 864e5) return null;
    return s;
  } catch (e) { return null; }
}
function ricordo() {
  const s = RIC;
  const main = document.querySelector('main.pre > .wrap'), hero = document.querySelector('.hero');
  if (!s || !(main || hero)) return;
  const quando = new Date(s.quando).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  const dove = s.fallback
    ? 'Vale solo se ce l’hai mandato su WhatsApp e poi l’hai pagato.'
    : `I dati per pagare sono anche nella mail che ti abbiamo mandato a <b>${esc(s.d.email)}</b>.`;
  const html = `<div class="ricordo" id="ricordo"><p><b>Da questo dispositivo hai già fatto il preordine ${esc(s.codice)}</b> (${eur(+s.tot || 0)}, ${quando}). ${dove}</p><p class="azioni"><button type="button" class="btn sec" id="rivedi">Rivedi i dati per pagare</button></p></div>`;
  if (main) main.insertAdjacentHTML('afterbegin', html); else hero.insertAdjacentHTML('afterend', html);
  const porte = document.querySelector('.hero .porte');   /* sul sito: anche una porta nell'apertura, che sul telefono occupa tutto il primo schermo */
  if (porte) porte.insertAdjacentHTML('beforeend', `<a class="cta" href="#ricordo" id="porta-ricordo">Il tuo preordine ${esc(s.codice)}</a>`);
  $('#rivedi').addEventListener('click', () => { mostraEsito(s.codice, s.d, s.righe, +s.tot || 0, !!s.fallback, true); });
}

function mostraEsito(codice, d, righe, tot, fallback, ripreso) {
  const causale = `${codice} ${d.nome}`;
  const iban = CFG.IBAN || '';
  const rit = CFG.RITIRO_DAL || 'giorno che ti scriviamo (data da confermare)';
  const waMe = 'https://wa.me/?text=' + encodeURIComponent(testoDati(codice, d, righe, tot, causale));
  const mandati = `<p class="azioni mandati"><a class="btn sec" href="${waMe}" target="_blank" rel="noopener">Mandati i dati su WhatsApp</a><span class="nota">a te stesso, o a chi fa il bonifico per te</span></p>`;
  let paga = '';
  if (d.pag === 'bonifico') {
    const kv = [
      ['Intestatario', CFG.INTESTATARIO], ['IBAN', iban || 'da confermare — te lo mandiamo per email'],
      ['Importo', eur(tot)], ['Causale', causale],
    ].map(([k, v]) => `<b>${k}</b><code>${esc(v)}</code><button type="button" data-copia="${esc(k === 'Importo' ? tot.toFixed(2).replace('.', ',') : v)}">Copia</button>`).join('');
    const qr = ibanOk(iban) ? `<div class="qr">${epcQr(CFG.INTESTATARIO, iban, tot, causale)}<small>QR SEPA: alcune app di home banking lo leggono e compilano il bonifico da sole. Se la tua no, usa i tre «Copia».</small></div>` : '';
    paga = `<p><b>Fai il bonifico adesso</b>: il preordine vale quando arriva, entro ${CFG.CHIUSURA_TXT}. Se la tua banca non fa in tempo, mandaci la <b>contabile del bonifico</b> per email o su WhatsApp: vale come pagamento.</p><div class="pagabox"><div class="kv">${kv}</div>${qr}</div>${mandati}`;
  } else {
    paga = `<p><b>Passa in cassa da Piglia Bene entro ${CFG.CHIUSURA_TXT}</b> e di’ il codice <b>${codice}</b>: POS o contanti. Giorni e orari di apertura sono pochi — se non ce la fai, il bonifico va bene lo stesso: scrivici e ti mandiamo i dati.</p>${mandati}`;
  }
  const wa = `https://wa.me/${CFG.WA}?text=` + encodeURIComponent(testoWa(codice, d, righe, tot, fallback));
  const perche = CFG.ENDPOINT ? 'Non siamo riusciti a registrarlo da qui: con il tasto qui sotto ci arriva tutto, già scritto.' : 'Con il tasto qui sotto ci arriva tutto, già scritto.';
  const grazie = `<p class="grazie"><b>Hai fatto tutto: manca solo il pagamento.</b> L’ordine <b>${codice}</b> esiste, ma vale solo quando arriva il pagamento, entro ${CFG.CHIUSURA_TXT}: senza, decade da solo e non entra nell’ordine al produttore.</p>`;
  const testa = fallback
    ? `<h2>Preordine pronto: mandacelo su WhatsApp, poi paga</h2><p>${perche} Il tuo codice è <span class="cod">${codice}</span>: mettilo nella causale.</p><p><a class="btn" href="${wa}" target="_blank" rel="noopener">Manda il preordine su WhatsApp</a></p>${grazie}`
    : ripreso
      ? `<h2>Il tuo preordine: ecco i dati per pagare</h2><p>Il tuo codice è <span class="cod">${codice}</span>. Il riepilogo è anche nella mail che ti abbiamo mandato a <b>${esc(d.email)}</b>.</p>${grazie}`
      : `<h2>Preordine registrato: manca solo il pagamento</h2><p>Grazie! Il tuo codice è <span class="cod">${codice}</span>. Ti abbiamo mandato il riepilogo a <b>${esc(d.email)}</b>.</p>${grazie}`;
  const esci = CFG.USCITA ? `<a class="btn sec" href="${CFG.USCITA}">Esci</a>` : `<button type="button" class="btn sec" id="esci">Esci</button>`;
  const dove = fallback
    ? 'I dati per pagare restano nel messaggio WhatsApp che ci hai mandato, e li ritrovi riaprendo questa pagina da questo telefono o computer.'
    : `I dati per pagare li ritrovi nella mail che ti abbiamo mandato a <b>${esc(d.email)}</b> (guarda anche nello spam) e riaprendo questa pagina da questo telefono o computer. Se non trovi la mail, <a href="${wa}" target="_blank" rel="noopener">scrivici su WhatsApp</a> con il codice <b>${codice}</b>.`;
  $('#esito').innerHTML = `${testa}
<div class="riep"><b>Riepilogo</b><ul>${righe.map((x) => `<li>${x.qta} × ${x.nome} — ${eur(x.qta * x.pre)}</li>`).join('')}</ul><p style="margin:8px 0 0"><b>Totale ${eur(tot)}</b></p></div>
<div class="riep">${paga}</div>
<div class="riep sbagliato"><p><b>Hai sbagliato? Niente panico.</b></p><ul><li>Vuoi annullare un ordine non pagato: non fare nulla, decade da solo alla chiusura.</li><li>Vuoi aggiungere qualcosa: fai un nuovo preordine, con il suo codice e la sua causale.</li><li>Hai fatto un ordine sbagliato e non l’hai pagato: rifallo giusto e paga quello nuovo con la causale nuova; il vecchio decade.</li><li>Hai già pagato e vuoi togliere qualcosa: scrivici o passa al banco, ti lasciamo un buono di spesa da Piglia Bene per la differenza.</li></ul></div>
<div class="riep"><p><b>Ritiro</b> in bottega dal ${rit}. Ti avvisiamo per email quando il salmone è arrivato.</p><p class="grazie"><b>Grazie per il tuo ordine.</b> ${dove}</p><p class="azioni">${esci}</p></div>`;
  if (!ripreso) salvaLocale(codice, d, righe, tot, fallback);
  const r0 = $('#ricordo'); if (r0) r0.remove();
  const p0 = $('#porta-ricordo'); if (p0) { p0.href = '#esito'; p0.textContent = 'I dati per pagare'; }
  ANCORA = '#esito'; if (!RIC) RIC = { codice }; conto();
  const b = $('#esci'); if (b) b.addEventListener('click', () => location.reload());
  $('#esito').hidden = false;
  $('#form').hidden = true;
  $('#tot').textContent = eur(tot);
  $('#risp').textContent = 'preordine ' + codice;
  if (CFG.USCITA) { $('#vai').textContent = 'Esci'; $('#vai').href = CFG.USCITA; $('#vai').setAttribute('aria-disabled', 'false'); } else { $('#vai').style.display = 'none'; }
  document.querySelectorAll('.qta button').forEach((b) => { b.disabled = true; });
  $('#esito').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$('#form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = leggiForm(), righe = righeScelte();
  const tot = righe.reduce((s, x) => s + x.qta * x.pre, 0);
  const err = valida(d, righe);
  $('#err').textContent = err;
  if (err) return;
  const btn = $('#invia');
  btn.disabled = true; btn.textContent = 'Un momento…';
  const payload = { campagna: CFG.CAMPAGNA, nome: d.nome, tel: d.tel, email: d.email, note: d.note, pagamento: d.pag, consenso: true,
    righe: righe.map((x) => ({ id: x.id, nome: x.nome, qta: x.qta, prezzo: x.pre })), totale: +tot.toFixed(2), origine: location.href };
  let esito = null;
  if (CFG.ENDPOINT) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch(CFG.ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctl.signal });
      clearTimeout(t);
      esito = await r.json();
    } catch (ex) { esito = null; }
  }
  btn.disabled = false; btn.textContent = 'Conferma il preordine';
  if (esito && esito.ok && esito.codice) {
    if (esito.chiuso) { $('#err').textContent = 'I preordini sono chiusi.'; return; }
    mostraEsito(esito.codice, d, righe, +esito.totale || tot, false);
  } else if (esito && esito.chiuso) {
    $('#err').textContent = 'I preordini sono chiusi ' + CFG.CHIUSURA_TXT + '.';
  } else {
    mostraEsito(codiceLocale(), d, righe, tot, true);
  }
});

RIC = leggiLocale();
ricordo();
conto();
setInterval(conto, 60000);
agg();
