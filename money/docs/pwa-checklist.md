# PWA Smoke Test Checklist

Use after `npm run build && npm run preview` (or staging deploy).

**Device widths to spot-check:** 360×800, 390×844, 430×932

---

## 1. Install

- [ ] Chrome DevTools → Application → Manifest shows no errors
- [ ] `name`, `short_name`, `theme_color`, `display: standalone` correct
- [ ] Icons 192 + 512 present and reasonable file size (< 200 KB for 512)
- [ ] "Install app" / Add to Home Screen works on mobile Chrome
- [ ] Installed app opens in standalone mode (no browser URL bar)
- [ ] `apple-touch-icon.png` loads on iOS Safari (Add to Home Screen)

## 2. Service Worker

- [ ] Application → Service Workers shows `/sw.js` **activated and running**
- [ ] `registerSW.js` present, no console errors on load
- [ ] Precache list includes JS, CSS, icons, `offline.html`, manifest
- [ ] Cache names use version prefix e.g. `hinakko-v0-1-0-*`

## 3. Offline Shell

Prerequisite: visit app online first (populate cache).

- [ ] DevTools → Network → **Offline**
- [ ] Reload — app shell loads (no blank white screen)
- [ ] Bottom navigation visible and tappable
- [ ] Navigate between `/`, `/calendar`, `/categories`, `/settings` — cached routes respond
- [ ] Network banner shows: **"คุณออฟไลน์อยู่ — ข้อมูลอาจไม่เป็นปัจจุบัน"**

## 4. Offline Fallback

- [ ] With Offline enabled, hard refresh on uncached deep link OR wait for loader failure
- [ ] `offline.html` or React `OfflineFallback` appears with Thai copy
- [ ] **ลองใหม่** button reloads page
- [ ] **กลับหน้า Dashboard** navigates to `/`
- [ ] `/offline` route renders fallback component

## 5. Back Online

- [ ] Disable Offline in DevTools
- [ ] Banner shows **"กลับมาออนไลน์แล้ว"** then auto-dismisses (~3s)
- [ ] Dashboard data loads after refresh

## 6. Update Available

- [ ] Deploy/build a new version (bump `package.json` version + rebuild)
- [ ] With old tab open, reload until SW detects update
- [ ] Bottom sheet **"มีเวอร์ชันใหม่"** appears
- [ ] **Refresh** applies update and reloads
- [ ] Old version caches cleaned (check Application → Cache Storage)

## 7. Mobile Safe Area & Layout

Test on real device or DevTools device emulation:

- [ ] Content not hidden under notch (safe-top on headers)
- [ ] Bottom nav not clipped by home indicator (safe-bottom)
- [ ] FAB (+) not overlapping last list item (pb-nav padding)
- [ ] Bottom sheets respect safe area (`pb-safe`)
- [ ] Form keyboard does not permanently hide submit button (scroll/pb-form)
- [ ] No horizontal overflow at 360px width

## 8. Dark Mode

Toggle Settings → Theme → Dark (or System dark):

- [ ] Dashboard, Calendar, Reports, Settings readable
- [ ] Cards, dividers, inputs use dark surfaces
- [ ] Bottom sheet / confirm dialog contrast OK
- [ ] Offline fallback readable in dark mode

## 9. Regression

- [ ] Add / Edit / Delete works online
- [ ] Offline: add transaction → banner shows pending count → reconnect → sync toast
- [ ] Category budgets: set in Settings → progress bar on Dashboard Category tab
- [ ] FinDash template switches without layout break
- [ ] Settings persist after reload (Zustand localStorage)
- [ ] `npm run typecheck` passes
- [ ] `npm run build` completes without SW warnings

---

**Sign-off:** _______________ **Date:** _______________ **Build version:** _______________
