# Deploy to production (safe checklist)

Use this when you deploy the latest `main` to production. Database migrations are **additive and safe** (no data loss).

## 1. On production server (or your deploy pipeline)

- **Pull latest**
  ```bash
  git fetch origin && git checkout main && git pull origin main
  ```

- **Install dependencies** (if needed)
  ```bash
  pnpm install
  ```

- **Run database migrations** (adds new columns only; does not delete data)
  ```bash
  pnpm prisma migrate deploy
  ```
  This applies only **pending** migrations. Included in this release:
  - `multiple_proof_urls`: adds `proofUrls` array, backfills from old `proofUrl`, then drops old columns (safe).
  - `avatar_preset`: ensures `User.avatarPreset` exists (ADD COLUMN IF NOT EXISTS). No existing data is touched.

- **Regenerate Prisma client** (if you run migrations manually before build)
  ```bash
  pnpm prisma generate
  ```

- **Build and start** (or restart your process manager)
  ```bash
  pnpm build && pnpm start
  ```
  Or however you run the app (e.g. PM2, Docker, Vercel will run build automatically).

## 2. What changed (this release)

- **Proof URLs**: Challenge and Easter Egg logs now use a `proofUrls` array; old single `proofUrl` was migrated into it, then dropped.
- **Avatar presets**: Users can pick a preset avatar (e.g. Perkaholic, Vacuum) in Settings. New column `User.avatarPreset`; existing users keep their current avatar until they change it.
- **Copy**: "Donations" → "tips" for Ko-fi.
- **UI**: Gobble gum preset avatars, settings layout, and related fixes.

## 3. Rollback (if something goes wrong)

- Redeploy the previous `main` commit.
- **Do not** run `prisma migrate reset` on production (that wipes the DB).
- If you must revert a migration, do it manually or with a new migration that reverses the change; ask if you need a rollback migration.
