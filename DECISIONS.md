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











## Ideas / future work (deferred)

### Day 5 polish list
- "See more options" button on AI suggestions screen — refetches with current top 3 excluded so patient can browse alternatives







