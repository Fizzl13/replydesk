import { createApp } from "./src/app.js";
import { createDrafter } from "./src/drafter.js";
import { createTriage } from "./src/triage.js";

if (!process.env.ANTHROPIC_API_KEY) console.warn("ANTHROPIC_API_KEY is not set: drafts will fail.");

const port = Number(process.env.PORT) || 3000;
createApp({ draft: createDrafter(), triage: createTriage() }).listen(port, () => console.log(`ReplyDesk on http://localhost:${port}`));
