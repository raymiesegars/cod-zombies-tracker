# BO2 Setup: New Challenges & Categories

BO2 maps now support No Magic, round speedruns (R30/R50/R70/R100/R200), and Easter Egg speedruns. If you don't see these options when logging runs, your database needs to be updated.

## For existing databases

Run the BO2 balance patch to add the new challenges and achievements:

```bash
# 1. Apply the migration (adds NO_MAGIC enum and bo2BankUsed column)
pnpm db:migrate:deploy

# 2. Run the BO2 balance patch to create missing challenges and achievements
pnpm db:bo2-balance-patch
```

Use `--dry-run` to preview changes without writing:

```bash
pnpm exec tsx scripts/bo2-balance-patch.ts --dry-run
```

## For fresh database seeds

If you run `pnpm db:seed` on a fresh database, the seed now creates all BO2 challenges (including No Magic and speedruns) automatically. You can still run the balance patch afterward to ensure achievements are correct.
