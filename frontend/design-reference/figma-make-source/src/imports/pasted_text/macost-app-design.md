Build a functional web app called "Macost" — a Pocket Management Information System
that helps Indonesian college students manage their fixed monthly allowance and
side income (freelance/part-time earnings) through goal-based saving with
AI-powered smart allocation suggestions. This is a MOBILE-FIRST web app —
optimize layouts for mobile viewport widths (360–430px), portrait orientation,
with a bottom navigation bar (not a sidebar). This will run in a browser
(no native app needed), but should look and feel like a mobile app.

DESIGN SYSTEM (apply consistently across every screen):

Colors:
- Primary Orange: #FF8929
- Primary Blue: #298DFF
- Primary White: #FCFCFC
- Primary Black: #1E1E1E
- Secondary Dark Blue: #072548
- Gradient "Orange Primary": #FF8929 to #FCFCFC (use for motivational/goal elements)
- Gradient "Blue Primary": #298DFF to #FCFCFC (use for interactive/primary actions)
- Gradient "Black": #1E1E1E to #3E3E3E (use for dark UI elements)

Typography: choose fonts that fit the color palette and mobile app aesthetic
described below — clean and highly legible for financial numbers and forms,
with a slightly warmer/friendlier option for section headlines and
motivational copy (goal progress messages, onboarding text). Use your
judgment on pairing, just keep it consistent across all screens.

Design principle — dual identity: Functional areas (forms, dashboard, tables) must
be clean, modern, generous white space, high contrast (WCAG 2.1 AA) — financial
numbers must always be clearly legible, Primary Black text on White background,
Blue as the primary accent color for buttons and interactive elements. Goal/progress
visualization areas can be warmer and more expressive using the Orange gradients.

BUILD THESE 4 CONNECTED SCREENS with a working bottom navigation bar
(Home, Dashboard, Goals, AI Assistant, Profile — 5 nav items, only build the
first 3 destinations fully for now):

SCREEN 1 — Home (default landing page, main entry point):
- Bottom navigation bar (Home, Dashboard, Goals, AI Assistant, Profile) fixed
  at the bottom of the screen
- A prominent "+ Add Transaction" button as the primary call-to-action, top of
  the content area
- Below it, a clickable card row with 3 options when the Add Transaction button
  is clicked (make this a modal/dialog): "Manual Input", "Scan Receipt",
  "Upload Bank Statement" — each a card with icon + short description
- A "Manual Input" form (opens when that option is picked) with fields: Amount
  (large numeric input, primary focus of the form), Type toggle (Income/Expense),
  Category dropdown (options: Food & Drink, Transportation, Entertainment,
  Shopping, Bills, Education — for expense; Allowance, Freelance Income,
  Part-time Job — for income), Date (defaults to today), optional Note field.
  If "Income" type is selected, show an additional dropdown: "Allowance" or
  "Side Income". Make the Save button functionally add a row to a transaction
  list state (use mock/local state, no real backend needed).
- A balance summary card near the top showing a total balance figure (use
  placeholder Indonesian Rupiah amount like "Rp 1.900.000")
- A horizontal card section showing 2 example savings goals with progress bars
  (e.g. "Beli Laptop — 40% complete, Rp 3.200.000 of Rp 8.000.000" and
  "Dana Darurat — 65% complete")

SCREEN 2 — Dashboard:
- Same bottom navigation bar, Dashboard highlighted as active
- Display these sections in this EXACT priority order (this order is based on
  real user research, not a design choice — please keep this order):
  1. Expense breakdown by category — as a horizontal bar chart or donut chart,
     with category icons, using mock data (Food 35%, Transport 17%,
     Entertainment 16%, Education 12%, Housing 20%)
  2. Active goals progress — 2 goal cards with progress bars, same goals as
     Screen 1
  3. Monthly trend — simple line or bar chart comparing income vs expense over
     the last 3 months, mock data
  4. An overspending alert banner (dismissible), example text: "Entertainment
     spending this month is 16% of total — higher than your 3-month average"
  5. Total balance — smallest visual element, place near the bottom, NOT at
     the top (this is intentional based on research)
- Include a period filter dropdown near the top: "This Month / Last Month /
  Custom"

SCREEN 3 — Goals:
- Same bottom navigation bar, Goals highlighted as active
- A list of goal cards, each showing: goal name, progress bar (amount
  collected vs target in Rupiah), a small rank badge (e.g. "#1 Priority"),
  and percentage complete. Include 3 example goals: "Beli Laptop" (40%,
  rank 1), "Dana Darurat" (65%, rank 2), "Liburan ke Bali" (13%, rank 3)
- A "+ New Goal" button that opens a form: Goal name, Target amount (Rupiah),
  Deadline (date picker), a "How important is this to you?" slider (1-5)
- Above the form, show 4 clickable quick-start template cards: "Emergency
  Fund", "Vacation", "Health", "Laptop/Gadget" — clicking one pre-fills the
  form fields with reasonable defaults

SCREEN 4 — Smart Allocation Suggestion (build as a MODAL/dialog that can be
triggered by a button on Screen 1, not a separate page):
- Centered card over a dimmed background
- Friendly, warm, non-pushy tone: "Your side income of Rp 500.000 just came
  in! We suggest allocating Rp 175.000 (35%) to your 'Beli Laptop' goal —
  it's your top priority right now."
- Show the target goal's current progress bar for context inside the modal
- 3 clear actions: "Confirm" (primary blue button), "Change Amount"
  (secondary button, opens a simple number input), "Not Now" (plain text
  link, must look equally respectable — NOT punished visually for choosing it)
- Make Confirm functionally update the goal's progress in local state

FUNCTIONALITY REQUIREMENTS:
- Make the transaction form, goal creation form, and allocation modal
  functionally interactive using local/mock state — not just static visuals.
  I want to be able to click through and see the app respond (e.g. adding a
  transaction updates the balance shown, confirming an allocation updates
  the goal's progress bar).
- All monetary values should be formatted as Indonesian Rupiah (Rp X.XXX.XXX)
- This is for a live product demo tomorrow — prioritize getting the full
  click-through flow working end-to-end over pixel-perfect visual polish.

Please build all 4 screens together as one connected flow so the navigation
between them works, then show me the result.