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