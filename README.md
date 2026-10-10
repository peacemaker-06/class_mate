# ClassMate Plus — Classroom Studio

An expanded hackathon copy. The original ClassMate site is unchanged.

## Run the demo

Open the hosted site and choose **Explore as a teacher** or **Explore as a student**.
Demo changes stay in this browser. The role selector switches between fictional profiles.

- Teacher: PRIYA01; second teacher: RAVI02
- Students: STU001 (Aarav), STU002 (Diya), STU003 (Meera), STU004 (Rohan)
- Class 12A: student invite CLASS-12A; teacher invite STAFF-12A
- Class 12B: student invite CLASS-12B; teacher invite STAFF-12B
- These are simulation IDs, not passwords. Anyone using the same browser demo can switch roles.
- Add members in Members, or create a demo profile from the landing page.

## Two-minute judging flow

1. Teacher → Homework → assign a short task with a future deadline.
2. Email center → inspect assignment notification previews.
3. Demo lab → simulate an overdue task → inspect guardian previews.
4. Seating → choose Aarav and an empty seat → confirm. Open Email center.
5. Switch to Aarav → see the seat reminder; open Marksheet and its study plan.
6. Assistant → ask “What homework is due?” and “Help me improve my marks”.
7. Student → On-duty requests → submit; switch to teacher → approve and inspect attendance.
8. Contributions → student submits completed duty → teacher awards separate credits.

## Real classroom identities

The hosted platform provides secure ChatGPT sign-in. It does not implement a separate password database.
On first use, the owner creates the school workspace while the site remains owner-private.
Teachers and students use distinct invitation codes to create profiles linked to their verified account email.
Manually added members claim their profile with the same email and correct invitation code.
The real workspace starts empty; sample students exist only in the browser demo.
The site is currently private: other people cannot access it until its hosting audience is explicitly shared.

Server permissions filter classes, marks, contact information, staff notes and direct messages.
Student role switching exists only in the isolated demo, never in real accounts.
Data is stored in Cloudflare D1. Updates use optimistic concurrency and require a fresh version.
Shared records refresh every 15 seconds while the app is open; messaging is polling-based, not a push chat service.
Attendance and completion are teacher/student-reported; the app does not verify physical presence or submission files.

## Email configuration

Set runtime secrets through the Sites environment controls, never in frontend files:

- RESEND_API_KEY: your Resend API key
- EMAIL_FROM: a sender on your verified Resend domain
- EMAIL_ALLOWED_RECIPIENTS: comma-separated exact recipient emails for the live demo

The owner must then enable sending in Email center. Assignment notices are queued on assignment creation.
Existing previews require the owner to explicitly queue them. Guardian messages require an address and recorded permission.
Email statuses distinguish preview, simulated, pending, sending, submitted, blocked, failed and cancelled.
Submitted means provider accepted, not delivered. Check Resend logs for delivery and uncertain attempts.
Provider requests use idempotency keys. Old uncertain requests are not automatically retried.
The browser demo never calls the email provider.

Due-soon means within 24 hours. Overdue notices skip work marked completed.
Manual checks run with “Check deadlines now”. Live teacher sessions check once a minute while open.
**Closed-app scheduling is not configured.** For an approved scheduler, configure SCHEDULER_SECRET and call POST /api/maintenance
with x-scheduler-secret; an owner-private deployment also requires supported Site service authorization.
Do not expose the secret or use a public bypass. A configured secret alone does not create a scheduled job.

## Assistant configuration

- OPENROUTER_API_KEY: your key
- OPENROUTER_MODEL: an available chat model (default anthropic/claude-sonnet-4.5)

Without these, the local records assistant handles homework, deadlines, marks, seating, timetable and sample explanations.
It is a deterministic assistant, not general AI. Once configured, users can choose connected AI.
The server provides only authorised classroom context, excluding parent emails, staff notes and private messages.
AI cannot change records or send messages. Advice is guidance, not guaranteed marks improvement.

## Contribution credits

Classroom Contribution is an independent participation record. Supervised, age-appropriate tasks have accessible alternatives.
Credits never adjust academic marks or decide passing. They do not replace cleaning staff or include hazardous cleaning duties.
Academic scores below 60% are a demo review threshold, not an official school grading policy.

## Development

Node 22.13+; pnpm 11.25.0. Install dependencies with the repository's supplied installer.
The app uses React, TypeScript, Vinext, Cloudflare Workers, D1 and Drizzle migrations.

- npm run db:generate — generate migrations after schema edits
- node node_modules/typescript/bin/tsc --noEmit — type check
- node --experimental-strip-types --test tests/classroom.test.mjs — domain tests
- npm run build — production build

Apply the tracked drizzle migrations to the D1 binding via the Sites deployment workflow.
No secrets are included. Copying the source does not copy production records or credentials.

## Verification and prototype limits

Type checks, domain permission/workflow tests and production build are run for this version.
Interactive browser QA was unavailable in the build environment; manual visual and multi-user verification remain.
Real provider delivery and model calls cannot be tested before credentials are configured.
This is a hackathon prototype, not a school production records system: it has no attachments, delivery webhooks,
record-retention administration or full attendance audit history. Avoid importing real student records for a stage demo.
