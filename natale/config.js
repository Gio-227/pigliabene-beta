/* Porta di Natale 2026 — configurazione. Si cambia QUI, non nelle pagine.
   Dopo una modifica: commit + push; GitHub Pages può servire la versione vecchia per qualche minuto.
   Date in formato AAAA-MM-GG. Un campo vuoto = in pagina compare il segnaposto fra [quadre]. */
window.PB_NATALE = {
  // URL dell'App web di Apps Script (finisce con /exec). Vuoto = il cancello si apre lo stesso, ma la richiesta
  // NON viene registrata da nessuna parte e nessuna mail parte (dal 09/10/2026 la pagina non apre più la posta da sola).
  ENDPOINT: "",

  // Il catalogo resta sul beta, noindex, e non si indovina.
  CATALOGO_URL: "https://gio-227.github.io/pigliabene-beta/catalogo/",
  // La porta 01, le confezioni pronte: pagina sorella della stanza.
  CONFEZIONI_URL: "confezioni/",

  // Con il link personale (/natale/Nome-Azienda) l'email è già nota a chi ha mandato il link:
  // true = nel cancello diventa facoltativa; false = resta obbligatoria (regola di Gio del 05/10/2026, in attesa di una sua parola).
  EMAIL_FACOLTATIVA_CON_LINK: false,

  EMAIL: "bottegapigliabene@gmail.com",
  WHATSAPP: "3905751694910",

  // Condizioni decise da Gio (05/10/2026, 01:45 e 14:04): scaglioni di quantità fino al 30/10
  // (contano solo le confezioni prese in almeno 25 pezzi uguali), −7 % pagamento anticipato
  // su tutto l'ordine fino al 15/11.
  SCAGLIONI_FINO: "2026-10-30",
  ANTICIPATO_FINO: "2026-11-15",

  // Gio (05/10/2026, 14:1x): il 15/11 chiudono le promozioni e gli ordini online, solo aziende;
  // dopo si ordina in bottega, secondo disponibilità. Al cliente: «chiusura promozioni il 15/11».
  CHIUSURA_ORDINI: "2026-11-15",
  PREZZI_VALIDI_FINO: "2026-11-15",

  // Consegna: non ancora decisa. Vuoto = la riga non compare (né sulla pagina né nella scheda PDF).
  CONSEGNA: ""
};
