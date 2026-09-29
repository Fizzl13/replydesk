// Northwind Daily is a made-up news subscription. Every name, price, policy and
// template here is fictional: ReplyDesk is a public demo, so it never carries a
// real company's internal material.

export const COMPANY = {
  name: "Northwind Daily",
  kind: "a daily news subscription (print and digital)",
  signOff: { en: "Kind regards,\nThe Northwind Daily customer team", nl: "Met vriendelijke groet,\nHet klantenteam van Northwind Daily" },
  selfService: "northwind.example/account",
};

// The rules the drafts must follow. Short, checkable, and the same for every case.
export const POLICIES = [
  "Cancellations take effect at the end of the current billing period; there is no cancellation fee.",
  "A missed or damaged print delivery is credited as one free day, at most 5 per month; a second miss in a week is escalated to the delivery partner.",
  "Refunds for overpayment are made within 10 working days to the original payment method.",
  "Price changes are announced at least 30 days ahead; a customer may cancel before the new price applies.",
  "Address changes take 3 working days for print delivery; digital access is not affected.",
  "Account and login problems: a password reset link is sent to the email on file; never ask for a password.",
  "Never promise anything these policies don't cover (no extra compensation, no exceptions); leave that to the agent.",
];

export const CASE_TYPES = [
  { id: "cancellation", label: { en: "Cancellation", nl: "Opzegging" } },
  { id: "delivery", label: { en: "Delivery complaint", nl: "Bezorgklacht" } },
  { id: "billing", label: { en: "Billing or payment", nl: "Factuur of betaling" } },
  { id: "price_change", label: { en: "Price change", nl: "Prijswijziging" } },
  { id: "address", label: { en: "Address change", nl: "Adreswijziging" } },
  { id: "login", label: { en: "Login or digital access", nl: "Inloggen of digitale toegang" } },
  { id: "other", label: { en: "Other", nl: "Overig" } },
];

// One starting point per case type. The model adapts it to the message; the
// agent always reviews the draft before sending.
export const TEMPLATES = {
  cancellation: "Thank the customer, confirm the cancellation and the exact end date (end of the current billing period), mention that no fee applies, and leave the door open to return.",
  delivery: "Apologise for the missed or damaged paper, confirm the credit of one free day, and say what happens if it happens again this week.",
  billing: "Explain the charge in plain words; if they overpaid, confirm the refund and the 10-working-day timeline.",
  price_change: "Acknowledge the concern, explain the new price and when it applies, and mention they may cancel before it takes effect.",
  address: "Confirm the new address and the date print delivery switches (3 working days); digital access continues as normal.",
  login: "Explain how to reset the password via the link sent to the email on file, and where to get more help; never ask for their password.",
  other: "Answer what you can from the policies and say clearly what the team will check.",
};

// Demo messages for the page, one per common case.
export const SAMPLES = [
  { id: "late-paper", language: "en", text: "Hi, for the third time this week my paper didn't arrive. I pay for home delivery and I'm getting tired of this. Can you sort it out?" },
  { id: "opzeggen", language: "nl", text: "Goedemiddag, ik wil mijn abonnement opzeggen. We lezen het nieuws tegenwoordig vooral online. Per wanneer stopt het en moet ik nog iets betalen?" },
  { id: "double-charge", language: "en", text: "Hello, I was charged twice for September according to my bank statement. Please refund the second payment." },
  { id: "inloggen", language: "nl", text: "Ik kan niet meer inloggen in de app. Ik heb mijn wachtwoord al drie keer geprobeerd. Wat nu?" },
];
