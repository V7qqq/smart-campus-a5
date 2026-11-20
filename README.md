# Smart Campus Practice 11

Optional Explain availability feature using a labelled mock adapter. No provider API call is made; no key, backend or database is required. The existing deterministic checker alone decides availability. Explanations never create a reservation.

Node.js 18+ and npm. Install with `npm ci`, start with `npm run dev`. Verify with `npm test -- --reporter=verbose`, `npm run lint`, `npm run typecheck`, `npm run build`.

Flow: room/time input -> existing checker -> structured result -> explanation adapter -> response validation -> plain-text UI. On service failure use a deterministic fallback. Classroom failure simulation exposes timeout, API error, missing key and malformed output modes. All are simulated locally.

The existing five-room catalog is preserved. Each explanation concerns only the selected room. Booking rules and fictional fixture data remain unchanged.

Input: roomLabel (1-60 safe label characters), integer start/end within -2880..2880 to allow explanations of invalid intervals, isAvailable boolean, supported reasonCode. The status/reason come from checkAvailability. Output: one explanation string, maximum 360 characters and two sentences. Reject invalid requests before calling the adapter. Mock timeout is 1200 ms. Real-provider integration is outside this submission.
