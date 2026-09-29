# ReplyDesk

AI draft replies for customer service, with the human in control. Paste a customer's email, optionally pick a case type and a direction, and ReplyDesk drafts a reply that sticks to the company's policies. It also says why it wrote the draft that way and what you still need to check before sending. You edit, then copy: nothing is sent automatically.

The demo uses **Northwind Daily**, a made-up news subscription. Its policies, case types and templates live in [`src/company.js`](src/company.js). Swap them for your own and it works the same way.

## How it works

- **Server-side prompt.** The system prompt (company, policies, templates) lives on the server. The browser only sends the customer's message, the language, an optional case type and a short direction, so the demo can't be used as a general-purpose Claude endpoint.
- **Structured output.** Claude returns JSON against a schema: the case type, language, subject, draft, the reasons behind it, and what to check before sending.
- **Model.** Claude Opus 5.5 at low effort, with the system prompt cached and Anthropic's server-side fallback (`fallbacks: "default"`) for the rare declined request. `ANTHROPIC_MODEL` overrides the model.
- **Guard rails.**
  - The customer's message is treated as data, not instructions.
  - Drafts may only promise what the policies cover. Missing facts become `[placeholders]`.
  - Input is capped at 4,000 characters.
  - Each visitor gets 10 drafts per hour, with a daily cap for the whole demo.

## Run it

```bash
npm install
ANTHROPIC_API_KEY=... npm start   # http://localhost:3000
npm test                          # no network, no API key needed
```

Deploy: `render.yaml` sets up a Render web service. Set `ANTHROPIC_API_KEY` in the Render dashboard.

Built by [Frits](https://fizzl.eu) with Claude.
