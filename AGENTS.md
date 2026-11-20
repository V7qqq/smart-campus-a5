# AGENTS.md

## Project
Smart Campus room availability checker. One page, one-room checks, fictional sample data only. A student picks a room and a time slot and sees Available / Unavailable with clear reasons.

## Structure
- `src/booking.js` — pure helper `canBook({ start, end, now, blocked, bookings })` → true/false. Times are minutes after midnight.
- `src/booking.test.js`, `src/booking.regression.test.js` — Vitest tests (T01–T18 and regression).
- `src/rooms.test.tsx` — AC/F-rule tests and UI behavior tests (jsdom).
- `src/lib/bookingLogic.ts` — availability check (`checkAvailability`) and time helpers.
- `src/lib/filterRooms.ts` — room filter logic (F1-F2).
- `src/data/rooms.ts` — fictional rooms and bookings (fixtures). `src/lib/sampleData.ts` re-exports them.
- `src/components/` — UI only (`RoomChecker` and its sub-components).

## Acceptance criteria (must always be preserved)
- AC1: reject if start < 0, end > 1440, start >= end, or start <= now.
- AC2: reject if duration is longer than 120 minutes.
- AC3: reject if the room is blocked.
- AC4: reject overlaps (start < b.end && end > b.start); touching endpoints are allowed.
- AC5: never mutate booking data; show a clear Available / Unavailable decision.
- AC6: usable on desktop and mobile with understandable validation feedback.

## Feature rules (must always be preserved)
- F1: room is shown only if capacity >= attendees.
- F2: room is shown only if it has ALL selected equipment.
- F3: a blocked room may be shown but is never Available.
- F4: when no room matches, show an empty state.
- F5: availability uses only the selected room's bookings.

## Constraints (forbidden scope changes)
- No backend, login, database, analytics, or saved booking creation.
- Do not change the UI look or behavior unless asked.
- Do not change fixture data. Booker names stay hidden in the UI (shown only as "Booked").
- Do not weaken or delete existing tests or assertions.
- Fictional room data only. No secrets in code or docs. No external deployment or publishing.

## Engineering rules
- Prefer pure functions and minimal changes.
- One source of truth for booking rules; the UI only calls it, including for mapping rule names to field messages.
- Use at most 1–2 justified patterns. Do not add Singleton, Factory, or class hierarchies without a concrete need.
- Add Adapter only if fixtures truly have different shapes; add Strategy only if there are two real policies.

## Commands
- Dev server: `npm run dev`
- Tests: `npm test` (runs `npx vitest run`)
- Tests: `npx vitest run`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

## Verification
- Run `npx vitest run` before and after every change and report the exact output.
- Add focused regression tests for any changed rule.
- Before acceptance, `npm run lint`, `npm run typecheck`, and `npm run build` must all pass.
- Check the page at desktop and narrow/mobile width. If no browser is available, say so and do not claim the check passed.
- Report: changed files, rationale for each, test results, and remaining limitations.
- Agents must not publish, deploy, push or merge. A human reviews the diff and approves before merge.
