# Lewa staff dashboard

Vite + React + TypeScript + Tailwind admin for the same Supabase project as the Expo app.

## Run

```bash
cd admin
cp .env.example .env   # if needed — already contains the project URL + anon key
npm install
npm run dev
```

Open the printed localhost URL. Sign in with a staff, administrator, or super_admin account.

First mobile sign-up creates a `visitor` profile. Promote yourself in SQL:

```sql
update public.profiles
set role = 'super_admin'
where email = 'you@example.com';
```

## Role gates

- **staff** — content, bookings, events, donations, notifications, feedback, audit viewer
- **administrator** — plus users, payments, reports, settings
- **super_admin** — plus role elevation and creating staff or administrator logins (Users page)

## Paystack

Payment rows appear after a verified booking or donation. Set `PAYSTACK_SECRET_KEY` as a Supabase Edge Function secret before testing checkout.
