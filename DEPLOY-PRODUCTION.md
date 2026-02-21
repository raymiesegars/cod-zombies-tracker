# Production deployment checklist

## Before merging to main

- [ ] Test on dev
- [ ] Run migrations on dev (if not already): `npm run db:migrate`

## After merging & switching env to production

1. **Point env to production DB**
   - Update `.env` or `.env.local` with production `DATABASE_URL` and `DIRECT_URL`

2. **Verify which DB you're hitting**
   ```bash
   npm run db:verify
   ```
   (Confirm the host is your production DB.)

3. **Apply pending migrations**
   ```bash
   npm run db:migrate:deploy
   ```
   This applies all pending migrations (e.g. `add_friends_and_presence`) without creating new ones.

4. **Deploy the app** (Vercel, etc.)

---

### Migration included in this deploy

- **`add_friends_and_presence`**: FriendRequest table, lastSeenAt on User, new NotificationType values, friendRequestId on Notification
