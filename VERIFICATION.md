# Lewa Conservancy — Final Verification Report

Date: 27 September 2026  
Project: `uirmyjylromlifuitrkw` (`https://uirmyjylromlifuitrkw.supabase.co`)  
Scope: Foundation MVP + Paystack wiring (not live keys, not store submission)

## How this was verified

- Live schema, RLS, triggers, seed counts, and storage buckets queried on the linked Supabase project.
- Anon REST probes for public content, booking isolation, and Edge Function auth.
- Admin dashboard production build (`admin/`: `tsc -b && vite build` succeeded) and browser login on `http://127.0.0.1:4173/`.
- Mobile `tsc --noEmit` succeeded (Deno Edge Function sources excluded from the Expo tsconfig).
- Paystack checkout was not charged: `PAYSTACK_SECRET_KEY` and `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` are still empty.

## Live backend snapshot

| Table | RLS | Rows |
| --- | --- | --- |
| wildlife_species | on | 7 |
| tourism_services | on | 6 |
| events | on | 4 (all have `image_url`) |
| donation_campaigns | on | 3 |
| conservation / education / community | on | 4 / 4 / 4 |
| faqs / announcements / about_content | on | 6 / 3 / 4 |
| notifications | on | 2 broadcasts |
| profiles | on | 2 (visitors) |
| bookings / donations / payments / feedback | on | 0 |
| site_settings | on | 1 |

Storage buckets (public read): `wildlife`, `tourism`, `events`, `donations`, `content`, `avatars`.

Auth trigger `on_auth_user_created` creates a `visitor` profile. Booking insert trigger `bookings_trusted_amount` overwrites client-supplied amounts from the service price.

Migrations applied: `init_and_profiles` → `content_tables` → `operational_tables` → `rls_policies` → `storage_buckets` → seed_* → `harden_security_definer` → `lewa_gap_fill` → `harden_trusted_amount_search_path`.

Edge Functions (ACTIVE):

- `paystack-initialize` (JWT)
- `paystack-verify` (JWT)
- `paystack-webhook` (no JWT; HMAC)
- `admin-notify` (JWT, staff-only)

Webhook URL for Paystack dashboard:

`https://uirmyjylromlifuitrkw.supabase.co/functions/v1/paystack-webhook`

## Currency

`formatCurrency` on mobile and admin prints `KSh` / `en-KE`. Seeded tourism and donation amounts are Kenyan magnitudes (e.g. Sunrise Game Drive **KSh 18,000**; Protect a Rhino goal **KSh 32,500,000**). No `$` / USD display fields remain on wired screens.

## E2E flow results

| Flow | Result | Evidence |
| --- | --- | --- |
| Register → profile | **Working** | Auth signup creates `auth.users` + `profiles` row (`visitor`, `active`). One real visitor profile already exists; a second visitor was created during this pass (`lewa.staff.mvp@example.com`). |
| Login | **Working** | Password grant returns a session. Admin login form accepts the same project. |
| Browse tourism / wildlife / events / donations | **Working** | Anon REST 200; screens read `src/services/*` (no mock fallbacks). |
| Book → Paystack → confirmation → admin | **Partially Working** | Booking UI + intent + initialize/verify/webhook code path exist. Anon insert is blocked by RLS (HTTP 401 / `42501`). Checkout cannot complete until Paystack secrets are set. No booking/payment rows yet. |
| Donate → pay → confirmation | **Partially Working** | Same as bookings: intent + Edge Functions ready; secrets missing; zero donation rows. |
| Event register | **Working** (code + schema) | Screen writes `event_registrations`; table empty until a signed-in user registers. |
| Feedback submit | **Working** (code + schema) | Screen writes `feedback`; staff can reply/status in admin. |
| Notifications appear | **Partially Working** | Two seed broadcasts exist; in-app list + preferences persist. Device push (`expo-notifications` / `device_push_tokens`) is not fully registered. |
| Admin update wildlife → mobile | **Partially Working** | Admin Wildlife CRUD is implemented against `wildlife_species`. Staff-only write RLS is in place. Browser login as visitor correctly showed **Staff access only**. Role promotion to exercise staff CRUD was not applied (operator approval required). |
| RLS: visitor cannot read others’ bookings | **Working** | Anon `GET /bookings` returns `[]`. Anon `POST /bookings` is rejected. Owner/staff policies exist (`bookings_owner_or_staff_read`, `bookings_owner_insert`). |
| Paystack initialize without session | **Working** (denied) | `401 UNAUTHORIZED_NO_AUTH_HEADER`. |

## Per-module status

Statuses: **Working** / **Partially Working** / **UI Only** / **Missing** / **Broken**.

### Mobile (Expo)

| Module | Status | Notes |
| --- | --- | --- |
| Auth (sign in / create account / session gate) | Working | Secure session via AsyncStorage; guest browse allowed. |
| Home | Working | Live featured wildlife, tourism, events, campaigns; loading/error states. |
| Explore (wildlife, tourism, events, education) | Working | Service-backed lists and detail routes. |
| Wildlife detail | Working | Images use `ImageWithFallback`. |
| Tourism detail + booking | Partially Working | Booking form + trusted amount trigger. Payment blocked on missing Paystack secret. |
| My bookings | Working | Empty state until a paid/pending booking exists. |
| Donations list / detail / success | Partially Working | Campaigns live in KSh. Checkout blocked on secrets. |
| Events + registration | Working | All four events have images. |
| Conservation / Education / Community | Working | Seeded content, loading/error. |
| About Us | Working | New screen; Profile row wired. |
| Help & FAQ | Working | Live FAQs; category chips follow loaded data. |
| Feedback | Working | Auth required to submit. |
| Search | Working | `src/services/search` — not the leftover mock helper. |
| Profile | Working | About, payments, bookings, donations, preferences are real routes. |
| Edit profile | Partially Working | Name/fields persist on `profiles`. Auth email is not changed from this screen. |
| Notification preferences | Working | Row upsert on `notification_preferences`. |
| In-app notifications | Partially Working | DB list + read state; OS push token registration incomplete. |
| Payment methods / receipts | Working | Lists the signed-in user’s `payments` (empty until checkout). |
| Maps | Missing | Explicitly out of scope. |

### Admin (`admin/`)

Vite + React + TypeScript + Tailwind, same Supabase project. `npm run build` succeeded.

| Module | Status | Notes |
| --- | --- | --- |
| Auth + role gate | Working | Visitors see “Staff access only” (verified in browser). |
| Dashboard overview | Working | Live counts + bar chart. |
| Users / roles | Working | Admin+ only. Super-admin can elevate roles. |
| Wildlife | Working | Create/upsert + delete; `status = published`. |
| Tourism / accommodation | Working | Combined module; KSh prices; `per_guest` / `per_booking`. |
| Bookings | Working | Status updates; empty until payments run. |
| Events | Working | Create + delete. |
| Conservation / Education / Community | Partially Working | Create + list + delete. Extra fields (category, reading time) are display-only on create. |
| Donations + gifts | Partially Working | Read campaigns and gifts; no campaign editor form yet. |
| Payments | Working | Admin+ read of payment rows. |
| Notifications broadcast | Working | Invokes `admin-notify`. |
| Feedback | Working | Status + reply. |
| Content (FAQ / announcements / About) | Partially Working | FAQ/announcements are read-only tables; About body is editable. |
| Settings | Working | `site_settings.general` JSON. |
| Reports | Partially Working | Summary cards from payments (no deep charts). Labeled as MVP tables. |
| Audit log | Partially Working | Viewer only. No mutation trigger writes `audit_logs` yet (0 rows). |

### Payments

| Piece | Status | Notes |
| --- | --- | --- |
| Amount authority | Working | Server recomputes from DB; client amount ignored. |
| Initialize / verify / webhook functions | Working (deployed) | Will return 500 until `PAYSTACK_SECRET_KEY` is set in Supabase secrets. |
| Mobile WebBrowser checkout | Partially Working | Wired; cannot finish without keys. |
| Webhook signature | Working (code) | HMAC SHA512; configure the same secret in Paystack. |

## Bugs found and fixed in this pass

- Home used `LoadingState message=…`; the component only accepts `label`. Fixed.
- FAQ chips compared against a stale default category before FAQs loaded. Selection now follows `activeCategory`.
- Wildlife admin upsert omitted `status`, which is a required `content_status` column. Now writes `published`.
- Expo `tsc` failed on Deno Edge Function imports. `supabase/functions` is excluded from the app tsconfig.
- `bookings_set_trusted_amount` had a mutable `search_path` (Supabase advisor). Pinned to `public`.

## Remaining gaps (do these next)

1. **Paystack test keys** — set `PAYSTACK_SECRET_KEY` (and optional webhook secret) as Supabase Edge Function secrets; set `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` in `hafsa-lewa/.env`. Then book and donate once with a Paystack test card.
2. **Promote a staff user** (first signup is always `visitor`):

   ```sql
   update public.profiles
   set role = 'super_admin'
   where email = 'you@example.com';
   ```

   A visitor test login `lewa.staff.mvp@example.com` was created during verification. Promote it or delete it from Auth.
3. **Audit writes** — add a trigger or wrap admin mutations so `audit_logs` is not an empty viewer.
4. **Push notifications** — register Expo tokens into `device_push_tokens` and send via a provider.
5. **Advisor leftovers** — `citext` lives in `public`; `is_staff` / `is_admin` / `is_super_admin` / `current_user_role` are executable by `anon` (they only return the caller’s role). Enable leaked-password protection in Auth.
6. **Assets** — seed still uses Unsplash URLs; Storage buckets are ready for licensed Lewa photography.
7. **FAQ / announcement admin create** and **donation campaign editor** are list-first, not full CRUD.

## How to run

Mobile:

```bash
cd hafsa-lewa
npx expo start
```

Admin:

```bash
cd admin
npm run dev
```

Do not commit `.env` files. Paystack secrets stay in Supabase / local env only.
