// NL | EN for the page text. English is the default; a visitor's choice is
// remembered in this browser. All strings here are ours and static, so the
// few with markup can be set as HTML.
const I18N = {
  en: {
    title: "ReplyDesk — AI draft replies for customer service",
    demo: "DEMO", fictional: "(fictional)",
    h1: "From customer message<br><em>to a draft you can send.</em>",
    intro: "Paste an email, pick a case type if you like, and ReplyDesk drafts a reply that sticks to the company's policies. It tells you why it wrote it that way and what you still need to check. You stay in control: edit, then copy.",
    incoming: "01 / INCOMING",
    messageLabel: "Customer message",
    messagePlaceholder: "Paste the customer's email here…",
    caseTypeLabel: "Case type", detect: "Detect automatically",
    replyIn: "Reply in", sameAsMessage: "Same as the message", english: "English", dutch: "Dutch",
    instructionLabel: "Direction for this reply <small>(optional)</small>",
    instructionPlaceholder: "e.g. confirm the cancellation per 1 October",
    draftButton: "Draft reply →", drafting: "Drafting…",
    limit: "Demo limit: 10 drafts per hour. Don't paste real customer data.",
    draftHead: "02 / DRAFT", empty: "The draft appears here.",
    subject: "Subject", replyLabel: "Reply <small>(edit freely)</small>",
    copy: "Copy reply", copied: "Copied.",
    why: "Why this draft", check: "Check before sending", nothing: "Nothing",
    footer: 'Built by <a href="https://fizzl.eu/">Frits · fizzl.eu</a> with Claude. Northwind Daily and its policies are made up for this demo.',
    source: "Source on GitHub ↗",
    unexpected: "Unexpected answer from the server.", failed: "Something went wrong.",
    offline: "Could not reach ReplyDesk. Check your connection.",
    triageBy: "Sorted by Jev", priority: "Priority",
    urgentT: "urgent", angryT: "angry", humanT: "asks for a person", leaveT: "may leave", injectT: "tries to instruct the AI",
    calmT: "calm", annoyedT: "annoyed", notUrgentT: "not urgent", soonT: "soon",
  },
  nl: {
    title: "ReplyDesk — AI-conceptantwoorden voor klantenservice",
    demo: "DEMO", fictional: "(verzonnen)",
    h1: "Van klantbericht<br><em>naar een concept dat je kunt versturen.</em>",
    intro: "Plak een e-mail, kies eventueel een soort vraag, en ReplyDesk schrijft een conceptantwoord dat zich aan het beleid van het bedrijf houdt. Je ziet waarom het zo geschreven is en wat je nog moet controleren. Jij houdt de regie: aanpassen en kopiëren.",
    incoming: "01 / BINNENGEKOMEN",
    messageLabel: "Bericht van de klant",
    messagePlaceholder: "Plak hier de e-mail van de klant…",
    caseTypeLabel: "Soort vraag", detect: "Automatisch herkennen",
    replyIn: "Antwoord in", sameAsMessage: "Zelfde taal als het bericht", english: "Engels", dutch: "Nederlands",
    instructionLabel: "Richting voor dit antwoord <small>(optioneel)</small>",
    instructionPlaceholder: "bijv. bevestig de opzegging per 1 oktober",
    draftButton: "Maak concept →", drafting: "Bezig…",
    limit: "Demolimiet: 10 concepten per uur. Plak geen echte klantgegevens.",
    draftHead: "02 / CONCEPT", empty: "Het concept verschijnt hier.",
    subject: "Onderwerp", replyLabel: "Antwoord <small>(pas gerust aan)</small>",
    copy: "Kopieer antwoord", copied: "Gekopieerd.",
    why: "Waarom dit concept", check: "Controleer voor verzenden", nothing: "Niets",
    footer: 'Gebouwd door <a href="https://fizzl.eu/">Frits · fizzl.eu</a> met Claude. Northwind Daily en het beleid zijn verzonnen voor deze demo.',
    source: "Broncode op GitHub ↗",
    unexpected: "Onverwacht antwoord van de server.", failed: "Er ging iets mis.",
    offline: "ReplyDesk is niet bereikbaar. Controleer je verbinding.",
    triageBy: "Gesorteerd door Jev", priority: "Voorrang",
    urgentT: "dringend", angryT: "boos", humanT: "wil een mens spreken", leaveT: "dreigt op te zeggen", injectT: "probeert de AI te sturen",
    calmT: "rustig", annoyedT: "geïrriteerd", notUrgentT: "niet dringend", soonT: "binnenkort",
  },
};

let lang = "en";
try { if (localStorage.getItem("lang") === "nl") lang = "nl"; } catch {}

function t(key) {
  return I18N[lang][key] ?? I18N.en[key] ?? key;
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll(".lang-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  document.dispatchEvent(new Event("langchange"));
}

document.querySelectorAll(".lang-switch button").forEach((b) => b.addEventListener("click", () => {
  lang = b.dataset.lang;
  try { localStorage.setItem("lang", lang); } catch {}
  applyLang();
}));
