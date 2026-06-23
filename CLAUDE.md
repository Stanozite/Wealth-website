# Tools Website — Claude Context

อ่าน `README.md` ก่อน — มีโครงสร้างไฟล์ + conventions ครบ

## กฎเหล็ก

- **Exemplar = `budget-planner.html`** — หน้า tool ใหม่ทุกหน้าก๊อปโครงจากไฟล์นี้ ห้ามคิดโครงใหม่
- **Theme แก้ที่ `_theme.css` เท่านั้น** — ห้าม fork สี/spacing ในหน้าเดี่ยว (inline style เฉพาะ layout เฉพาะหน้า)
- **Brand แก้ที่ `_brand.js` เท่านั้น** — ชื่อบริษัทยังเป็น placeholder
- JS ทุกไฟล์: `var` + string concat (no template literals / arrows / let / const) — ตาม Ananta playbook §8.8
- สองภาษาเสมอ: `.lang-th`/`.lang-en` spans + `wc:lang` event สำหรับ dynamic text
- ทุกสูตรการเงินต้องมี source ใน disclaimer — ห้ามตัวเลขลอย
- ตัวเลขภาษี/เพดานลดหย่อน = ปีภาษี 2567 — แก้ทุกปี ตรวจกับ rd.go.th

## ที่มา design

- แผน taxonomy + research ระดับโลก: `C:\Users\Acer\.claude\plans\logical-bouncing-quill.md` (FPSB 6 domains, Top-10 must-clone, benchmarks)
- Best-practice playbook: `CO-WORK\Property\Ananta Partners Website\website-best-practices.md`
- Theme canonical: `CO-WORK\Investment\02_Investing\IPO_Tracker\_ipo_theme.css` (Wise-inspired per Tin)

## Backend (Supabase, dual-mode)

- `_supabase.js` = `window.WC_DB` (auth/articles CRUD/storage) — config ใน `_brand.js.supabase` ว่าง = ทุกอย่าง fallback static, ห้าม assume DB มี
- Schema: `supabase/migrations/001_articles.sql` — field names ต้องตรงเป๊ะ (title_th, content_th, thumb_url, tool_slug, read_min, published)
- `admin.html` = CMS (noindex); `article.html?slug=` = DB article renderer; `_articles.js` merge DB→registry อัตโนมัติ + replay ทุก render target
- เพิ่ม field ใหม่ → แก้ 4 ที่: SQL migration ใหม่, _supabase.js (ถ้าจำเป็น), admin.html form, article.html/registry render
- DB strings เข้า innerHTML ต้องผ่าน esc() เสมอ (ยกเว้น content_th/en ที่ sanitize script/on* แล้ว — admin เป็น trusted author)

## Design-polish skills (ibelick/ui-skills)

Installed in `.claude/skills/`. Before shipping any page, run as slash commands on it:
- `/fixing-accessibility <file>` — ARIA names, keyboard, focus, form errors (framework-agnostic ✓)
- `/fixing-metadata <file>` — title/desc/canonical/OG/JSON-LD agree (framework-agnostic ✓)
- `/fixing-motion-performance <file>` — compositor-only animation, no scroll polling (framework-agnostic ✓)
- `/baseline-ui <file>` — typography/animation/design baseline. **Ignore its Stack section** (Tailwind/React/motion-react/Radix) — we are plain HTML; apply only Typography/Animation/Layout/Design rules (text-balance/pretty, tabular-nums, ≤200ms feedback, one accent/view).

## Preview

Dev server config อยู่ที่ `CO-WORK\Investment\.claude\launch.json` ชื่อ `wealth-tools` (npx serve port 8788)
