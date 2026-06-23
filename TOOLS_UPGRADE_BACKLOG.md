# Tools Upgrade Backlog

จาก audit เครื่องมือทั้ง 11 (2026-06-12) เทียบ Vanguard/Fidelity/Schwab/Empower/NerdWallet + Thai tax specialist. ✅ = ทำใน wave 1.

## Correctness bugs (P0 — ต้องแก้)
- ✅ **tax-calculator** — หักค่าใช้จ่าย 50% เฉพาะ salary; รายได้อื่น (40(2/5/6/7/8)) ได้ 0 → ฟรีแลนซ์โดนภาษีเกิน. + ช่อง "extra" ไม่มี cap (พิมพ์เยอะ = ภาษี 0). + ขาดยกเว้นอายุ 65 (190k).
- ✅ **tax-deduction-optimizer** — ไม่มี SSF (2567 ยังซื้อได้); "save" ใช้ flat marginal rate → overstate; marginal สมมติ net = income−160k เสมอ.
- ✅ **budget-planner** — Six Jars นับโหล "การศึกษา" เป็น want.
- ✅ **debt-payoff** — flat-rate ไม่แปลงในเครื่อง (ให้ user ×1.8 เอง); min-payment ไม่ scale ตามยอด.
- ✅ **insurance-needs** — ตัวเลขผล hardcode ใน HTML (฿9.4M โผล่ถ้า JS ช้า).

## Cross-cutting (ทุกเครื่องมือขาด)
- **Save / share / PDF / print** — ไม่มีเลยทั้ง 11. ลูกค้ารวย+advisor คาดหวัง. → localStorage + encode inputs ใน URL query + print stylesheet.
- **Scenario compare (A/B)** — ทุกตัวโชว์ผลเดียว.
- **URL-state handoff** — เครื่องมือลิงก์กันแต่ไม่ส่งค่า (risk-profile→dca→retirement; tax-calc→optimizer).
- **Real vs nominal + inflation** — retirement hardcode 3%, dca ไม่มีเลย, risk ป้าย "pre-inflation". ควรมี toggle ร่วม.
- **Thai localize** — RMF/SSF/PVD/ประกันสังคม/กบข. ขาดใน retirement+dca.
- **Currency** — THB hardcode (fmtBaht).

## Per-tool P1/P2 (ยังไม่ทำ — wave ถัดไป)

**budget-planner** — line-item expense entry; irregular-income (avg 3 เดือน); split savings เป็น emergency/retire/goal.
**emergency-fund** — ✅(w1 P0 บางส่วน) raise slider/custom months; lump-sum windfall; 2nd scenario compare; retiree tier; APY on buffer; business runway.
**net-worth** — dated snapshots + trend line (สำคัญสุด — copy บอก "วัดทุก 6 เดือน"); investable/liquid net worth; editable 3L (รถไม่ควรเป็น Legacy); custom rows (crypto/business equity); configurable start-work/retire age; age-percentile benchmark.
**financial-health-score** — 4 sub-domain breakdown (CFPB control/shock/on-track/freedom — ข้อมูลมีแล้ว); score history; real IRT lookup แทน raw×2.5; age/Thai benchmark แทน US 54; action checklist.
**risk-profile** — ✅(w1) willingness vs capacity split + URL handoff; glide-path by age; market-assumptions toggle (Thai/Global); per-bucket allocation drill-down; decumulation question branch.
**compound-dca** — goal-seek (solve PMT); real/nominal+inflation; lump-sum vs DCA; generalize fee-compare; step-up contributions; RMF/SSF/PVD tax-rebate; volatility band; CSV export.
**retirement-simulator** — ✅(w1) guaranteed income, decum alloc+withdrawal inputs, market/inflation assumptions, sequence stress, already-retired, editable levers; (later) couples/spouse, retirement smile spending, guardrails withdrawal, lumpy goals, bequest target, 5/25/50/75/95 bands, depletion age.
**tax-calculator** — ✅(w1) income categories, capped deductions, age-65, WHT reconcile, with/without delta, drop-bracket solver, year selector; (later) spouse joint/separate, 2nd-child-2561, dividend credit, donations×2, Easy E-Receipt, multi-year.
**tax-deduction-optimizer** — ✅(w1) SSF, stair-step saving, real marginal, GPF, inverse solver, dynamic order; (later) liquidity input, couple optimizer, DCA buy schedule, dedup to _tax.js.
**debt-payoff** — ✅(w1) flat/effective toggle, min-only column, lump-sum, DTI, amortization, dynamic slider; (later) consolidation/refinance what-if, biweekly, promo-rate, weighted APR headline.
**insurance-needs** — ✅(w1) fix placeholders, HLV+income-multiple, age-band premium, disability/CI, inflation toggle; (later) spouse mode, business-continuity (key-man/buy-sell), coverage-ladder visual, cost-of-waiting.

## Shared infra opportunity
- Extract `_tax.js` (✅ created) — year-keyed brackets/caps/computeTax, single source. Dedup optimizer to it later.
- Shared assumptions object (means/SD/inflation/fee) ใน _app.js เพื่อความ consistent ข้ามเครื่องมือ.
- Shared `WC.saveState/loadState/shareURL/print` helper → cross-cutting save/share ทุกเครื่องมือทีเดียว.
