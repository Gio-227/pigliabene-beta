/* Porta di Natale 2026 — configurazione. Si cambia QUI, non nella pagina.
   Dopo una modifica: commit + push; GitHub Pages può servire la versione vecchia per qualche minuto.
   Date in formato AAAA-MM-GG. Un campo vuoto = in pagina compare il segnaposto fra [quadre]. */
window.PB_NATALE = {
  // URL dell'App web di Apps Script (finisce con /exec). Vuoto = il modulo apre una mail già scritta.
  ENDPOINT: "",

  // Il catalogo resta sul beta, noindex, e non si indovina.
  CATALOGO_URL: "https://gio-227.github.io/pigliabene-beta/catalogo/",

  EMAIL: "bottegapigliabene@gmail.com",
  WHATSAPP: "3905751694910",

  // Condizioni decise da Gio (05/10/2026, 01:45): scaglioni di quantità fino al 30/10,
  // −7 % pagamento anticipato fino al 15/11, poi niente sconti.
  SCAGLIONI_FINO: "2026-10-30",
  ANTICIPATO_FINO: "2026-11-15",

  // Da decidere (Gio): ultimo giorno per ordinare, consegna, validità dei prezzi della scheda PDF.
  CHIUSURA_ORDINI: "",
  CONSEGNA: "",
  PREZZI_VALIDI_FINO: ""
};
