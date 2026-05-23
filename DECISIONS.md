# Architecture decisions

## Day 1
- One shared backend for web and mobile, not two. Reason: single source of truth for auth, branch scoping, and business rules. Splitting would require maintaining identical logic twice in 5 days.
- Web frontend uses React (with Vite), not React Native. React Native runs only on Android/iOS, not browsers. Components are not interchangeable, so web and mobile are separate codebases that share only the backend API.
- MySQL with `branch_id` on every business table, plus separate `user_branches` (permanent) and `access_grants` (temporary, with expires_at). Reason: clean separation between baseline assignment and on-call coverage; audit-friendly.
- JWT-based auth with role + branches embedded in the token payload. Branch list is computed at login by unioning user_branches with non-expired access_grants.

### OTP issuance invalidates prior codes
register/start, admin-register/start, and forgot-password now mark all prior unconsumed OTPs for the same (email, purpose) as consumed before issuing a new one. Without this, repeat requests during testing left multiple "valid" OTPs in the table and the verify endpoint could end up checking against a different one than the user copied. Same bug class as the earlier pending_registrations issue: stale state from prior attempts confusing the current flow.

### Datetime handling between Node and MySQL
MySQL was running in local Manila time (UTC+8); Node was sending Date objects which mysql2 serialized as UTC. MySQL stored those UTC strings as if they were local time, making every `expires_at` 8 hours in the past on creation. OTPs and refresh tokens appeared expired immediately.

Fix: introduced `toMySQLDateTime(date)` helper that formats local-time strings before sending to the database. All places that wrote DATETIME values (otp_codes.expires_at, pending_registrations.expires_at, refresh_tokens.expires_at) now use this helper. The DB column receives a string matching server-local time, and `NOW()` comparisons work correctly.

### Datetime handling — UTC everywhere
Initial fix wrote local-time strings, which would break in production where Node and MySQL are both UTC. Final fix:
1. Connection-level `SET time_zone = '+00:00'` ensures MySQL treats every connection as UTC regardless of where the server runs.
2. `toMySQLDateTime` uses `toISOString()` to always emit UTC strings.
Result: identical behavior in local dev (Manila) and production (Railway UTC). Display layer converts UTC → user's timezone when rendering.

### Mobile token storage uses expo-secure-store, not AsyncStorage
Web stores the refresh token in an httpOnly cookie set by the backend, which JavaScript cannot read. Mobile has no cookies, so the refresh token has to live somewhere on the device. Two options: AsyncStorage (plain, readable by anything that can run JS in this app) and SecureStore (Keychain on iOS, EncryptedSharedPreferences on Android). Picked SecureStore because the refresh token is the credential that lets an attacker impersonate the user for 30 days — encrypted-at-rest is the right default for that. Access tokens stay in-memory only.

### Mobile refresh flow sends token in request body
Web's refresh endpoint reads the token from the cookie. Mobile sends `{ platform: 'mobile', refreshToken }` in the JSON body and the backend handles both shapes. Keeping one endpoint that branches on platform is simpler than maintaining two endpoints with near-identical logic.

### Patient registration is two screens (form, then OTP), not one
Patient enters email/name/password on screen 1, taps Send OTP. Backend stores hashed OTP in otp_codes and the pending registration in pending_registrations. User reads code from email (mock-printed to backend console in dev), types it on screen 2, taps Verify. Backend matches OTP, promotes pending_registrations row into users, issues access + refresh tokens, returns to mobile. Splitting into two screens makes each step cancellable independently and matches user expectations from other apps.

### CORS configured to accept native app origin
Web requests carry an Origin header (http://localhost:5173). React Native requests often carry no Origin header at all. Original CORS config rejected requests with no origin. Updated server.js to also allow requests where origin is undefined, then check the explicit allowlist for browser requests. Without this, every mobile API call would 403 on preflight.

## Day 1 — bugs encountered and fixed

1. `audit_logs` foreign key violation on register/start. Original design stashed pending registration data in audit_logs.user_id=0, but FK requires user_id to reference an existing row. Fixed by introducing dedicated pending_registrations table.

2. Stale OTP rows from repeated /register/start calls during testing. Verify endpoint returned latest unconsumed OTP, but user copied an earlier OTP from terminal. Fixed by marking all prior unconsumed OTPs (same email, same purpose) as consumed before issuing a new one.

3. Datetime mismatch between Node and MySQL. MySQL ran in local Manila time; mysql2 sent Node Date objects as UTC strings; MySQL stored UTC values in columns interpreted as local time. Result: every expires_at was 8 hours in the past on creation. Fixed in two layers — connection-level `SET time_zone = '+00:00'` forces every connection to UTC regardless of where the server runs (works locally and on Railway), and toMySQLDateTime() helper uses toISOString() to always emit UTC strings.

### SafeAreaView migrated to react-native-safe-area-context
React Native's built-in SafeAreaView is deprecated and slated for removal. Switched to SafeAreaView from react-native-safe-area-context (already installed as a peer of react-navigation) and wrapped the app root in SafeAreaProvider so insets are measured once and shared. Functionally identical, future-proof, and removes warning noise that would have grown across screens by day 5.

### Mobile screen and style file structure
Mobile screens use `.jsx` extension for JSX-containing component files, with corresponding style files in a sibling `styles/` folder. Style files use `export default styles` (default export) and are imported as `import styles from '../styles/ScreenName'`. The folder split lets file-tree scanning group by concern: visuals in styles/, markup+logic in screens/.

### Style file formatting convention
StyleSheet objects use 4-space indentation, one property per line, blank lines between style groups. Verbose but consistent with previous mobile project; trades file length for scannability when adjusting visuals.

### Layout: SafeAreaView + KeyboardAvoidingView on input screens
Login and Register wrap content in both SafeAreaView (handles physical device cutouts: notch, home indicator) and KeyboardAvoidingView (pushes inputs above the keyboard when it appears). PatientHome only needs SafeAreaView since it has no text inputs. SafeAreaView is the outer wrapper since the safe area should be reserved before the keyboard manages anything within it. KeyboardAvoidingView's behavior prop is set to "padding" on iOS only — Android handles keyboard avoidance natively and the prop tends to break it.

### Styling approach: React Native StyleSheet
Using StyleSheet.create({...}) with style objects, separated into mobile/src/styles/ files imported by each screen. Considered alternatives:
- NativeWind (Tailwind for RN): adds a build step and a third dependency, no benefit at this project size.
- styled-components: CSS-in-JS template literals; pleasant for theming but adds a dependency for what we already get from StyleSheet.
StyleSheet is the React Native default — zero dependencies, validates style keys at startup, and any RN developer can read it without context.

### AI scheduler architecture (CSP with weighted scoring)

The appointment scheduler is implemented as a Constraint Satisfaction Problem with weighted soft scoring, a recognized AI technique covered in standard AI curricula (Russell & Norvig). Chose this over machine learning for three reasons:
1. No training data — the system is brand new, so any ML model would have to be trained on fabricated data, which is unscientific.
2. Rules are known and stable — "a dentist can't be in two places at once" is a hard rule, not something to learn.
3. Decisions must be explainable — healthcare-adjacent systems require auditable recommendations. Each suggestion includes a `breakdown` object showing exactly which signals contributed to its score.

**Hard constraints (filter):** dentist offers the requested service; dentist works at the requested branch on that weekday; slot fits within working hours; slot doesn't overlap the lunch hour (12-1); slot doesn't conflict with existing appointments; slot is in the future.

**Soft constraints (score):** preferred time-of-day from booking history (+3); same dentist as last visit (+2); soonest available day (+2 day 0, +1 day 1); early in the day (+1 before 14:00).

**Diversification:** top-3 selection prefers distinct (dentist, day) combinations to give patients real choice rather than near-identical slots.

**Defensibility:** unlike a neural network, every recommendation can be traced to a specific signal. The system also leaves room to add ML for specific tasks like no-show prediction in v2 once historical data exists.

## Day 2 — Appointments and AI scheduling

### Multi-branch dentist scheduling model
Both dentists are scheduled at both branches all 7 days of the week, 10 AM to 7 PM. Lunch hours (12–1 PM) are NOT stored in the schedule table; they're enforced in scheduler code. Reasoning: storing lunch as start1/end1/start2/end2 columns would clutter the schema, and lunch is a constraint rather than a schedule. Treating it as code-side rule keeps `dentist_schedules` clean and lets us change the lunch policy in one place if needed. The current real clinic situation has both dentists on-call for both branches; the schema supports branch-specific dentists in the future without code changes.

### Appointment endpoints with role-based filtering
`/api/appointments` (GET) returns different data shaped by `req.user.role`:
- patient: only their own appointments
- dentist: only appointments where they're the dentist
- receptionist/admin: all appointments at branches they have access to

The role filter is applied at the SQL WHERE clause level, not in route handler code. This makes data leakage impossible by mistake — there's no path where a route handler "forgets" to add the filter.

### Conflict detection in pure SQL
Booking conflict check uses `start_time < ? AND DATE_ADD(start_time, INTERVAL duration_min MINUTE) > ?` to compute the overlap atomically inside MySQL. If two patients race to book the same slot, MySQL serializes the query and one will see a 409 conflict. No application-level locking needed.

### Service duration denormalized onto appointments
`appointments.duration_min` is copied from `services.duration_min` at booking time, not joined live. Reason: if the clinic later changes a service from 30 min to 45 min, existing bookings should stay 30 min — that's what was scheduled with the patient. Storing duration on the appointment locks the historical record.

### AI scheduler architecture (CSP with weighted scoring)
The appointment scheduler is implemented as a Constraint Satisfaction Problem with weighted soft scoring, a recognized AI technique covered in standard AI curricula (Russell & Norvig). Chose this over machine learning for three reasons:
1. No training data — the system is brand new, so any ML model would have to be trained on fabricated data, which is unscientific.
2. Rules are known and stable — "a dentist can't be in two places at once" is a hard rule, not something to learn.
3. Decisions must be explainable — healthcare-adjacent systems require auditable recommendations. Each suggestion includes a `breakdown` object showing exactly which signals contributed to its score.

**Hard constraints (filter):** dentist offers the requested service; dentist works at the requested branch on that weekday; slot fits within working hours; slot doesn't overlap the lunch hour (12–1); slot doesn't conflict with existing appointments; slot is in the future.

**Soft constraints (score):** preferred time-of-day from booking history (+3); same dentist as last visit (+2); soonest available day (+2 day 0, +1 day 1); early in the day (+1 before 14:00).

**Diversification:** top-3 selection prefers distinct (dentist, day) combinations to give patients real choice rather than near-identical slots.

**Defensibility:** unlike a neural network, every recommendation can be traced to a specific signal. The system also leaves room to add ML for specific tasks like no-show prediction in v2 once historical data exists.

### Scheduler diversification
Pure score sorting tended to surface 3 near-identical slots (same dentist, same day, 15 minutes apart). Added a post-sort `pickDiverseTopSuggestions` step that ensures the top 3 come from distinct (dentist, day) combinations when possible, falling back to plain top-3 if that's not feasible. Better UX (real options to choose from) without changing the underlying scoring or constraint logic.

### 15-minute slot stepping
Candidate slots are generated every 15 minutes within working hours rather than aligned to service duration. A 30-min cleaning could start at 10:00, 10:15, 10:30, 10:45, etc. — not just 10:00 and 10:30. More candidates means the scheduler has more material to score, which improves matches with patient preferences. This is the standard interval used by real clinic systems.

### Patient preference learning from past bookings
The scheduler reads the patient's last 10 appointments to derive two signals:
1. Most-frequent time-of-day bucket (morning/afternoon/evening) → boost matching slots
2. Most recent dentist → boost slots with the same dentist (continuity of care)
This is "learning from data" but explicitly through pattern detection in SQL, not statistical learning. The system has no patient history on day 1, so a brand-new patient gets neutral preferences — once they book, the next suggestion adapts.

### Receptionist and dentist appointment views (web)
Both views use the same /api/appointments endpoint with different default time windows (today/upcoming) and different action buttons (cancel for receptionist, mark completed/no-show for dentist). The styling/component split convention from day 1 was extended to the web: components live in `pages/`, styles live in `styles/`, both default-exported. Date display uses `toLocaleString('en-PH')` for Manila-friendly formatting; backend stores UTC, browser converts to local for display.

### API datetime format consistency
The backend's mysql2 driver auto-converts DATETIME columns to JS Date objects, which Express serializes as ISO strings with millisecond precision and `Z` suffix (e.g. `"2026-05-11T10:00:00.000Z"`). Some early mobile code assumed MySQL string format (`"2026-05-11 10:00:00"`) and tried to convert by appending `Z`, which broke when ISO was already provided. Standardized on: API always sends ISO, mobile/web parse with `new Date(str)` directly. The `normalizeToISO` helper in datetime utils handles both formats defensively but is unused in current paths.

### Mobile booking flow as 3 sequential screens
Patient booking is split across three screens: BookService (pick service + branch), BookSuggestions (display AI top 3 with breakdowns), BookConfirm (review + create). Each screen is single-purpose, navigable independently, and clears state when the flow completes via `navigation.popToTop()`. Splitting the flow this way makes each step understandable in isolation and matches what users expect from booking apps.

### Score breakdown rendered as labeled rows
Each AI suggestion displays its score breakdown as labeled rows ("Matches your preferred time of day +3", "Same dentist as last visit +2", etc.) with the total at the bottom. This is the visual demonstration of the algorithm — the panel can see exactly how the AI thinks just by looking at the screen. The labels are a separate constants object (`BREAKDOWN_LABELS`) so adding new soft constraints later only requires adding the new key + label.

### useFocusEffect for patient home auto-refresh
Patient home uses `useFocusEffect` instead of `useEffect` to refetch appointments. This means when the patient books a new appointment and navigates back to home, the list refreshes automatically without requiring pull-to-refresh. Standard React Navigation pattern.

## Day 2 — Bugs encountered and fixed

1. Receptionist's "Today" tab showed empty when test appointments were dated weeks in the future. Not a bug — the date filter worked correctly, the test data was simply outside the window. Created fresh test appointments dated for "today" to confirm the data flow, then expanded the dentist's "Upcoming" window to 30 days for ongoing testing.

2. Patient mobile "Upcoming" section showed nothing despite scheduled future appointments existing in the database. Root cause: filter code used `a.start_time.replace(' ', 'T') + 'Z'`, which assumed MySQL format. The API actually returns ISO format already (mysql2 + Express auto-conversion), so the replace operation produced malformed strings like `"2026-05-11T10:00:00.000ZZ"` which JavaScript parsed as Invalid Date. Filter `>= now` always returned false. Fix: drop the `.replace` and pass `start_time` directly to `new Date()`. Lesson: when the backend sends ISO, don't try to "fix" it — just consume it.

## Day 3 — Session 3A: Dental chart and treatments

### Treatment data model: linked to appointments, never floating
The treatments table has a NOT NULL foreign key to appointments. Every treatment record must reference a specific visit. Reasons: medical traceability (when was this observation made, by whom), billing alignment (treatments map to billable services on real appointments), and audit trail (defensible record of when a condition was diagnosed). The form forces the dentist to pick an appointment from a dropdown when adding a treatment.

### Treatment access control: any treating dentist
A dentist can view treatments for any patient they've had appointments with — not just treatments they personally created. Matches real clinic practice: dentists frequently cover for each other and continuity-of-care requires shared visibility. The middleware enforces this by joining against the appointments table at request time. Patients see only their own treatments. Receptionists and admins see anyone at their accessible branches.

### Treatments: create and delete only, no edit
A treatment record is a historical clinical observation. If a dentist later marks tooth #36 with a different condition, that's a new treatment record, not an edit of the old one. The chart shows the latest condition per tooth, but the full history is preserved. Hard delete (vs soft delete) was used for capstone simplicity; soft delete via `deleted_at` would be the production approach for medical records.

### Condition metadata served from backend
The list of valid condition types (caries, filling, crown, extraction, etc.) lives in a backend endpoint `/api/treatments/conditions` along with their display colors. The frontend reads this once and uses it for both dropdowns and chart color coding. Adding a new condition type later means adding one entry to the backend list — no frontend code change.

### Custom-built SVG dental chart (not a library)
The 32-tooth chart is implemented as raw SVG rectangles in a custom React component (~80 lines), using standard FDI notation (11-18 upper right, 21-28 upper left, 31-38 lower left, 41-48 lower right). Considered libraries like react-dental-chart and react-odontogram but chose custom build because: (1) full control over click behavior and color logic, (2) defensible as own work in the capstone, (3) no dependency risk, (4) library APIs would still need wrapping for our condition-color scheme. Chart shows the latest condition per tooth; clicking opens a side panel with full per-tooth history.

### Dental chart uses patient anatomical perspective
Chart renders "R" (patient's right side) on the viewer's left and "L" (patient's left side) on the viewer's right — standard convention in dental charting and medical imaging. FDI numbering reflects this: tooth 18 (upper right third molar) appears at the far left of the chart because it's on the patient's right side. Matches what dentists see in any clinic software or dental textbook. This is intentional and correct.

### Dentist sees "My patients" filtered by appointment history
The dentist's Patients tab queries appointments to derive the patient list (DISTINCT patient_id FROM appointments WHERE dentist_id = current_user). Each patient row also shows last_visit and total_appointments computed in the same query via MAX and COUNT. This means the patient list naturally only includes people the dentist has actually treated — no global patient directory.

### Web tab navigation done with internal state, not router routes
The dentist's web view switches between Appointments and Patients via React state in a wrapper component, not via React Router routes. Reasoning: both views are children of the same protected route (/dentist), share auth context, and don't benefit from independent URLs (a dentist visiting /dentist/patients via direct URL is unusual). Lighter than introducing nested routing for two top-level tabs.

## Day 3 — Session 3B: CAMBRA risk assessment and patient mobile views

### CAMBRA: hybrid self-assessment plus clinical verification
Patients self-assess on mobile (engagement and education); dentists verify on web (clinical accuracy and medical record). Both versions stored in `risk_assessments` with `assessed_by_role` to distinguish, and `related_assessment_id` to link verifications back to the original self-assessment. Patient sees their self-report and the dentist's verified version side by side on the dentist's profile view.

Reasoning: CAMBRA was designed as a clinician-administered tool — patients cannot reliably self-assess clinical signs like white-spot lesions or visible plaque. But forcing the dentist to fill every form misses the patient-engagement value. Hybrid splits the work: patient inputs what they know (habits, history), dentist validates what they observe.

### CAMBRA factor list derived from published literature
The factor list and weights match standard CAMBRA scoring published by UCSF and adopted across evidence-based dental practice. Disease indicators weighted +3 each (visible cavities, white-spot lesions, recent restorations). Risk factors weighted +1 each (frequent snacking, sugary drinks, inadequate fluoride, dry mouth, irregular visits, visible plaque). Protective factors weighted -1 each (fluoride toothpaste, fluoride mouthwash, fluoridated water, xylitol gum, recent cleaning). Risk levels: score ≤1 low (6-month recall), 2-4 moderate (4-month recall), 5+ high (3-month recall).

### Pure scoring module, no side effects
The CAMBRA algorithm (`backend/src/services/cambra.js`) is a pure function module — no database access, no HTTP. `computeScore(codes)` takes an array of factor codes and returns score, risk level, category breakdown, and recommendations. This makes it trivial to test in isolation and easy to defend: given the same input it always produces the same output. The HTTP routes are thin plumbing around it.

### Recompute on read
When listing past assessments, the server recomputes breakdown and recommendations from the stored factor codes. Only the score, risk level, and raw factor codes are persisted. If recommendation text is updated later (e.g. new fluoride guidelines), old assessments display the new wording without a data migration. The score itself is also stored so historical totals never drift.

### Clinician-only flag distinguishes who can answer what
Each factor has a `clinician_only` boolean. Factors requiring visual examination (visible cavities, white-spot lesions, visible plaque) are marked clinician-only. The patient questionnaire endpoint filters these out; the dentist endpoint (`/factors?view=full`) returns the full list. The dentist's verification UI visually highlights clinician-only factors with an orange "Clinical" badge so the dentist focuses their adjustments there.

### Mobile result screen renders score breakdown transparently
Every CAMBRA result shows each contributing factor with its weight, grouped by category, before the recommendations. This is the visual evidence that scoring is rule-based and explainable. No "the AI decided" — the patient can see exactly why their score is what it is.

### Treatment progress as patient-facing read-only view
Patient mobile view of treatments uses the same `/api/treatments/by-patient/:id` endpoint as the dentist web view. Backend access control (a patient sees only their own; a dentist sees patients they've treated) means no separate endpoint needed. Treatments grouped by tooth with the current condition highlighted by the same color used on the dentist's dental chart, keeping the visual language consistent across platforms.

### Modal-based dentist verification flow
The dentist's "Verify and adjust" is a modal rather than a separate page. Reasoning: verification is part of reviewing a patient's record, not a separate task. The dentist is already on the patient profile when they verify, and keeping it inline preserves context. The modal pre-fills with the patient's selected factors so verification starts as adjustment rather than re-entry — matches the typical clinical workflow of "the patient said X, but I see Y."

## Day 3.5 — Push notification infrastructure (deferred testing)

### Push notification infrastructure built, testing deferred
Implemented the full push notification stack:
- Backend: `expo-server-sdk` installed, `push_token` column on users, push service module (`backend/src/services/push.js`), token registration endpoint (`POST /api/push/token`), test endpoints
- Mobile: `expo-notifications` and `expo-device` installed, notification handler configured, app.json notification config with custom icon and Android channel, push service module (`mobile/src/services/push.js`) with permission flow + token retrieval + backend registration
- Auth context wired to call push registration on login/bootstrap/register (currently commented out)

### Why testing is deferred to day 5
Expo Go in SDK 53 removed push notification support on both iOS and Android. Receiving an actual push notification requires building a development client via EAS, which is a 15-20 minute build per platform and benefits from being done once near deployment time when both test devices are available. The push registration calls in AuthContext are commented out to avoid console spam from `getExpoPushTokenAsync` failures in Expo Go.

When EAS dev builds are created (day 5 alongside the production build), uncommenting three lines in AuthContext re-enables the entire flow. The backend never needed to change.

### Why in-app notifications still cover the demo
The notification system uses persistent storage (notifications table) as the source of truth. Mobile reads from this table via polling, so notifications work even when push is unavailable. Push is an additive delivery channel for when the app is closed — it doesn't change what gets shown when the user opens the app. Demo on Expo Go shows the full notification UX minus the lock-screen banner.

### Defense framing
"Push notification persistence and delivery are fully implemented. Expo Go's SDK 53 limitation means receiving notifications requires an EAS development build, which is part of the standard production deployment workflow. The code is unchanged whether running in Expo Go (in-app notifications only) or an EAS build (both in-app and push). This means the infrastructure can be validated independently of the testing environment."

## Day 4 — Session 4A: Messaging, in-app notifications, and recall cron

### Messaging restricted to patient ↔ receptionist
Initial design considered patient-admin and dentist-receptionist messaging as well. Narrowed to patient ↔ receptionist only for v1 because that's where most operational clinic communication happens (scheduling questions, reminders, follow-ups). Dentists communicate with patients in-person during appointments; admins handle escalations through other channels. The validPairs constant in `routes/messages.js` enforces this server-side — UI restrictions alone aren't enough.

### Patient registration ties to a branch (home_branch_id + user_branches)
Patients pick a preferred branch during mobile registration. This sets both `home_branch_id` (single value) and inserts a row in `user_branches` (multi-branch model). Reasoning: receptionists need to know which patients are "theirs" before any appointments exist, and the home_branch_id lets new patients message reception with questions before booking. The user_branches insertion keeps the multi-branch model consistent — patients who later book at a different branch will get a second row in user_branches via the appointment flow.

### Branch-scoped messaging access
A patient can message a receptionist only if the patient has had an appointment at that receptionist's branch, OR if the receptionist works at the patient's home branch. Enforced in both the contacts endpoint (filters list) and the POST endpoint (rejects unauthorized sends with 403). Prevents cross-branch privacy leaks where a patient at QC could message a receptionist at Makati they have no relationship with.

### Polling-based message updates (not WebSocket)
Both web and mobile clients poll for messages — mobile every 6 seconds when a thread is open, web every 8 seconds. Considered WebSocket for real-time updates but rejected for v1: polling is simpler to deploy, doesn't require sticky-session config on Railway, and the UX is "good enough" for clinic-pace messaging (not Slack-pace). WebSocket is documented as v2 upgrade path.

### Threads are derived, not stored
No `threads` table. A thread is the set of messages where `(sender_id, receiver_id)` is the same pair in either direction. The `/threads` endpoint groups by `MAX(id)` per unique pair to find each conversation's latest message. Trade-off: harder to add thread-level metadata later (last-read marker, archive flag) but simpler for v1 and matches how most chat apps actually model 1-on-1 conversations under the hood.

### Notification table as single source of truth
Every notification — message arrival, appointment reminders, recall reminders — writes to the notifications table. Mobile reads from this table via polling on focus. This means in-app notifications work even without push, and push (when re-enabled via EAS dev build) just becomes an additional delivery channel for the same data. Push and in-app never disagree because they both reflect the same database state.

### Cron jobs: hourly for appointments, daily for recall
Two schedules. The hourly job handles 24-hour and 2-hour appointment reminders together (same query, different time windows). The daily job runs the recall reminder check, comparing each patient's last completed appointment against their CAMBRA-driven recall interval (low 6mo, moderate 4mo, high 3mo, default 6mo if no CAMBRA exists yet). Both schedules write to the same notifications table.

### Cron deduplication via "reminder_sent" flags
Each appointment has `reminder_sent_24h` and `reminder_sent_2h` boolean columns set when reminders fire. The cron query excludes already-sent appointments. For recall reminders, `users.recall_reminder_sent_at` tracks the last reminder timestamp; the cron requires at least 30 days since the last recall to avoid spamming patients who can't book immediately.

### Manual cron trigger endpoints for testing
Cron schedules don't fire instantly — testing "every 8 AM" in development is awkward. Added admin-only POST `/api/cron-admin/run-appointment-reminders` and `/api/cron-admin/run-recall-reminders` endpoints that execute the same logic immediately. Useful for development; should be gated or removed in production.

### Push notifications stay deferred to EAS dev build
Session 3.5 built the push infrastructure. Session 4A uses in-app notifications only because push doesn't work in Expo Go on SDK 53. Enabling push in production means uncommenting three lines in AuthContext after EAS dev builds are available. No backend changes needed.

## Day 4 — Session 4B: AI booking assistant and pre-flight conflict check

### AI booking flow: four screens in sequence
The patient AI booking flow chains four screens:

1. **BookAIAssistantScreen** — patient picks a branch, optionally quick-picks a service, types a free-text concern. All input validation and the pre-flight conflict check live here. Nothing calls OpenAI from this screen.
2. **AIAnalysisScreen** — on mount, calls `POST /api/ai/analyze` (OpenAI GPT-4o-mini). Returns interpreted concern, suggested service, urgency, duration, confidence score, and optional safety note. Only reached after the pre-flight conflict check passes.
3. **BookSuggestionsScreen** — calls `POST /api/appointments/suggest` (CSP scheduler) to surface the top 3 dentist-time slots. Receives `preferredDate`/`preferredTime` to activate the `close_to_requested_time` soft-scoring bonus.
4. **BookConfirmScreen** — patient reviews and confirms, calls `POST /api/appointments`.

The quick-pick path (service already chosen) skips AIAnalysisScreen entirely and jumps from BookAIAssistantScreen directly to BookSuggestionsScreen when "Use Suggested Time" is accepted from the conflict modal, or to BookSuggestionsScreen via the normal `proceedToAnalysis` path after conflict check passes.

### Pre-flight conflict check: no OpenAI tokens spent on blocked slots
Before `AIAnalysisScreen` mounts (and therefore before OpenAI is ever called), `BookAIAssistantScreen` runs a lightweight backend check. If the concern text contains a recognisable date + time, it calls `POST /api/appointments/conflict-check` against the Express backend. This is a pure database query — no AI involved. If the check returns `conflict: true`, a modal is shown and the user never reaches `AIAnalysisScreen`. OpenAI is called only when navigation to `AIAnalysisScreen` actually happens.

Rule: **OpenAI is called if and only if `AIAnalysisScreen` mounts.** The pre-flight check is the gate.

### parseConcernDateTime: conservative — both date AND time required
Client-side date/time parsing (`parseConcernDateTime`) only returns a result when it finds **both** a valid time (AM/PM or 24-hour within 10:00–19:00 clinic hours) **and** a date reference ("today", "tomorrow", day name, or ISO date). If only a time is present ("at 3pm" with no date), the function returns `null` and the pre-flight check is skipped entirely. This prevents false positives that would show a conflict modal when no specific slot was intended.

### buildClinicISO: local PH time → UTC ISO string
The parsed local time (e.g. `2026-05-22`, `15:30`) is converted to a UTC ISO string by subtracting 8 hours: `new Date(Date.UTC(year, month-1, day, hour-8, minute, 0, 0)).toISOString()`. This matches how all appointment `start_time` values are stored in the database (UTC), ensuring the conflict SQL comparison is timezone-safe.

### Conflict check: two-layer detection with 15-minute buffer
`POST /api/appointments/conflict-check` (patient-only endpoint) runs two checks:

1. **Patient-schedule conflict** (checked first): does the requesting patient already have a `scheduled` or `arrived` appointment whose window `[start_time, start_time + duration_min + 15min)` overlaps the requested window? Detects the case where the patient tries to double-book themselves.

2. **Branch unavailability** (checked second): runs the CSP scheduler (`suggestSlots`) from the start of the requested day over an 8-day window with `preferredStartDate` set to the requested time. If the best returned slot has `distance_to_preferred_minutes > 15`, no dentist is free within the 15-minute buffer and the branch is considered unavailable.

A 15-minute buffer (not the scheduler's internal 10-minute `APPOINTMENT_BUFFER_MINUTES`) is used for the conflict window. This gives a small cushion for transition time between patients and matches the real-world expectation that two appointments cannot be less than 15 minutes apart at the same branch.

Patient-schedule conflict takes priority: if the patient has a personal overlap, `conflict_type` is `patient_schedule` and the modal shows the specific existing appointment. If only the branch is unavailable, `conflict_type` is `branch_unavailable` and the modal shows a generic "not available" message.

### Service fallback for text-input conflict check
When the patient types a free-text concern (service unknown), no `service_id` is sent with the conflict-check request. The backend falls back to the first active service offered by any dentist at the requested branch (via `dentist_services` join) to use as a proxy for the CSP scheduler call. This allows branch availability to be assessed even when the specific service hasn't been determined yet by OpenAI.

### Conflict check is non-blocking on network failure
If the `checkAppointmentConflict` API call throws (network error, 5xx), the catch block silently swallows the error and calls `proceedToAnalysis()` anyway. The conflict check is a courtesy gate — a failed check should never prevent the user from booking. The backend's final `POST /api/appointments` endpoint is the authoritative source of truth for conflicts.

### Conflict modal: two actions, "Use Suggested Time" vs "Change Input"
When `conflict: true` is returned:
- The modal shows the specific blocking appointment (if `conflict_type === 'patient_schedule'`) or the unavailable time (if `branch_unavailable`), plus the next available slot from the CSP scheduler.
- **"Use Suggested Time"** accepts the suggested slot and continues the booking. For quick-picks (service known), this navigates directly to `BookSuggestionsScreen` with the suggested date/time as `preferredDate`/`preferredTime`. For free-text input (service unknown), it navigates to `AIAnalysisScreen` with `overridePreferredDate`/`overridePreferredTime` so the AI step can still determine the service while the slot is already pinned.
- **"Change Input"** dismisses the modal so the patient can edit their concern or pick a different time.
- If the CSP scheduler returns no next available slot, only "Change Input" is shown.

### overridePreferredDate/Time: AI analysis passes override through to BookSuggestions
`AIAnalysisScreen` accepts `overridePreferredDate` and `overridePreferredTime` route params. If present, these take priority over any date/time that OpenAI extracted from the concern text. This ensures that when a patient accepts a conflict-free suggested slot before going through AI analysis, the slot they agreed to is honoured in `BookSuggestionsScreen` — not overridden by whatever time OpenAI happened to parse from the concern text.

### Input validation rules for the concern text field
Three layers, applied in order before the conflict check runs:

1. **Branch required**: if no branch is selected, inline error "Please select a branch."
2. **Empty input**: if neither a quick-pick service nor a typed concern is present, inline error "Please describe your concern or pick a service."
3. **Non-dental keyword check** (text-input path only): if the concern text contains none of the 40+ dental keyword patterns, show the "Dental Concerns Only" modal. The keyword list covers symptoms (toothache, swelling, jaw pain), procedures (cleaning, extraction, root canal), and service terms (consultation, x-ray, checkup).
4. **Minimum length** (text-input path only): if the concern is dental-related but under 10 characters, inline error "Please describe your dental concern in more detail." — prevents single-word inputs like "tooth" from being sent to OpenAI.
5. **Maximum length**: `maxLength={500}` on the TextInput silently blocks characters beyond 500 — no error, no modal. A `{n}/500` character counter is displayed below the input at all times.

The non-dental modal and minimum-length error are checked in that order so a very short non-dental input shows the modal, not the length error.

### Button spinner during conflict check
While the conflict check is in flight, the "Analyze & Continue" button disables and replaces its label with an `<ActivityIndicator>` spinner + "Checking availability…" text. This prevents double-submission and communicates that work is happening without blocking the rest of the UI. The `loading` state (initial data fetch) also disables the button.

### AI analysis + CSP/weighted scoring work together, not in parallel
The two AI subsystems serve different purposes and run sequentially:

- **OpenAI (GPT-4o-mini)** in `AIAnalysisScreen` determines **what** service to book. Given a free-text concern ("I have a toothache and possible cavity"), it returns `suggested_service_id`, `interpreted_concern`, `urgency_level`, `confidence_score`, and optionally `preferred_date`/`preferred_time`. Temperature 0.2 for reproducible clinical suggestions.
- **CSP scheduler** in `BookSuggestionsScreen` determines **when** and **with whom** to book. Given the service, branch, patient history, and optional preferred time, it scores all valid slots against hard and soft constraints and returns the top 3 diverse suggestions with score breakdowns.

Neither subsystem knows about the other. OpenAI does not see appointment schedules; the CSP scheduler does not see the patient's symptoms. The screens act as the integration layer, passing outputs from one as inputs to the other.

### Suggested slot date/time is passed as preferred, not forced
`BookSuggestionsScreen` receives `preferredDate` and `preferredTime` as route params. These activate the `close_to_requested_time` soft-scoring bonus in the CSP scheduler (+1 to +10 points based on proximity) via the `preferredStartDate` parameter. The scheduler still scores other slots normally — if a much better slot exists that day, it can outrank the preferred time. The preferred time is a suggestion signal, not a hard constraint. Hard enforcement of a specific time would defeat the purpose of showing three diverse options.

### Conflict check gate applies to both quick-pick and text-input paths
An earlier version of the code only ran the conflict check inside `if (selectedQuick)`. This meant that typing a time in the free-text concern (e.g. "I have a toothache at 3:30 PM tomorrow") would bypass the check entirely and proceed directly to OpenAI, calling AI on a time slot the patient already had booked. The fix removed the gate: `parseConcernDateTime` now runs unconditionally on `concern` (the raw text input) regardless of whether a quick-pick service is also selected. If a parsed time is found, the check runs for both paths.

## WEB FOLDER - RecepAppointmentForm.jsx - Receptionist auto-available slots

### Time slot picker replaced with auto-computed slot grid
The receptionist form's manual 30-minute time select dropdown was replaced with an auto-generated clickable slot grid. On date selection, `listAppointments` fetches all appointments for that day scoped to the logged-in receptionist's branch. The `computeAvailableSlots` pure helper computes 30-minute intervals from 10 AM to 6:30 PM, marks each `available: false` if the slot is in the past or blocked by an existing appointment's duration plus the 15-minute buffer.

**Removed state:** `extraSlots`, `slotIndex`, `fetchingMoreSlots`, manual time picker options constant. These were from the manual 30-min dropdown + "another slot" cycling system.

**Removed functions:** `handleTimePickerChange`, `handleSuggestedSlotClick`, `handleApplySuggestedSlot`, `handleApplySlot`, `handleNextSlot`, `fetchMoreSlots`. Slot selection is now one action: `handleSelectSlot(slot)` sets `formData.hour` and `formData.minute`.

**Removed API calls:** `suggestSlots` (CSP backend endpoint). The form no longer calls `/appointments/suggest`; it computes available slots deterministically from the database appointments for the selected date.

**New state:** `dayAppointments`, `dayAppointmentsLoading`. Appointments for the selected date are fetched into local state and passed to `computeAvailableSlots`.

**New useEffect:** Slot validity auto-clear. When `availableSlots` changes (due to date, service, or appointments changing), if the currently selected time is no longer available, it auto-clears `formData.hour` and `formData.minute`. This prevents stale selection across date changes.

### Clinic hours hardcoded, appointment duration caps slot candidates
Clinic operates 10 AM–7 PM daily. `computeAvailableSlots` generates candidates every 30 minutes starting from 10 AM. Each candidate's availability depends on:
1. **Not past:** `slotStart <= now` marks it unavailable (prevents booking into the past)
2. **Not blocked:** Overlaps any existing appointment's `[start_time, start_time + duration_min + 15min)` interval
3. **Fits within clinic hours:** The appointment end time (start + duration + buffer) must not exceed 7 PM

### Slot grid styling: blue=available, grey=blocked, dark blue=selected
Available slots render as blue chips (`#2563eb` border, `#eff6ff` background, `#1d4ed8` text). Blocked slots are grey with strikethrough (`#f1f5f9` background, `#e2e8f0` border, `#94a3b8` text, cursor `not-allowed`). Selected slots have dark blue background (`#2563eb`). All styles defined in `styles/RecepAppointmentForm.js`.

### Duration-based slot blocking accounts for service
`computeAvailableSlots` receives `durationMinutes` from `selectedService.duration_min || 30`. When checking if a slot is blocked, the query checks `slotStart < b.end && slotEnd > b.start` where `slotEnd = slotStart + durationMinutes + 15 min`. This means a 30-minute service occupies more window than a 20-minute service would.

### Branch-scoped appointment fetching prevents cross-branch conflicts
`fetchDayAppointments` passes `branch_id` as a query param to `listAppointments`. The backend filters appointments to the receptionist's branch only. This means conflict checking never crosses branches — a receptionist at QC branch cannot accidentally double-book against an appointment at Makati.

### Guard on hour/minute state prevents broken time computations
When `formData.hour` or `formData.minute` are empty strings (initial state), `timePickerValue` guards to return `''` instead of calling `toTimePickerValue`, which would break. Similarly, `estimatedTimeRange` guards to return `'—'` when `selectedTime` is empty. This prevents render crashes from undefined or NaN time values during the form init phase.

## Day 5 — Session 6: Same-day appointments → queue; completed slots reopen

### Completed appointments no longer block new time slots
Previously, the conflict check on the receptionist form included `status IN ('scheduled', 'arrived', 'completed')`, which meant a completed appointment (e.g. a patient seen at 2 PM last week) would still block a new booking at 2 PM this week. Changed both frontend and backend to exclude `'completed'`:

**Frontend:** `computeAvailableSlots` now filters appointments with `['scheduled', 'arrived'].includes(...)` — completed appointments are ignored when building the busy intervals list.

**Backend:** Conflict check query on `POST /appointments` now uses `status IN ('scheduled', 'arrived')` instead of including `'completed'`.

**Rationale:** A completed appointment is a historical record. The time slot is genuinely free for a future booking. This aligns with clinic practice where "we saw that patient 2 weeks ago at 3 PM" doesn't block a new patient from being scheduled at 3 PM today.

### Same-day bookings created with initial_status='arrived' → appear in queue
When a receptionist books an appointment for today, the form detects `selectedDate === toDateKey(today)` and passes `initial_status: 'arrived'` to the backend. The backend honors this for staff (receptionist/admin), but rejects it for patient callers (always defaults to `'scheduled'`).

**Frontend logic:** In `handleSubmit`, before calling `createAppointment`:
```javascript
const isSameDay = selectedDate === toDateKey(today);
await createAppointment({
  // ... other fields ...
  ...(isSameDay ? { initial_status: 'arrived' } : {}),
});
```

**Backend logic:** In `POST /appointments`:
```javascript
const effectiveStatus =
  (role === 'receptionist' || role === 'admin') && initial_status === 'arrived'
    ? 'arrived'
    : 'scheduled';
// INSERT ... VALUES (..., ?, ...) with effectiveStatus
```

### Receptionist view immediately shows same-day bookings in queue
The receptionist navigates to `/receptionistAppointments` after booking. The page fetches `listAppointments()` (all upcoming appointments) and filters into:
- **Pending:** `status === 'scheduled'` (future bookings waiting for arrival)
- **Queue:** `status === 'arrived'` (patients checked in and ready for service)

A same-day appointment with `status: 'arrived'` lands directly in the queue. Future bookings get `status: 'scheduled'` and appear in pending.

### Future appointments still use 'scheduled' status
Only same-day bookings get `initial_status: 'arrived'`. Appointments for May 22+ are created with `status: 'scheduled'`, appearing in the pending section until the patient arrives.

### Staff-only rule prevents patients from forcing status
Patients always create appointments with `status: 'scheduled'` regardless of the date. The `initial_status: 'arrived'` override is only accepted if the caller's role is `'receptionist'` or `'admin'`. This prevents patients from attempting to bypass the arrival workflow.

### Consistent conflict checking: backend and frontend both exclude completed
Before these changes, there was a mismatch: the frontend's slot grid might show a time as available (completed appointments ignored), but the backend would reject it with a 409 conflict (because completed was in the SQL IN clause). Now both sides use the same logic — completed appointments don't block either the display or the save.

---

## Website (patient-facing static HTML/CSS/JS) — Session: BookAppointment Redesign

### API base URL switched to localhost
`website/js/HomePage.js` and `website/js/BookAppointment.js` previously pointed to the production domain (`https://api.smileempressdentalhub.com`). Both were updated to `http://localhost:4000` for local development. This is an intentional temporary change that must be reverted before deploying to production.

**Affected files:**
- `website/js/HomePage.js` — line 1, `API_BASE_URL`
- `website/js/BookAppointment.js` — line 1, `API_BASE_URL`

### Email input added to BookAppointment form
An email address field was added before the phone number input in `website/BookAppointment.html`. Uses the same `.input-group` styling as all other fields. No backend support was wired at this point — it was a frontend-only change initially patched in a later session.

**Affected file:** `website/BookAppointment.html` — email `<input type="email">` with id `email`, error span `emailError`

### BookAppointment form: step-locking UX
Step 2 (form fields) and Step 3 (time slots) are locked behind prior steps completing. Step 2 unlocks only when a date is selected (Step 1). Step 3 unlocks only when a branch is selected (Step 2). Lock state is driven by CSS classes: `.step-lock-notice.visible` shows a dashed notice banner; `#step2Content.locked` and `#step3Content.locked` apply `opacity: 0.4 + pointer-events: none + user-select: none`. The unlock trigger for Step 3 is branch selection, not full form completion — this was a deliberate UX decision so patients can see time availability as soon as they pick a branch, before filling all fields.

**Affected files:**
- `website/BookAppointment.html` — added `#step2Notice`, `#step3Notice` lock banners; wrapped content in `#step2Content`, `#step3Content`
- `website/css/BookAppointment.css` — added `.step-lock-notice`, `.step-lock-notice.visible`, `#step2Content.locked`, `#step3Content.locked` rules
- `website/js/BookAppointment.js` — `updateStepLocks()` function called on date selection and branch change

### BookAppointment form: step renaming and reorder
Step labels were swapped to match the new unlock order. The form fields section (previously Step 3) became **Step 2 — Complete Your Appointment Details**. The time slot picker (previously Step 2) became **Step 3 — Select Your Preferred Time**. HTML labels and JS references were updated consistently.

**Affected files:**
- `website/BookAppointment.html` — step labels in `.card-heading` and `.step-box`
- `website/js/BookAppointment.js` — no structural change, order follows HTML layout

### BookAppointment form: inline validation matching RecepAppointmentForm
All form fields now show inline errors consistent with the web portal's `RecepAppointmentForm.jsx` pattern: invalid inputs get a red border (`#dc2626`) with a background tint (`#fff7f7`), and a `.field-error-text` span below the input shows the error message. Errors are cleared on user input (real-time) and set on blur or submit.

Validation rules:
- **Full Name:** minimum 2 words (first + last name required), no numbers, no special characters. Unicode-safe (`À-ɏ` range allowed for accented names).
- **Email:** standard format check via regex, required.
- **Phone:** Philippine format only — must match `09XXXXXXXXX` (11 digits, starts with `09`). Digits-only input enforced. Letters and special characters are stripped on input. The `intl-tel-input` library was removed entirely since only PH numbers are accepted.
- **Location:** radio group, must select a branch.
- **Reason for Booking:** must select from branch-filtered dropdown.
- **Time:** must select a time slot before submitting.

**Affected files:**
- `website/css/BookAppointment.css` — added `.input-error`, `.field-error-text`, `.field-error-text.active`
- `website/js/BookAppointment.js` — `validateFullName()`, `validateEmail()`, `validatePhone()`, `showFieldError()`, `clearFieldError()`, `setInputError()` functions

### BookAppointment form: intl-tel-input library removed
`intl-tel-input` (CDN CSS + JS) was removed from `website/BookAppointment.html`. The phone field is now a plain `<input type="tel">` restricted to 11 digits. A `toPhInternational()` helper converts `09XXXXXXXXX` → `+639XXXXXXXXX` and stores it in a hidden `#fullPhoneNumber` field. The backend receives the international format (`+63...`) via `fullPhoneNumber`, preserving API compatibility with existing records and the receptionist's view.

**Why removed:** The booking page only serves Philippine patients. A country picker added UX complexity with no practical benefit, and the library added two CDN requests on every page load.

**Affected files:**
- `website/BookAppointment.html` — removed `intl-tel-input` `<link>` and `<script>` tags; simplified phone field markup (removed `.phone-field` wrapper)
- `website/js/BookAppointment.js` — replaced `iti` initialization with digit-only input handler + `toPhInternational()` conversion

### BookAppointment form: branch-filtered service dropdown
The reason-for-booking dropdown is no longer hardcoded HTML. It is rendered dynamically by `renderReasonOptions(branch)` when a branch radio is selected. Each branch has a curated static list in the `servicesByBranch` JS object:
- **Makati Branch:** 9 services (includes orthodontic consultation and braces adjustment)
- **Las Piñas Branch:** 7 services (general services only, no ortho/braces)

Selecting a different branch clears any previously selected reason and re-renders the dropdown. This prevents submitting a reason that the selected branch doesn't offer.

**Decision:** A static JS map was used instead of a backend API call because the static website has no authentication, and the list of services per branch is not expected to change frequently. Dynamic backend fetching would add latency and complexity for marginal benefit at this scope.

**Affected file:** `website/js/BookAppointment.js` — `servicesByBranch` constant, `renderReasonOptions()` function, branch radio `change` listener

### BookAppointment form: backend API payload unchanged
The JS payload sent to `POST /api/website/saveAppointment` preserves all original field names (`appointmentDate`, `appointmentTime`, `durationMinutes`, `fullName`, `phoneNumber`, `location`, `reasonForBooking`) plus the newly added `email`. No backend route names, variable names, or response shapes were changed. The `fullPhoneNumber` field continues to carry the `+63` international format that the backend stores.

**Affected file:** `website/js/BookAppointment.js` — `appointmentData` object in submit handler

---

## Backend — Session: Email field patch for online_appointments_tbl

### email column added to online_appointments_tbl
The website booking form collected an email address but the backend discarded it. Patched to fully support the `email` field end-to-end without altering any existing logic.

**Changes made:**

| File | What changed |
|------|-------------|
| `backend/src/routes/websiteRoutes.js` | Added `email` to `req.body` destructuring; added `email` to `websiteService.saveAppointment()` call. Required-field validation (`appointmentDate`, `appointmentTime`, `fullName`, `phoneNumber`, `location`) left unchanged — `email` is treated as optional at the API level for backward compatibility. |
| `backend/src/services/websiteService.js` | Added `email` to function destructuring; added `email` column to INSERT column list; added `email || null` to INSERT parameters array. Duplicate-check query (by date+time+name+phone) was intentionally left unchanged — email is not part of the uniqueness constraint. |
| `backend/server.js` | (1) Updated `CREATE TABLE IF NOT EXISTS online_appointments_tbl` block to include `email VARCHAR(150) NULL AFTER full_name` — applies to fresh installs. (2) Added `ALTER TABLE online_appointments_tbl ADD COLUMN IF NOT EXISTS email VARCHAR(150) NULL AFTER full_name` startup migration — applies to existing installs without data loss. |
| `backend/schema.sql` | Added `email VARCHAR(150) NULL` to the `online_appointments_tbl` table definition for documentation consistency. |

### email column is nullable
The column is defined as `VARCHAR(150) NULL`, not `NOT NULL`. Reasons: (1) existing rows in the database have no email — a NOT NULL ALTER would require a DEFAULT value or fail; (2) backward compatibility — any direct API calls that omit `email` continue to succeed; (3) frontend already validates email as required, so NULL values in practice only occur for pre-patch submissions.

### No changes to web portal or mobile
`AdminSettings.jsx` renders appointment rows by named property (`appt.full_name`, `appt.phone_number`, etc.). The `listAppointments()` function uses `SELECT *`, so the new `email` column is returned but silently ignored by the React table — no JSX changes needed. Mobile and web portal appointment flows use authenticated `/api/appointments` endpoints, completely separate from `/api/website/saveAppointment`. Neither was touched.

---

## Database

### online_appointments_tbl schema change
Added `email VARCHAR(150) NULL AFTER full_name`. No existing data affected (nullable). Managed via startup migration in `server.js` following the same `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pattern used for `services.description` and `appointments.dentist_note` in earlier sessions.

### No other table changes
`online_inquiries_tbl`, `appointments`, `users`, `patient_profile`, and all other tables are unchanged in this session.

---

## Web Portal (React — `web/`)

### No changes this session
All web portal files (`RecepAppointmentForm.jsx`, `AdminSettings.jsx`, `DentistAppointment.jsx`, etc.) were reviewed for compatibility but not modified. `AdminSettings.jsx` was confirmed safe after the `email` column addition because it accesses appointment data by named property, not by column index.

---

## Mobile (`mobile/`)

### No changes this session
Mobile app was confirmed to have no dependency on `website/` files and no calls to `/api/website/saveAppointment`. All mobile appointment flows use authenticated internal endpoints. No code was modified.

---

## Pending Issues

### API_BASE_URL still set to localhost in website JS
`website/js/HomePage.js` and `website/js/BookAppointment.js` both have `API_BASE_URL = "http://localhost:4000"`. These must be reverted to the production URL before deploying to production, or managed via a build-time environment variable injection.

### Email not displayed in AdminSettings.jsx appointments table
The `AdminSettings.jsx` online appointments table shows Full Name, Phone, Date, Time, Location, Reason, Status, and Action — but not Email. Now that email is captured and stored, the admin table should be updated to display it so clinic staff can follow up with patients by email.

### email field not validated on the backend route
The `POST /saveAppointment` route does not check for a missing or malformed email. Frontend validation ensures it is always sent, but a direct API call bypassing the website can omit it. Consider adding `!email` to the existing required-field check once backward compatibility is no longer a concern.

---

## Dentist Web Features Session (2026-05-17)

### dentist_note stored on appointments, not a separate table
`appointments.dentist_note TEXT NULL` holds the post-visit note that a dentist writes. Stored on the appointment row itself rather than a separate `notes` table because a note is one-to-one with an appointment and joins would add complexity for zero benefit. Auto-migration (`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS dentist_note TEXT NULL`) runs on server startup.

**Affected files:**
- `backend/schema.sql` — dentist_note column added to appointments
- `backend/server.js` — startup ALTER TABLE migration
- `backend/src/routes/appointments.js` — `PATCH /appointments/:id/note` endpoint (dentist-only, only for completed appointments)

### Service Kit modal: one-time consumption, read-only on re-open
After a dentist submits inventory consumption for an appointment, re-opening the kit modal shows a read-only view instead of the submission form. The `GET /inventory/appointments/:appointmentId/consumption` endpoint returns any existing consumption record. The backend returns 409 if `POST /inventory/appointments/:id/consumption` is called a second time. This matches clinic practice: you can't un-consume supplies.

**Affected files:**
- `backend/src/routes/inventory.js` — `GET /inventory/appointments/:appointmentId/consumption`, `POST /inventory/appointments/:id/consumption`
- `web/src/pages/DentistAppointment.jsx` — Service Kit button + modal, note save via `PATCH /appointments/:id/note`

### DentistSchedule rewrite: self-import circular dependency fixed
The original `DentistSchedule.jsx` had `import styles from "./DentistSchedule"` which imported itself. The styles file was a plain object export; fixed by converting to `createDentistScheduleStyles()` (exported function) to match the pattern used by other web style files.

**Affected files:**
- `web/src/pages/DentistSchedule.jsx` — full rewrite
- `web/src/styles/DentistSchedule.js` — converted to `createDentistScheduleStyles()` factory

### DentistRecords connected to my-patients endpoint
Previously a static placeholder. Now fetches from `GET /appointments/_meta/my-patients` which returns DISTINCT patient IDs from appointments where `dentist_id = current_user`, with `last_visit` and `total_appointments` computed via MAX/COUNT in the same query.

**Affected files:**
- `web/src/pages/DentistRecords.jsx`

### My Schedule sidebar link added to all 6 dentist pages
Added `fi-rr-calendar` sidebar link pointing to `/dentistSchedule` across all dentist-role pages (DentistAppointment, DentistRecords, DentistSchedule, DentistViewProfile, DentistMessages, and the dentist dashboard). Route: `/dentistSchedule`.

### DentistViewProfile: Treatment History from completed appointments
Treatment History tab now fetches `GET /appointments?patient_id=X&status=completed` and displays date, service, dentist, and note columns. Uses the same endpoint as the rest of the appointment system — no new endpoint needed. `patient_id` query param was added as a filter to the existing `GET /appointments` route, scoped so dentist role still auto-scopes to their own patients.

**Affected files:**
- `web/src/pages/DentistViewProfile.jsx`
- `backend/src/routes/appointments.js` — `patient_id` filter added to `GET /appointments`

---

## Mobile — DentalTreatmentPlanScreen (2026-05-22, commit fca2790)

### Dental Treatment Plan extracted to its own screen
The Dental Treatment Plan section (FDI tooth chart + plan list) was removed from `PatientRecordsScreen` and given its own dedicated screen `DentalTreatmentPlanScreen`. Reason: PatientRecordsScreen was growing too large and the treatment plan feature is navigated to independently from the sidebar.

**Affected files:**
- `mobile/src/screens/DentalTreatmentPlanScreen.jsx` — new file (269 lines); tooth chart with status colors, plan list, tooth-tap modal, fetches via `getTreatmentPlansByPatient`
- `mobile/src/screens/PatientRecordsScreen.jsx` — removed `getTreatmentPlansByPatient` import, removed `plans`/`loadingPlans`/`plansFetched`/`toothModal`/`selectedTooth` state, removed `fetchPlans()` function and the treatment plan JSX section
- `mobile/src/navigation/AppNavigator.js` — `DentalTreatmentPlan` route registered
- `mobile/src/components/AppSidebar.jsx` — Treatment Plan link added
- `mobile/src/screens/ProfileScreen.jsx` — Treatment Plan link added to inline sidebar
- `mobile/src/screens/MessagesListScreen.jsx` — Treatment Plan link added to inline sidebar

### Styles reused from PatientRecordsScreen
`DentalTreatmentPlanScreen` imports `s from '../styles/PatientRecordsScreen'` rather than defining new styles. Keeps visual consistency with the rest of the patient record screens and avoids duplicating the tooth box, badge, and chart styles.

### Android keyboard: ScrollView wraps KeyboardAvoidingView content
On Android, `KeyboardAvoidingView` with `behavior='padding'` (iOS default) leaves inputs hidden behind the keyboard. Fixed by switching to `behavior='height'` on Android and wrapping the inner view in a `ScrollView` with `keyboardShouldPersistTaps="handled"`. This lets the user scroll inputs into view when the keyboard appears.

**Affected files (same pattern applied to all auth screens):**
- `mobile/src/screens/LoginScreen.jsx`
- `mobile/src/screens/RegisterScreen.jsx`
- `mobile/src/screens/ForgotPasswordScreen.jsx`
- `mobile/src/screens/ResetPasswordScreen.jsx`
- `mobile/src/styles/LoginScreen.js` — added `scrollView` style, changed `inner` from `flex: 1` to `flexGrow: 1`
- `mobile/src/styles/RegisterScreen.js`, `ForgotPasswordScreen.js`, `ResetPasswordScreen.js` — same pattern

---

## Web — AdminEmployeeForm + AdminEmployees (2026-05-22, commit 4ac8030)

### AdminEmployeeForm: form validation before submit
Before calling `POST /auth/staff-profiles`, the form now validates required fields per role type. Required fields per role:

- **Dentist:** branchId, department, startDate, employmentType, shiftType + personal fields (firstName, lastName, birthday, gender, contact, email, homeAddress)
- **Dental Assistant:** branchId, daDepartment, daStartDate, daEmploymentType, daShiftType + personal fields
- **Receptionist:** branchId, startDate, employmentType, recepShiftType + personal fields

Validation errors are tracked in a `formErrors` Set (field names as keys). Invalid fields get a red border and a `*` asterisk beside the label. A modal with "Please fill in all required fields" appears instead of proceeding to submit. `alert()` replaced throughout with modals (`showSuccessModal`, `showErrorModal`).

**Affected files:**
- `web/src/pages/AdminEmployeeForm.jsx`
- `web/src/styles/AdminEmployeeForm.js` — added `workItemHeader` and `removeWorkBtn` styles

### AdminEmployeeForm: branch-filtered specialization dropdown
When the admin selects a branch, the specialization/department dropdown for dentists now calls `GET /auth/branch-services/:branchId` to load only service categories offered at that branch. Falls back to all active service categories if the branch has no dentists with assigned services yet.

**New backend endpoint:** `GET /auth/branch-services/:branchId` (admin-only)
- Joins `services → dentist_services → user_branches` filtered by `branch_id`
- Falls back to `SELECT DISTINCT category FROM services WHERE status = 'Active'` if result is empty

**Affected files:**
- `backend/src/routes/auth.js` — new route added
- `web/src/pages/AdminEmployeeForm.jsx` — fetches on branch select

### AdminEmployeeForm: save to database now functional
`POST /auth/staff-profiles` (existing route) now receives `branch_id` and `staffProfile` correctly for all three role types. On success, navigates to `/adminEmployees` instead of `/adminSettings` (dental assistants previously went to settings). After navigation, the employee list in `AdminEmployees.jsx` reloads to show the new row.

### auth.js: formatMysqlDate helper for date serialization
`birthday` and `start_date` columns returned by `mapStaffProfileRow` were raw MySQL Date objects, which Express serialized as ISO datetime strings (`2000-01-01T00:00:00.000Z`). The frontend date inputs expected `YYYY-MM-DD` only. Fixed by adding `formatMysqlDate(value)` helper that extracts just the date portion regardless of whether the value is a JS Date or a string.

**Affected file:** `backend/src/routes/auth.js`

### AdminEmployees: edit validation + error modal
`handleSaveEmployeeChanges` now calls `validateEditFields()` before patching. Required fields for editing: `firstName`, `lastName`, `homeAddress`, `contactNumber`, `email`, `birthday`, `gender`, `startDate`, `employmentType`. Errors tracked in `editErrors` Set; invalid fields get red border and `*` on label. `showEditErrorModal` state replaced the previous `alert()` calls for both validation failures and API errors.

**Affected file:** `web/src/pages/AdminEmployees.jsx`

---

## Web — Inventory Cross-Category Search (2026-05-22, commit 4ac8030)

### Search now spans all three inventory categories simultaneously
Previously, the search input filtered only the active tab's rows. Now when search is active (`searchValue.trim().length > 0`), a unified `crossCategoryResults` array is computed across all three categories (medicine, equipment, supplies) and a `renderCrossSearchTable()` view replaces the tabbed table. Each result row shows a "Type" badge (Dental Medicine / Dental Equipment / Dental Supplies) alongside the standard item columns.

**Key implementation details:**
- `crossCategoryResults` — `useMemo` merges filtered rows from all three categories, each tagged with `_type` and `_name`
- `currentPages.search` — separate pagination counter for cross-search results (reset when `searchValue` changes)
- `openEditModalCross(item, type)` — opens the existing edit modal for a cross-search result, mapping `_type` to the correct item shape
- When search is cleared, the tabbed table view restores without losing the current tab or its page position
- Search placeholder updated to "Search across all inventory categories"

**Affected file:** `web/src/pages/InventoryPage.jsx`

---

## Web — Expense Input Modal in Inventory (this session)

### Expense Input moved from AdminReports to InventoryPage
The Expense Input form (purchase expenses for inventory items) was previously embedded as a sidebar `<aside>` panel inside the Revenue/Income/Expense report section in `AdminReports.jsx`. It has been moved to `InventoryPage.jsx` as a standalone modal, accessible via an "Expense Input" button beside "View Stock Summary." Button is Admin-only (hidden from `isReceptionist`).

**Decision:** Inventory is the natural home for recording purchases of dental supplies, medicines, and equipment — not a financial report. The report page's job is to display aggregated numbers, not to accept new data.

**Affected files:**
- `web/src/pages/InventoryPage.jsx` — Expense Input button, Expense Input modal, Expense Confirm modal, all supporting state and helpers
- `web/src/pages/AdminReports.jsx` — entire Expense Input `<aside>` panel removed; `RevenueReportSection` props and signature simplified; expense-related state/functions/useMemos removed; `useEffect` simplified to load branches only (not inventory rows)

### Expense Input modal: branch scoping is correct end-to-end
Branch selection in the Expense Input form (`expenseForm.branchId`) is sent as `branch_id` in the POST payload to `POST /inventory/purchase-expenses`. The backend:
1. Parses `branchId = Number.parseInt(branch_id, 10)`
2. Validates via `validateBranchAccess(req, branchId)` — returns 403 if user lacks access
3. Uses `branchId` in all three category INSERT statements (medicine/equipment/supplies)
4. Uses `branchId` for lookup (`WHERE branch_id = ?`) when checking if an item already exists
5. Uses `branchId` in `clinic_expenses` and `audit_logs` INSERTs

GET inventory routes use `inventoryBranchFilter(req, req.query.branch_id)` for correctly scoped display. No backend changes were needed — scoping was already correct.

### Expense Input: datalist IDs scoped to avoid conflicts
The expense modal in InventoryPage uses `datalist` IDs `"inv-expense-item-options"` and `"inv-expense-supplier-options"` — distinct from AdminReports which used `"expense-item-options"` and `"expense-supplier-options"`. This prevents browser autocomplete conflicts if both pages are open in different tabs.

### refreshExpenseFormOptions fetches all branches (not branch-scoped)
`refreshExpenseFormOptions` loads `listMedicines()`, `listEquipment()`, `listSupplies()`, and `api.get('/auth/branches')` without a branch filter. This is intentional for Admin — the admin selects which branch they're recording the expense for, so all branches must appear in the dropdown. The item name and supplier dropdowns are then filtered client-side by the selected branch using `expenseItemOptions` useMemo.

**Affected files:**
- `web/src/pages/InventoryPage.jsx`
- `web/src/pages/AdminReports.jsx`

---

## Pending Issues (updated 2026-05-23)

### API_BASE_URL still set to localhost in website JS
`website/js/HomePage.js` and `website/js/BookAppointment.js` both have `API_BASE_URL = "http://localhost:4000"`. Must be reverted to the production URL before deploying.

### Email not displayed in AdminSettings.jsx appointments table
The online appointments table in `AdminSettings.jsx` does not show the `email` column that was added to `online_appointments_tbl`. Should be added so staff can follow up by email.

### email field not validated on the backend saveAppointment route
`POST /saveAppointment` does not check for a missing or malformed email. Frontend enforces it; consider adding server-side validation once backward compatibility is no longer required.

### Push notifications require EAS dev build
In-app notifications work fully in Expo Go. Push notifications (lock-screen banners) require an EAS development build — three lines in `mobile/src/auth/AuthContext.js` remain commented out pending the EAS build. No backend changes needed when re-enabling.

### AdminEmployeeForm: Dental Assistant role type not fully wired in form UI
The form renders a role type selector (Dentist / Dental Assistant / Receptionist) but the Dental Assistant-specific form sections (assigned dentist dropdown, DA-specific department/shift fields) are partially scaffolded. Full DA form fields should be reviewed for completeness before production use.

### cron-admin endpoints should be removed or gated before production
`POST /api/cron-admin/run-appointment-reminders` and `POST /api/cron-admin/run-recall-reminders` are admin-only but were added for development convenience. Should be removed or moved behind an env-flag before production deployment.

---

## Web — AdminEmployees View/Edit Modal + AdminEmployeeForm Section 3 Audit & Fix (2026-05-23)

### AdminEmployees modal: Section 3 now shows role-specific fields
The View/Edit employee modal in `AdminEmployees.jsx` was missing two Section 3 fields that exist in the creation form:
- **Dentist:** "Specialization / Department" — the branch-specific category selected during registration
- **Dental Assistant:** "Department" + "Assigned Dentist"

Fixed by adding a role-conditional row in the modal's Section 3, right after the Start Date + Assigned Branch row. Uses `modalField('Specialization / Department', 'specialization', ...)` for Dentist and `modalField('Department', 'specialization', ...)` + `modalField('Assigned Dentist', 'assignedDentist')` for Dental Assistant. Receptionist required no change — its Section 3 fields were already complete. No existing fields, routes, API calls, or modal styling were touched.

**Affected file:** `web/src/pages/AdminEmployees.jsx`

### Section 3 audit: what saves correctly vs what was missing
A full audit of `AdminEmployeeForm.jsx → POST /auth/staff → DB` confirmed:

**All `staff_profile` columns save correctly end-to-end:** `branch_id`, `specialization`, `start_date`, `employment_type`, `shift_type`, `work_days` (array → comma-joined string), `work_start_time`, `work_end_time`. Branch also correctly populates `users.home_branch_id` and `user_branches`.

**Two critical gaps identified — data collected by the form but never written to secondary tables:**

1. **`dentist_schedules` not populated.** `POST /auth/staff` saved work days and times to `staff_profile` but never inserted rows into `dentist_schedules`. New dentists created via the form were invisible to the appointment scheduler.

2. **`dentist_services` not populated.** The Section 3 "Specialization / Department" dropdown selects a `services.category` value. All services under that category should be linked to the new dentist in `dentist_services`, but the backend did nothing with that value after storing it in `staff_profile.specialization`.

**Minor inconsistency (non-blocking):** `GET /auth/staff-profiles` (list endpoint) does not JOIN `dentist_services`, so `serviceNames` is always `''` in the employee list view. `fetchStaffProfileBy` (used for individual/update endpoints) does include the JOIN. Noted but not fixed in this session.

### Section 3 gaps fixed: dentist_schedules and dentist_services now populated on create
Two-part fix: frontend sends `department` as its own field; backend uses it after the staff_profile INSERT.

**Frontend change (`AdminEmployeeForm.jsx`):** Added `department: isDentist ? (payload.department || null) : null` to the `POST /auth/staff` payload. `payload.department` is the form field name for the Section 3 dropdown — kept separate from `staffProfile.specialization` (which merges Section 2 free-text specialization and Section 3 department). Section 2's `specialization` field is not touched and continues to save to `staff_profile.specialization` only.

**Why `department` is sent separately and not reused from `staffProfile.specialization`:** `staffProfile.specialization` is built as `payload.specialization || payload.department` — if the admin fills in the Section 2 free-text specialization field, that value takes priority and the department category name is lost. Sending `department` as its own top-level field guarantees the backend always receives the exact `services.category` string needed for the `dentist_services` lookup.

**Backend change (`auth.js` — `POST /auth/staff`):** After the `staff_profile` INSERT, a `role === 'dentist'` block runs two operations:

1. **`dentist_schedules`:** Converts the `work_days` array (day names like `"Monday"`) to weekday integers using a `DAY_TO_WEEKDAY` map (`Sunday=0, Monday=1 … Saturday=6`) matching the seed's convention. Inserts one row per selected day with `work_start_time` and `work_end_time`. Only fires when at least one day and both times are present.

2. **`dentist_services`:** Queries `SELECT id FROM services WHERE category = ? AND status = 'Active'` using `department`. Inserts each result via `INSERT IGNORE INTO dentist_services` — safe if a row already exists.

Receptionist creation is unaffected — `department` is `null` for that path and the entire dentist-only block is skipped.

**Affected files:**
- `web/src/pages/AdminEmployeeForm.jsx` — `department` added to `/auth/staff` payload
- `backend/src/routes/auth.js` — `department` destructured from `req.body`; `dentist_schedules` and `dentist_services` inserts added after staff_profile INSERT in `POST /staff`













