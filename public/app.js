const $ = (id) => document.getElementById(id);
let config = { caseTypes: [], samples: [] };

function list(el, items) {
  el.replaceChildren(...(items.length ? items : ["Nothing"]).map((t) => Object.assign(document.createElement("li"), { textContent: t })));
}

function show(state, message) {
  $("empty").hidden = state !== "empty";
  $("error").hidden = state !== "error";
  $("result").hidden = state !== "result";
  if (state === "error") $("error").textContent = message;
}

async function load() {
  config = await (await fetch("/api/config")).json();
  $("company").textContent = config.company;
  for (const c of config.caseTypes) $("caseType").append(new Option(c.label.en, c.id));
  for (const s of config.samples) {
    const b = Object.assign(document.createElement("button"), { type: "button", textContent: `${s.language.toUpperCase()} · ${s.id.replace("-", " ")}` });
    b.addEventListener("click", () => { $("message").value = s.text; $("message").focus(); });
    $("samples").append(b);
  }
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const go = $("go");
  go.disabled = true;
  go.textContent = "Drafting…";
  try {
    const res = await fetch("/api/draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: $("message").value, caseType: $("caseType").value, language: $("language").value, instruction: $("instruction").value }),
    });
    const data = await res.json().catch(() => ({ error: "Unexpected answer from the server." }));
    if (!res.ok) return show("error", data.error || "Something went wrong.");
    const label = config.caseTypes.find((c) => c.id === data.case_type)?.label.en ?? data.case_type;
    $("case").textContent = `${label} · ${data.language.toUpperCase()}`;
    $("subject").value = data.subject;
    $("draft").value = data.draft;
    list($("notes"), data.notes);
    list($("checks"), data.check_before_sending);
    show("result");
  } catch {
    show("error", "Could not reach ReplyDesk. Check your connection.");
  } finally {
    go.disabled = false;
    go.textContent = "Draft reply →";
  }
});

$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(`${$("subject").value}\n\n${$("draft").value}`);
  $("copied").hidden = false;
  setTimeout(() => ($("copied").hidden = true), 1500);
});

load();
