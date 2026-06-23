# Wealth Compass — Financial Tools Website

เว็บเครื่องมือวางแผนการเงิน (TH/EN) สำหรับบริษัทที่ปรึกษาการเงินของ Tin — ใช้เป็น lead-funnel ดึง traffic จาก Google และส่งต่อเป็นนัดปรึกษา

**สร้าง:** 2026-06-11 · **สถานะ:** v1 build (11 เครื่องมือ + hub)

## โครงสร้าง

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | Hub landing — hero, 7 pillars, tool cards, มาตรฐาน, CTA, FAQ |
| `financial-health-score.html` | CFPB 10 คำถาม → คะแนน 0-100 (ประตูทาง) |
| `budget-planner.html` | 50/30/20 + Six Jars (**exemplar — แม่แบบของทุก tool**) |
| `emergency-fund.html` | เป้าเงินสำรอง 3-6 เดือน |
| `net-worth.html` | งบดุลส่วนบุคคล + UBS 3L + Fidelity milestones |
| `risk-profile.html` | 11 คำถามแนว Vanguard → allocation |
| `compound-dca.html` | ทบต้น + fee analyzer (Empower-style) |
| `tax-calculator.html` | ภาษีเงินได้ไทยขั้นบันได |
| `tax-deduction-optimizer.html` | เพดาน RMF/ThaiESG/ประกัน + ประหยัดที่ marginal rate |
| `retirement-simulator.html` | Monte Carlo 1,000 เส้นทาง + readiness score |
| `debt-payoff.html` | Snowball vs avalanche |
| `insurance-needs.html` | DIME |
| `_theme.css` | Design system (Wise-inspired ตาม canonical ของ Tin) — แก้ที่เดียว |
| `_brand.js` | **ชื่อบริษัท/โดเมน/ติดต่อ — TODO: Tin แก้ที่นี่ที่เดียว** |
| `_app.js` | i18n toggle, number format, reveal, lead form |
| `_nav.js` / `_footer.js` | nav/footer ฉีดทุกหน้า แก้ที่เดียว |
| `robots.txt` / `sitemap.xml` / `vercel.json` | SEO + deploy (Vercel) |

## Conventions (ทุกหน้าใหม่ต้องตาม)

1. ก๊อปโครง head + body จาก `budget-planner.html` (exemplar)
2. ทุกข้อความ 2 ภาษา: `<span class="lang-th">…</span><span class="lang-en">…</span>`; ข้อความ dynamic ใน JS เช็ค `WC.getLang()` + ฟัง event `wc:lang`
3. JS: IIFE, `var` + string concat เท่านั้น (no template literals/arrow/let/const)
4. เงิน: input `type="text" data-num`, format ด้วย `WC.fmt/fmtBaht/parseNum`
5. ทุกสูตรอ้าง source ใน `.disclaimer`
6. ทุกหน้า: JSON-LD @graph (Organization + WebApplication + BreadcrumbList + FAQPage), CSP meta, hreflang, canonical
7. CTA band + form `data-lead` ทุกหน้า tool (hidden topic ระบุที่มา lead)

## ระบบหลังบ้าน (Supabase CMS)

เว็บเป็น **dual-mode**: ไม่ตั้งค่า Supabase ก็ทำงานครบ (บทความ static 6 ตัว) — ตั้งค่าแล้ว
admin จะเพิ่ม/แก้/ลบบทความเก็บใน database ได้เอง + อัปโหลด thumbnail

**เปิดใช้งาน (ครั้งเดียว ~10 นาที):**
1. สร้างโปรเจกต์ฟรีที่ [supabase.com](https://supabase.com)
2. Dashboard → SQL Editor → วางเนื้อหา `supabase/migrations/001_articles.sql` → Run
3. Authentication → Users → **Add user** (อีเมล+รหัสผ่านของ Tin = บัญชี admin)
4. Settings → API → คัดลอก **Project URL** + **anon public key** → วางใน `_brand.js` ช่อง `supabase:`
5. เปิด `admin.html` → ล็อกอิน → เขียนบทความ

**การทำงาน:**
- `admin.html` — หลังบ้าน (noindex, login เท่านั้น): list / สร้าง / แก้ / ลบ / เผยแพร่-ซ่อน / อัปโหลดรูป
- `article.html?slug=...` — render บทความจาก DB (หน้าตาเหมือนบทความ static ทุกประการ)
- `_articles.js` — merge อัตโนมัติ: บทความใหม่จาก DB โผล่ใน blog/หน้าแรก/related ทันที; ถ้า slug ตรงกับบทความ static จะ override การ์ด (ชื่อ/คำโปรย/รูป)
- ความปลอดภัย: anon key เปิดเผยได้ (RLS คุม — คนทั่วไปอ่านได้เฉพาะ published, เขียนได้เฉพาะ login)
- Thumbnail: อัปโหลดเข้า Supabase Storage bucket `thumbs` (public read)

## ก่อน launch (TODO)

- [ ] ตั้งชื่อบริษัทจริง + โดเมนจริง → แก้ `_brand.js` แล้ว find/replace `wealthcompass.example.com` ทุกไฟล์
- [ ] สมัคร Formspree ใส่ endpoint ใน `_brand.js`
- [ ] ตรวจเลขภาษีปีภาษีปัจจุบันกับสรรพากร (tax-calculator, tax-deduction-optimizer)
- [ ] OG image 1200×630 ต่อหน้า
- [ ] Google Search Console verify + submit sitemap
- [ ] Lighthouse ≥90 ทุกหมวด
- [ ] Security review (CSP ละเอียด, rate-limit form) — Tin บอกทำทีหลังได้

## Deploy

Vercel: import folder นี้ → ใช้ `vercel.json` ที่มีอยู่ (clean URLs, security headers, cache)
