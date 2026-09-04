# سیستەمی ئامادەبوونی کارمەندان — Supabase Edition

This package changes the existing browser SQLite app so the complete SQLite database is also saved in Supabase.

## Files
- `سیستەمی ئامادەبوونی کارمەندان.html` — updated application.
- `supabase_setup.sql` — creates the Supabase table and RLS policies.
- `README.txt` — setup steps.

## Setup
1. Create a Supabase project.
2. Open the project's **SQL Editor**.
3. Copy/paste all of `supabase_setup.sql` and run it.
4. In Supabase, get the project URL and the browser-safe **Publishable/Anon key** from the API settings.
5. Open the HTML page.
6. Login as the admin (the existing default is `1234` if you have not changed it).
7. Open ⚙️ Settings -> Supabase.
8. Enter the Project URL and Publishable/Anon key, then save/connect.
9. Press the sync button. Existing local data will be uploaded if no cloud copy exists.

## How it works
The app still uses sql.js locally for the existing interface. Every change calls the existing local save and then schedules a Supabase upload. The complete SQLite database is encoded and stored in `attendance_app_state.db_base64`. On startup, if a cloud copy exists, it is downloaded and loaded into the app.

## Important security note
This is a browser-only architecture. The Supabase key used in HTML must be a browser-safe Publishable/Anon key, never a service-role/secret key. Supabase recommends protecting exposed tables with Row Level Security; the included SQL enables RLS and limits the row to this app identifier. Because the app identifier and browser key are visible to the browser, this should be treated as a private/small deployment rather than a high-security multi-user system. For stronger security, add Supabase Auth and per-user RLS or put writes behind an Edge Function/server.

## Hosting
You can host the HTML on GitHub Pages or another static host. Supabase is the cloud database; the HTML does not need a Python backend.

Official Supabase JavaScript CDN is loaded from jsDelivr using the supported `@supabase/supabase-js@2` CDN approach.
