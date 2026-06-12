# Deploy Guide — Hinakko Expense v0.2.0

## Pre-deploy checklist

```bash
npm run db:push      # apply budgets table migration
npm run typecheck    # must pass
npm run build        # generates SW with hinakko-v0-2-0 cache prefix
npm run preview      # smoke test at http://localhost:4173
```

Use [docs/pwa-checklist.md](./pwa-checklist.md) on real devices (360 / 390 / 430, Android Chrome, iOS Safari).

## v0.2.0 highlights

- **Category budgets** — Settings → งบต่อหมวด
- **Offline queue** — create/update/delete while offline, auto-sync on reconnect
- **FinDash template** — Settings → เทมเพลตดีไซน์ → FinDash
- **BottomSheet portal** — overlay renders correctly (no full-black backdrop bug)
- **PWA cache** — bump `package.json` version to invalidate old caches

## Deploy steps

1. Bump version in `package.json`
2. `npm run build`
3. Upload `dist/client/` to static host
4. Verify `/sw.js` serves with new cache prefix
5. Test install + offline shell + update sheet on staging

## Post-deploy smoke (5 min)

- [ ] Dashboard loads, tab switch smooth (no haptic jank)
- [ ] Hamburger menu sheet — dimmed backdrop, not solid black
- [ ] Set a category budget → progress bar on Category tab
- [ ] Airplane mode → add transaction → toast "บันทึกออฟไลน์" → reconnect → sync toast
- [ ] Switch to FinDash template → dark nav + purple FAB
