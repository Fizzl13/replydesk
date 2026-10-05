const $ = (id) => document.getElementById(id);
let config = { caseTypes: [], samples: [] };
let lastCase = null;

function list(el, items) {
  el.replaceChildren(...(items.length ? items : [t("nothing")]).map((text) => Object.assign(document.createElement("li"), { textContent: text })));
}

function show(state, message) {
  $("empty").hidden = state !== "empty";
  $("error").hidden = state !== "error";
  $("result").hidden = state !== "result";
  if (state === "error") $("error").textContent = message;
}

const caseLabel = (id) => config.caseTypes.find((c) => c.id === id)?.label[lang] ?? id;

// Case types and sample buttons follow the page language.
function renderOptions() {
  const select = $("caseType");
  const chosen = select.value;
  select.querySelectorAll("option:not([value=''])").forEach((o) => o.remove());
  for (const c of config.caseTypes) select.append(new Option(c.label[lang], c.id));
  select.value = chosen;
  $("samples").replaceChildren(...config.samples.map((s) => {
    const b = Object.assign(document.createElement("button"), { type: "button", textContent: `${s.language.toUpperCase()} · ${s.id.replace("-", " ")}` });
    b.addEventListener("click", () => { $("message").value = s.text; $("message").focus(); });
    return b;
  }));
  if (lastCase) $("case").textContent = `${caseLabel(lastCase.type)} · ${lastCase.language.toUpperCase()}`;
  if (!$("go").disabled) $("go").textContent = t("draftButton");
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const go = $("go");
  go.disabled = true;
  go.textContent = t("drafting");
  try {
    const res = await fetch("/api/draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: $("message").value, caseType: $("caseType").value, language: $("language").value, instruction: $("instruction").value }),
    });
    const data = await res.json().catch(() => ({ error: t("unexpected") }));
    if (!res.ok) return show("error", data.error || t("failed"));
    lastCase = { type: data.case_type, language: data.language };
    $("case").textContent = `${caseLabel(data.case_type)} · ${data.language.toUpperCase()}`;
    $("subject").value = data.subject;
    $("draft").value = data.draft;
    list($("notes"), data.notes);
    list($("checks"), data.check_before_sending);
    renderTriage(data.triage);
    show("result");
  } catch {
    show("error", t("offline"));
  } finally {
    go.disabled = false;
    go.textContent = t("draftButton");
  }
});

// Jev's sorting (case type, urgency, mood, flags), shown above the draft when the server has it.
function renderTriage(tr) {
  const el = $("triage");
  lastTriage = tr || null;
  if (!tr) { el.hidden = true; el.textContent = ""; return; }
  const level = (v, words) => (v === null ? null : words[Math.min(words.length - 1, Math.round(v))]);
  const flags = { urgent: "urgentT", angry: "angryT", "asks for a person": "humanT", "may leave": "leaveT", "tries to instruct the AI": "injectT" };
  const parts = [
    tr.caseType && `${caseLabel(tr.caseType)}${tr.caseConfidence !== null ? ` ${Math.round(tr.caseConfidence * 100)}%` : ""}`,
    !tr.reasons.includes("urgent") && level(tr.urgency, [t("notUrgentT"), t("soonT"), t("urgentT")]),
    !tr.reasons.includes("angry") && level(tr.frustration, [t("calmT"), t("annoyedT"), t("angryT")]),
    ...tr.reasons.map((r) => t(flags[r] ?? r)),
  ].filter(Boolean);
  el.replaceChildren();
  const head = document.createElement("strong");
  head.textContent = tr.priority ? `${t("priority")} · ` : `${t("triageBy")}: `;
  el.append(head, document.createTextNode(parts.join(" · ")));
  el.classList.toggle("hot", tr.priority);
  el.hidden = false;
}
let lastTriage = null;
document.addEventListener("langchange", () => renderTriage(lastTriage));

$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(`${$("subject").value}\n\n${$("draft").value}`);
  $("copied").hidden = false;
  setTimeout(() => ($("copied").hidden = true), 1500);
});

document.addEventListener("langchange", renderOptions);
applyLang();

(async () => {
  config = await (await fetch("/api/config")).json();
  $("company").textContent = config.company;
  renderOptions();
})();
