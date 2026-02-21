# Production deployment checklist

## Before merging to main

- [ ] Test on dev
- [ ] Run migrations on dev (if not already): `pnpm run db:migrate`

## After merging & switching env to production

1. **Point env to production DB**
   - Update `.env` or `.env.local` with production `DATABASE_URL` and `DIRECT_URL` (and any other production vars: Supabase, etc.)

2. **Verify which DB you're hitting**
   ```bash
   pnpm run db:verify
   ```
   Confirm the host is your production DB.

3. **Apply pending migrations**
   ```bash
   pnpm run db:migrate:deploy
   ```
   Applies all pending migrations without creating new ones.

4. **Seed base data (only if production DB is fresh or missing games/maps)**
   ```bash
   pnpm run db:seed
   ```
   Skip if you've already seeded production before.

5. **Add / update IW content (Zombies in Spaceland)**
   ```bash
   pnpm run db:add-iw
   ```
   Safe to run every deploy. Creates or updates: IW game, ZIS map, challenges (including speedrun types), map achievements, speedrun tier achievements (and updates their XP if definitions changed). No truncation.

6. **Optional: Easter egg seed**
   ```bash
   pnpm run db:seed:easter-eggs
   ```
   Only if you use the easter-egg seed and production needs it.

7. **Deploy the app** (Vercel, etc.)

---

### Migration included in this deploy

- **`add_friends_and_presence`**: FriendRequest table, lastSeenAt on User, new NotificationType values, friendRequestId on Notification
