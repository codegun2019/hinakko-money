# Changelog

## v0.4.0 — Calendar, recurring, PWA install (2026-05-30)

### ใหม่
- **Calendar heatmap** — สีแดงเข้มตามความหนาแน่นรายจ่ายรายวัน
- **Swipe คัดลอกรายการ** — ทำซ้ำเป็นวันนี้จาก Dashboard, Calendar, Categories
- **PWA install banner** — แนะนำติดตั้งหลังบันทึกครบจำนวนที่กำหนด
- **รายการซ้ำรายเดือน** — ตั้งกฎ + แจ้งเตือนเมื่อถึงกำหนด (บันทึกจาก Settings)

### หมายเหตุ
- ต้องรัน `npm run db:push` ครั้งแรกเพื่อสร้างตาราง `recurring_rules`

---

## v0.3.0 — UX refresh (2026-05-30)

### ใหม่
- **Quick Add Sheet** — กด FAB แล้วบันทึกด่วน (จำนวน + หมวด + ช่องทางจ่าย)
- **ทำซ้ำรายการล่าสุด** ใน Quick Add
- **Hero Insight** — เปรียบรายจ่ายกับเดือนก่อน + progress bar งบรวม
- **การแจ้งเตือนจริง** — budget ใกล้เต็ม/เกิน, offline queue, แนวโน้มรายจ่าย
- **Import JSON** — นำเข้าข้อมูลจากไฟล์ export

### การตั้งค่า
- **Add transaction flow** — เลือกได้ระหว่าง *Quick sheet* (ค่าเริ่มต้น) กับ *Full page form*

### เก็บ v0.2 ไว้
- หน้า `/add` และฟอร์มเต็มยังใช้ได้
- ตั้งค่า → **เพิ่มรายการ** → **หน้าเต็ม (Classic)** เพื่อกลับพฤติกรรม v0.2
- ใน Quick Add มีลิงก์ **เปิดฟอร์มเต็ม (แบบเดิม v0.2)**

---

## v0.2.0 — Budget, offline, FinDash

- Budget ต่อหมวด
- Offline transaction queue
- FinDash template
- Boot splash, bottom sheet polish, portal overlays

---

## v0.1.x — Initial release

- Dashboard, calendar, categories, PWA, themes
