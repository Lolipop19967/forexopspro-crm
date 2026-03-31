import { useState } from "react";
import { PropAccountManagement, BrokerAccountManagement } from "./AccountManagement";
import { useLiveOverview, useDrawdownMonitor } from "./useLiveData";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────────────────────── */
const C = {
  bg: "#0B0F14", surface: "#111418", card: "#161B22", hover: "#1C2128",
  border: "#21262D", borderHi: "#30363D",
  green: "#00FF88", greenDim: "rgba(0,255,136,0.08)", greenMid: "rgba(0,255,136,0.18)", greenGlow: "rgba(0,255,136,0.35)",
  blue: "#3B82F6", blueDim: "rgba(59,130,246,0.10)",
  red: "#FF4D4D", redDim: "rgba(255,77,77,0.10)",
  amber: "#F59E0B", amberDim: "rgba(245,158,11,0.10)",
  purple: "#A78BFA", purpleDim: "rgba(167,139,250,0.10)",
  text: "#FFFFFF", muted: "#9CA3AF", faint: "#4B5563",
  r: "8px", rL: "12px",
};

/* ─────────────────────────────────────────────────────────────
   PROP FIRM DATA
   ───────────────────────────────────────────────────────────── */
const TRADERS = [
  { id:"DEMO", name:"Alex Thornton", email:"a.thornton@gmail.com", country:"UK", signup:"10 Nov 2024", payment:"10 Nov 2024", challenge:"Phase 2", ip:"192.168.1.10", affiliate:"AFF01", accountSize:100000, pnl:5200, riskScore:82, riskLevel:"High", stage:"flagged", avatar:"AT", payoutEligibility:"Under Review", hasViolation:true, isDemo:true },
  { id:"T001", name:"Marcus Chen", email:"m.chen@gmail.com", country:"SG", signup:"01 Nov 2024", payment:"02 Nov 2024", challenge:"Phase 1", ip:"192.168.1.10", affiliate:"AFF01", accountSize:100000, pnl:4320, riskScore:12, riskLevel:"Low", stage:"active", avatar:"MC", payoutEligibility:"Eligible", hasViolation:false, isDemo:false },
  { id:"T002", name:"Priya Nair", email:"priya.n@outlook.com", country:"IN", signup:"03 Nov 2024", payment:"03 Nov 2024", challenge:"Phase 2", ip:"10.0.0.22", affiliate:"AFF02", accountSize:50000, pnl:7100, riskScore:8, riskLevel:"Low", stage:"passed", avatar:"PN", payoutEligibility:"Eligible", hasViolation:false, isDemo:false },
  { id:"T003", name:"Jordan Rivers", email:"jrivers@yahoo.com", country:"US", signup:"05 Nov 2024", payment:"06 Nov 2024", challenge:"Phase 1", ip:"172.16.0.5", affiliate:"AFF01", accountSize:50000, pnl:-3200, riskScore:45, riskLevel:"Elevated", stage:"failed", avatar:"JR", payoutEligibility:"Not Eligible", hasViolation:true, isDemo:false },
  { id:"T004", name:"Elena Volkova", email:"e.volkova@mail.ru", country:"RU", signup:"07 Nov 2024", payment:null, challenge:null, ip:"192.168.1.10", affiliate:null, accountSize:0, pnl:0, riskScore:72, riskLevel:"High", stage:"signup", avatar:"EV", payoutEligibility:"Not Eligible", hasViolation:false, isDemo:false },
  { id:"T005", name:"Kofi Asante", email:"k.asante@proton.me", country:"GH", signup:"08 Nov 2024", payment:"08 Nov 2024", challenge:"Phase 2", ip:"203.0.113.4", affiliate:"AFF03", accountSize:200000, pnl:12400, riskScore:5, riskLevel:"Low", stage:"active", avatar:"KA", payoutEligibility:"Eligible", hasViolation:false, isDemo:false },
  { id:"T006", name:"Dmitri Volkov", email:"dvolkov@temp.io", country:"RU", signup:"09 Nov 2024", payment:"09 Nov 2024", challenge:"Phase 1", ip:"192.168.1.10", affiliate:null, accountSize:100000, pnl:-800, riskScore:91, riskLevel:"Critical", stage:"flagged", avatar:"DV", payoutEligibility:"Under Review", hasViolation:true, isDemo:false },
  { id:"T007", name:"Amara Diallo", email:"a.diallo@gmail.com", country:"SN", signup:"10 Nov 2024", payment:"11 Nov 2024", challenge:"Phase 1", ip:"198.51.100.7", affiliate:"AFF02", accountSize:25000, pnl:1100, riskScore:18, riskLevel:"Low", stage:"active", avatar:"AD", payoutEligibility:"Not Eligible", hasViolation:false, isDemo:false },
  { id:"T008", name:"Wei Zhang", email:"wzhang@corp.com", country:"CN", signup:"11 Nov 2024", payment:"11 Nov 2024", challenge:"Phase 2", ip:"192.0.2.44", affiliate:"AFF01", accountSize:100000, pnl:9800, riskScore:3, riskLevel:"Low", stage:"passed", avatar:"WZ", payoutEligibility:"Eligible", hasViolation:false, isDemo:false },
  { id:"T009", name:"Carlos Mendez", email:"cmendez@hotmail.com", country:"MX", signup:"12 Nov 2024", payment:null, challenge:null, ip:"172.16.5.20", affiliate:"AFF03", accountSize:0, pnl:0, riskScore:10, riskLevel:"Low", stage:"lead", avatar:"CM", payoutEligibility:"Not Eligible", hasViolation:false, isDemo:false },
  { id:"T010", name:"Fatima Al-Hassan", email:"f.alhassan@gmail.com", country:"AE", signup:"12 Nov 2024", payment:"12 Nov 2024", challenge:"Phase 1", ip:"10.1.1.99", affiliate:"AFF02", accountSize:50000, pnl:2200, riskScore:22, riskLevel:"Elevated", stage:"active", avatar:"FA", payoutEligibility:"Under Review", hasViolation:true, isDemo:false },
];

const AFFILIATES = [
  { id:"AFF01", name:"TradeMaster Blog", referrals:4, revenue:3200, commission:640, convRate:75 },
  { id:"AFF02", name:"FX Academy", referrals:3, revenue:2100, commission:420, convRate:100 },
  { id:"AFF03", name:"Alpha Signals", referrals:2, revenue:800, commission:160, convRate:50 },
];

const PROP_TICKETS = [
  { id:"TK-001", trader:"T003", subject:"Challenge result disputed", status:"open", priority:"High", created:"10 Nov 2024", category:"Dispute", messages:3, ago:"2h ago", notes:"Trader claims drawdown calculation was incorrect on 8 Nov." },
  { id:"TK-002", trader:"T004", subject:"Payment not showing on account", status:"open", priority:"Medium", created:"08 Nov 2024", category:"Billing", messages:1, ago:"5h ago", notes:"Stripe payment ID #pi_3Qx confirmed but account not upgraded." },
  { id:"TK-003", trader:"T006", subject:"Cannot log into trading account", status:"escalated", priority:"Critical", created:"09 Nov 2024", category:"Access", messages:7, ago:"14m ago", notes:"Account auto-suspended after risk flag. Compliance review in progress." },
  { id:"TK-004", trader:"T001", subject:"Requesting profit withdrawal", status:"resolved", priority:"Low", created:"05 Nov 2024", category:"Payout", messages:4, ago:"2d ago", notes:"Withdrawal of $4,320 processed. Funds sent to registered bank account." },
  { id:"TK-005", trader:"T007", subject:"Confirm Phase 2 account upgrade", status:"open", priority:"Medium", created:"11 Nov 2024", category:"Upgrade", messages:2, ago:"1h ago", notes:"Trader met all Phase 1 targets. Awaiting manual confirmation from ops." },
];

const WEBHOOK_INIT = [
  { id:1, event:"payment.completed", traderId:"T001", ts:"09:14", ok:true, action:"Account MT5-8821 provisioned" },
  { id:2, event:"account.created", traderId:"T001", ts:"09:15", ok:true, action:"Welcome email sent to m.chen@gmail.com" },
  { id:3, event:"challenge.failed", traderId:"T003", ts:"14:30", ok:true, action:"Support ticket TK-001 created" },
  { id:4, event:"payment.completed", traderId:"T005", ts:"11:20", ok:true, action:"Account MT5-8822 provisioned" },
  { id:5, event:"account.created", traderId:"T005", ts:"11:21", ok:true, action:"Welcome email sent to k.asante@proton.me" },
  { id:6, event:"risk.flagged", traderId:"T006", ts:"07:05", ok:"warn", action:"Risk team alerted via Slack" },
  { id:7, event:"payment.failed", traderId:"T004", ts:"16:44", ok:false, action:"Retry queued for 17:44" },
];

const REV_MONTHS = [
  { m:"Jun", v:18400 }, { m:"Jul", v:22100 }, { m:"Aug", v:19800 },
  { m:"Sep", v:31200 }, { m:"Oct", v:28700 }, { m:"Nov", v:34100 },
];

const FUNNEL = [
  { label:"Leads", n:142 }, { label:"Signups", n:87 },
  { label:"Paid", n:61 }, { label:"Active", n:44 },
];

const PAYOUT_QUEUE = [
  { id:"PQ-001", trader:"Kofi Asante", accountId:"MT5-8822", profit:12400, status:"Pending", reason:"" },
  { id:"PQ-002", trader:"Priya Nair", accountId:"MT5-8815", profit:7100, status:"Approved", reason:"" },
  { id:"PQ-003", trader:"Wei Zhang", accountId:"MT5-8831", profit:9800, status:"Approved", reason:"" },
  { id:"PQ-004", trader:"Marcus Chen", accountId:"MT5-8821", profit:4320, status:"Pending", reason:"" },
  { id:"PQ-005", trader:"Jordan Rivers", accountId:"MT5-8809", profit:0, status:"Flagged", reason:"Daily loss limit breached — challenge invalidated" },
  { id:"PQ-006", trader:"Dmitri Volkov", accountId:"MT5-8817", profit:0, status:"Flagged", reason:"Consistency rule failed — 78% of profit in single session" },
  { id:"PQ-007", trader:"Fatima Al-Hassan", accountId:"MT5-8840", profit:2200, status:"Flagged", reason:"Account under compliance review — IP cluster detected" },
];

const RULE_VIOLATIONS = [
  { id:"RV-001", trader:"Jordan Rivers", rule:"Max Daily Loss", severity:"High", detection:"Auto", ts:"08 Nov 2024 14:22", accountId:"MT5-8809", detail:"Loss of $5,100 on a $50,000 account exceeded 10% daily limit" },
  { id:"RV-002", trader:"Dmitri Volkov", rule:"Consistency Rule", severity:"High", detection:"Auto", ts:"09 Nov 2024 07:01", accountId:"MT5-8817", detail:"78% of total profit generated in a single trading session" },
  { id:"RV-003", trader:"Fatima Al-Hassan", rule:"Lot Size Limit", severity:"Medium", detection:"Auto", ts:"11 Nov 2024 11:45", accountId:"MT5-8840", detail:"Lot size of 4.5 exceeded max of 4.0 on XAUUSD" },
  { id:"RV-004", trader:"Dmitri Volkov", rule:"Multi-Account Use", severity:"High", detection:"Manual", ts:"09 Nov 2024 07:05", accountId:"MT5-8817", detail:"IP 192.168.1.10 linked to 3 accounts — possible account sharing" },
  { id:"RV-005", trader:"Fatima Al-Hassan", rule:"Weekend Holding", severity:"Low", detection:"Auto", ts:"10 Nov 2024 00:01", accountId:"MT5-8840", detail:"Open EURUSD position held over Saturday market close" },
  { id:"RV-006", trader:"Jordan Rivers", rule:"Stop Loss Required", severity:"Medium", detection:"Auto", ts:"07 Nov 2024 09:30", accountId:"MT5-8809", detail:"3 consecutive trades placed without stop loss on GBPUSD" },
];

const VALIDATION_LOG = [
  { ts:"2024-11-12 09:14:02", action:"Trade Checked", trader:"Kofi Asante", result:"Passed", source:"System", detail:"EURUSD 0.75 lots — all rules passed" },
  { ts:"2024-11-12 08:55:11", action:"Payout Reviewed", trader:"Priya Nair", result:"Passed", source:"System", detail:"All targets met — approved automatically" },
  { ts:"2024-11-11 16:30:00", action:"Payout Reviewed", trader:"Jordan Rivers", result:"Failed", source:"System", detail:"Daily loss breach disqualified payout" },
  { ts:"2024-11-11 14:05:33", action:"Rule Triggered", trader:"Dmitri Volkov", result:"Flagged", source:"System", detail:"Consistency rule — 78% single session profit" },
  { ts:"2024-11-11 07:05:11", action:"Risk Review", trader:"Dmitri Volkov", result:"Flagged", source:"Risk Team", detail:"Manual review — IP cluster investigation" },
  { ts:"2024-11-10 22:14:00", action:"Trade Checked", trader:"Wei Zhang", result:"Passed", source:"System", detail:"NASDAQ 1.25 lots — all rules passed" },
  { ts:"2024-11-10 14:30:44", action:"Rule Triggered", trader:"Jordan Rivers", result:"Failed", source:"System", detail:"Max daily loss exceeded — account locked" },
  { ts:"2024-11-10 11:45:00", action:"Rule Triggered", trader:"Fatima Al-Hassan", result:"Flagged", source:"System", detail:"Lot size violation on XAUUSD — flagged for review" },
];

const TRADES_DATA = [
  { id:"TR001", trader:"Marcus Chen", symbol:"EURUSD", lots:1.5, pnl:+4320, status:"Valid", reason:"Within all limits" },
  { id:"TR002", trader:"Priya Nair", symbol:"GBPUSD", lots:2.0, pnl:+7100, status:"Valid", reason:"Within all limits" },
  { id:"TR003", trader:"Jordan Rivers", symbol:"XAUUSD", lots:3.0, pnl:-3200, status:"Violated", reason:"Max daily loss breached on 8 Nov" },
  { id:"TR004", trader:"Kofi Asante", symbol:"EURUSD", lots:0.75, pnl:+12400, status:"Valid", reason:"Within all limits" },
  { id:"TR005", trader:"Dmitri Volkov", symbol:"BTCUSD", lots:5.0, pnl:-800, status:"Violated", reason:"Copied trade detected — multi-account" },
  { id:"TR006", trader:"Amara Diallo", symbol:"USDJPY", lots:0.5, pnl:+1100, status:"Valid", reason:"Within all limits" },
  { id:"TR007", trader:"Wei Zhang", symbol:"NASDAQ", lots:1.25, pnl:+9800, status:"Valid", reason:"Within all limits" },
  { id:"TR008", trader:"Fatima Al-Hassan", symbol:"EURUSD", lots:1.0, pnl:+2200, status:"Valid", reason:"Within all limits" },
];

const PAYOUTS_DATA = [
  { trader:"Kofi Asante", balance:212400, profit:12400, eligible:true, reason:"All targets met. KYC verified. No violations." },
  { trader:"Priya Nair", balance:57100, profit:7100, eligible:true, reason:"All targets met. KYC verified. No violations." },
  { trader:"Wei Zhang", balance:109800, profit:9800, eligible:true, reason:"All targets met. KYC verified. No violations." },
  { trader:"Amara Diallo", balance:26100, profit:1100, eligible:false, reason:"Profit target not yet reached (4.4% of 10%)." },
  { trader:"Jordan Rivers", balance:46800, profit:-3200, eligible:false, reason:"Challenge failed — daily loss limit breached." },
  { trader:"Dmitri Volkov", balance:99200, profit:-800, eligible:false, reason:"Account under compliance review — frozen." },
  { trader:"Fatima Al-Hassan", balance:52200, profit:2200, eligible:false, reason:"Phase 1 still active — minimum 5 trading days not met." },
];

const AUDIT_LOG = [
  { ts:"2024-11-12 09:14:02", action:"Payment received — Kofi Asante ($200,000 plan)", result:"MT5-8822 provisioned" },
  { ts:"2024-11-12 09:14:03", action:"Welcome email sent — k.asante@proton.me", result:"Delivered" },
  { ts:"2024-11-11 07:05:11", action:"Risk flag triggered — Dmitri Volkov, score 91", result:"Account frozen, compliance alerted" },
  { ts:"2024-11-10 14:30:44", action:"Challenge failed — Jordan Rivers, daily loss breached", result:"Account locked, TK-001 created" },
  { ts:"2024-11-10 16:44:00", action:"Payment failed — Elena Volkova, card declined", result:"Retry queued for 17:44" },
  { ts:"2024-11-09 11:30:00", action:"Payout approved — Marcus Chen, $4,320", result:"Sent to bank ending 4821" },
  { ts:"2024-11-08 09:00:00", action:"Challenge passed — Priya Nair, Phase 1 → Phase 2", result:"Phase 2 account MT5-8815 provisioned" },
  { ts:"2024-11-07 14:12:00", action:"IP cluster — 192.168.1.10 (T001, T004, T006)", result:"Accounts flagged for review" },
];

/* ─────────────────────────────────────────────────────────────
   BROKER DATA — completely separate from prop data
   ───────────────────────────────────────────────────────────── */
const BROKER_CLIENTS = [
  { id:"C001", name:"James Okafor", email:"j.okafor@gmail.com", country:"NG", accountType:"ECN", balance:85000, deposit:85000, openPnl:+1240, riskScore:8, riskLevel:"Low", kycStatus:"Verified", stage:"active", avatar:"JO", ibRef:"IB01", joined:"03 Jan 2024", lastTrade:"Today", flagged:false },
  { id:"C002", name:"Sarah Mitchell", email:"s.mitchell@outlook.com", country:"ZA", accountType:"Standard", balance:22000, deposit:22000, openPnl:-340, riskScore:15, riskLevel:"Low", kycStatus:"Verified", stage:"active", avatar:"SM", ibRef:"IB02", joined:"15 Jan 2024", lastTrade:"Yesterday", flagged:false },
  { id:"C003", name:"Raj Patel", email:"raj.p@corp.com", country:"IN", accountType:"VIP", balance:310000, deposit:300000, openPnl:+4800, riskScore:22, riskLevel:"Elevated", kycStatus:"Verified", stage:"active", avatar:"RP", ibRef:null, joined:"22 Dec 2023", lastTrade:"Today", flagged:false },
  { id:"C004", name:"Chen Wei", email:"cwei@temp.biz", country:"CN", accountType:"Standard", balance:150000, deposit:150000, openPnl:0, riskScore:88, riskLevel:"Critical", kycStatus:"Failed", stage:"suspended", avatar:"CW", ibRef:"IB01", joined:"01 Feb 2024", lastTrade:"10 Feb 2024", flagged:true },
  { id:"C005", name:"Amira Hassan", email:"a.hassan@proton.me", country:"AE", accountType:"ECN", balance:45000, deposit:40000, openPnl:+620, riskScore:11, riskLevel:"Low", kycStatus:"Verified", stage:"active", avatar:"AH", ibRef:"IB03", joined:"10 Feb 2024", lastTrade:"Today", flagged:false },
  { id:"C006", name:"Viktor Sorokin", email:"vsorokin@mail.ru", country:"RU", accountType:"Standard", balance:0, deposit:0, openPnl:0, riskScore:65, riskLevel:"High", kycStatus:"Pending", stage:"onboarding", avatar:"VS", ibRef:null, joined:"14 Mar 2024", lastTrade:"Never", flagged:false },
  { id:"C007", name:"Nomsa Dlamini", email:"n.dlamini@gmail.com", country:"ZA", accountType:"Standard", balance:8500, deposit:8500, openPnl:+180, riskScore:6, riskLevel:"Low", kycStatus:"Verified", stage:"active", avatar:"ND", ibRef:"IB02", joined:"20 Mar 2024", lastTrade:"2 days ago", flagged:false },
  { id:"C008", name:"Ahmed Al-Farsi", email:"ahmed.af@gmail.com", country:"AE", accountType:"VIP", balance:520000, deposit:500000, openPnl:+12400, riskScore:14, riskLevel:"Low", kycStatus:"Verified", stage:"active", avatar:"AA", ibRef:null, joined:"05 Apr 2024", lastTrade:"Today", flagged:false },
  { id:"C009", name:"Lena Kovac", email:"lkovac@hotmail.com", country:"HR", accountType:"ECN", balance:31000, deposit:30000, openPnl:+290, riskScore:9, riskLevel:"Low", kycStatus:"Verified", stage:"active", avatar:"LK", ibRef:"IB03", joined:"12 Apr 2024", lastTrade:"Today", flagged:false },
  { id:"C010", name:"Tunde Adeyemi", email:"t.adeyemi@yahoo.com", country:"NG", accountType:"Standard", balance:18000, deposit:20000, openPnl:-820, riskScore:44, riskLevel:"Elevated", kycStatus:"Pending", stage:"active", avatar:"TA", ibRef:"IB01", joined:"18 Apr 2024", lastTrade:"Yesterday", flagged:true },
];

const BROKER_KYC = {
  C001: { status:"Verified", verifiedDate:"05 Jan 2024", method:"Sumsub", docs:["Passport","Proof of Address","Bank Statement"], notes:"Full EDD passed. Nigeria resident. Enhanced checks completed." },
  C002: { status:"Verified", verifiedDate:"17 Jan 2024", method:"Sumsub", docs:["National ID","Utility Bill"], notes:"Verified. South Africa resident. FICA compliant." },
  C003: { status:"Verified", verifiedDate:"24 Dec 2023", method:"Manual", docs:["Passport","Bank Statement","Source of Funds"], notes:"VIP client. Enhanced due diligence completed. India resident." },
  C004: { status:"Failed", verifiedDate:null, method:"Manual", docs:["Passport (rejected — mismatch)","Selfie (failed liveness)"], notes:"Document name mismatch. Liveness check failed. Account suspended pending re-verification." },
  C005: { status:"Verified", verifiedDate:"12 Feb 2024", method:"Sumsub", docs:["Passport","Bank Statement"], notes:"UAE resident. Verified." },
  C006: { status:"Pending", verifiedDate:null, method:"Sumsub", docs:["Passport (uploaded — under review)"], notes:"Awaiting automated review. Russia resident — enhanced screening required." },
  C007: { status:"Verified", verifiedDate:"22 Mar 2024", method:"Sumsub", docs:["National ID","Proof of Address"], notes:"Verified. South Africa resident. FICA compliant." },
  C008: { status:"Verified", verifiedDate:"07 Apr 2024", method:"Manual", docs:["Passport","Bank Statement","Source of Funds","Utility Bill"], notes:"VIP client. Full EDD passed. UAE resident." },
  C009: { status:"Verified", verifiedDate:"14 Apr 2024", method:"Sumsub", docs:["Passport","Bank Statement"], notes:"Verified. Croatia resident." },
  C010: { status:"Pending", verifiedDate:null, method:"Sumsub", docs:["National ID (uploaded)"], notes:"Under review. Nigeria resident. Additional source of funds requested." },
};

const BROKER_PAYMENTS = [
  { id:"BP-001", client:"C008", clientName:"Ahmed Al-Farsi", type:"Deposit", amount:500000, method:"Bank Transfer", status:"Approved", date:"05 Apr 2024 10:12", flagReason:"", processing:"4h 22m" },
  { id:"BP-002", client:"C003", clientName:"Raj Patel", type:"Deposit", amount:300000, method:"Bank Transfer", status:"Approved", date:"22 Dec 2023 14:00", flagReason:"", processing:"6h 05m" },
  { id:"BP-003", client:"C001", clientName:"James Okafor", type:"Deposit", amount:85000, method:"Bank Transfer", status:"Approved", date:"03 Jan 2024 09:00", flagReason:"", processing:"3h 11m" },
  { id:"BP-004", client:"C004", clientName:"Chen Wei", type:"Deposit", amount:150000, method:"Crypto (USDT)", status:"Flagged", date:"02 Feb 2024 03:44", flagReason:"Crypto deposit from unverified wallet. KYC failed — AML hold required.", processing:"—" },
  { id:"BP-005", client:"C002", clientName:"Sarah Mitchell", type:"Withdrawal", amount:5000, method:"Bank Transfer", status:"Approved", date:"10 Mar 2024 11:30", flagReason:"", processing:"2h 18m" },
  { id:"BP-006", client:"C010", clientName:"Tunde Adeyemi", type:"Deposit", amount:20000, method:"Credit Card", status:"Flagged", date:"18 Apr 2024 16:20", flagReason:"Deposit exceeds declared income level on KYC form. Source of funds review required.", processing:"—" },
  { id:"BP-007", client:"C009", clientName:"Lena Kovac", type:"Deposit", amount:30000, method:"Bank Transfer", status:"Approved", date:"12 Apr 2024 08:55", flagReason:"", processing:"1h 44m" },
  { id:"BP-008", client:"C005", clientName:"Amira Hassan", type:"Withdrawal", amount:8000, method:"Bank Transfer", status:"Processing", date:"20 Apr 2024 10:00", flagReason:"", processing:"Pending compliance sign-off" },
  { id:"BP-009", client:"C003", clientName:"Raj Patel", type:"Withdrawal", amount:15000, method:"Bank Transfer", status:"Approved", date:"15 Apr 2024 14:00", flagReason:"", processing:"3h 30m" },
  { id:"BP-010", client:"C004", clientName:"Chen Wei", type:"Withdrawal", amount:140000, method:"Bank Transfer", status:"Flagged", date:"12 Feb 2024 09:00", flagReason:"Withdrawal attempted after KYC failure. Account suspended — funds held pending investigation.", processing:"—" },
];

const BROKER_EXPOSURE = {
  totalClientFunds: 1289500,
  totalOpenPositions: 724000,
  netExposure: 418000,
  hedgedExposure: 306000,
  floatingPnL: +18490,
  largestPos: { client:"Ahmed Al-Farsi", size:520000, symbol:"XAUUSD", side:"Buy" },
  byAsset: [
    { asset:"XAUUSD", exposure:312000, pct:43, direction:"Long", risk:"High" },
    { asset:"EURUSD", exposure:198000, pct:27, direction:"Mixed", risk:"Moderate" },
    { asset:"NASDAQ", exposure:144000, pct:20, direction:"Long", risk:"Moderate" },
    { asset:"BTCUSD", exposure:70000, pct:10, direction:"Short", risk:"High" },
  ],
};

const BROKER_RISKS = [
  { id:"BR-001", client:"C004", clientName:"Chen Wei", type:"Multi-Accounting", severity:"Critical", detected:"Auto", detail:"Same device fingerprint linked to 3 accounts registered within 72 hours. Account farm pattern detected.", ts:"03 Feb 2024 07:05" },
  { id:"BR-002", client:"C010", clientName:"Tunde Adeyemi", type:"Bonus Abuse", severity:"High", detected:"Auto", detail:"$2,000 welcome bonus received on 18 Apr. 96% of bonus utilised in low-risk hedged EURUSD positions within 24 hours. No genuine directional trading detected.", ts:"19 Apr 2024 14:22" },
  { id:"BR-003", client:"C003", clientName:"Raj Patel", type:"Latency Arbitrage", severity:"High", detected:"Auto", detail:"38 trades placed within 180ms of price feed refresh. Average hold time 1.2 seconds. Pattern consistent with known latency exploit.", ts:"10 Apr 2024 11:31" },
  { id:"BR-004", client:"C006", clientName:"Viktor Sorokin", type:"PEP Screening", severity:"High", detected:"Manual", detail:"Name match against PEP (Politically Exposed Person) database. Russia resident under enhanced screening. Manual review required before account activation.", ts:"14 Mar 2024 09:00" },
  { id:"BR-005", client:"C004", clientName:"Chen Wei", type:"Structuring", severity:"Critical", detected:"Auto", detail:"Three deposits of $49,800, $49,900, and $49,500 made within 5 days — pattern consistent with structuring to avoid $50,000 reporting threshold.", ts:"05 Feb 2024 10:15" },
  { id:"BR-006", client:"C010", clientName:"Tunde Adeyemi", type:"Source of Funds", severity:"Medium", detected:"Manual", detail:"Declared monthly income $1,200. Total deposits $20,000. Ratio inconsistent. Source of funds documentation requested, not yet received.", ts:"20 Apr 2024 08:00" },
];

const BROKER_IBS = [
  { id:"IB01", name:"FX Markets Africa", manager:"Segun Adeyemi", clients:4, activeClients:3, volume:14200000, commission:28400, convRate:75, tier:"Gold", status:"Active", joined:"01 Jan 2024" },
  { id:"IB02", name:"SA Trading Hub", manager:"Pieter van der Berg", clients:2, activeClients:2, volume:6800000, commission:13600, convRate:100, tier:"Silver", status:"Active", joined:"10 Jan 2024" },
  { id:"IB03", name:"Gulf Investments", manager:"Khalid Al-Rashid", clients:2, activeClients:2, volume:5100000, commission:10200, convRate:100, tier:"Silver", status:"Active", joined:"20 Feb 2024" },
];

const BROKER_COMP_VIOLATIONS = [
  { id:"CV-001", client:"C004", clientName:"Chen Wei", rule:"KYC Failure", severity:"Critical", detection:"Auto", ts:"03 Feb 2024 07:00", detail:"Identity document name mismatch. Liveness check failed. Account suspended per FSCA requirement." },
  { id:"CV-002", client:"C004", clientName:"Chen Wei", rule:"AML — Structuring", severity:"Critical", detection:"Auto", ts:"05 Feb 2024 10:15", detail:"Three deposits structured below $50,000 reporting threshold within 5 days." },
  { id:"CV-003", client:"C010", clientName:"Tunde Adeyemi", rule:"Source of Funds", severity:"High", detection:"Manual", ts:"20 Apr 2024 08:00", detail:"Deposit-to-income ratio inconsistent. Supporting documentation outstanding." },
  { id:"CV-004", client:"C006", clientName:"Viktor Sorokin", rule:"PEP Screening", severity:"High", detection:"Manual", ts:"14 Mar 2024 09:00", detail:"PEP database match. Enhanced due diligence in progress. Account not yet activated." },
  { id:"CV-005", client:"C003", clientName:"Raj Patel", rule:"Latency Arbitrage", severity:"Medium", detection:"Auto", ts:"10 Apr 2024 11:31", detail:"Systematic exploitation of price feed latency detected. Risk management team review required." },
  { id:"CV-006", client:"C010", clientName:"Tunde Adeyemi", rule:"Bonus Abuse", severity:"Medium", detection:"Auto", ts:"19 Apr 2024 14:22", detail:"Welcome bonus utilised in hedged positions only. No genuine trading intent. Bonus to be clawed back." },
];

const BROKER_TICKETS = [
  { id:"BT-001", client:"C004", subject:"Account access suspended — requesting reinstatement", status:"open", priority:"High", created:"04 Feb 2024", category:"Compliance", messages:5, ago:"1h ago", notes:"Client requesting reinstatement. KYC failure pending resolution. Do not reinstate until compliance team clears." },
  { id:"BT-002", client:"C010", subject:"Deposit not reflected in trading account", status:"open", priority:"Medium", created:"19 Apr 2024", category:"Billing", messages:2, ago:"3h ago", notes:"$20,000 deposit held pending source of funds review. Client unaware of AML hold." },
  { id:"BT-003", client:"C008", subject:"Withdrawal delay — VIP client", status:"escalated", priority:"Critical", created:"21 Apr 2024", category:"Withdrawal", messages:8, ago:"20m ago", notes:"VIP client $50,000 withdrawal pending 48h. Escalated to management. No compliance flag — processing delay only." },
  { id:"BT-004", client:"C003", subject:"Trade execution dispute", status:"open", priority:"Medium", created:"12 Apr 2024", category:"Dispute", messages:3, ago:"2h ago", notes:"Client disputes slippage on XAUUSD order. Compliance check on latency arbitrage flag in progress." },
  { id:"BT-005", client:"C002", subject:"Platform login issue after password reset", status:"resolved", priority:"Low", created:"05 Mar 2024", category:"Access", messages:4, ago:"3d ago", notes:"Resolved. Two-factor authentication reconfigured successfully." },
];

const BROKER_AUDIT = [
  { ts:"2024-04-21 10:00:00", action:"VIP withdrawal initiated — Ahmed Al-Farsi, $50,000", result:"Pending — compliance sign-off required" },
  { ts:"2024-04-20 16:20:00", action:"AML flag triggered — Tunde Adeyemi, deposit-income mismatch", result:"Funds held. Source of funds request sent." },
  { ts:"2024-04-19 14:22:00", action:"Bonus abuse detected — Tunde Adeyemi, hedged positions", result:"Bonus flagged for clawback. Risk team alerted." },
  { ts:"2024-04-15 14:00:00", action:"Withdrawal approved — Raj Patel, $15,000", result:"Sent to account ending 8821" },
  { ts:"2024-04-10 11:31:00", action:"Latency arbitrage pattern — Raj Patel, 38 trades", result:"Risk team reviewing. Account monitoring increased." },
  { ts:"2024-03-14 09:00:00", action:"PEP match — Viktor Sorokin, Russia resident", result:"Account activation paused. EDD in progress." },
  { ts:"2024-02-05 10:15:00", action:"Structuring detected — Chen Wei, 3 deposits below threshold", result:"STR filed. Account suspended." },
  { ts:"2024-02-03 07:00:00", action:"KYC failed — Chen Wei, document mismatch + liveness fail", result:"Account suspended. Client notified." },
];

/* ─────────────────────────────────────────────────────────────
   SHARED DATA (KYC and payments for broker use)
   ───────────────────────────────────────────────────────────── */
const KYC_DATA = {
  T001: { status:"Verified", verifiedDate:"03 Nov 2024", method:"Sumsub", docs:["Passport","Proof of Address"], notes:"Full verification passed. Singapore resident." },
  T002: { status:"Verified", verifiedDate:"04 Nov 2024", method:"Sumsub", docs:["Passport","Bank Statement"], notes:"Verified. India resident. Enhanced due diligence passed." },
  T003: { status:"Verified", verifiedDate:"07 Nov 2024", method:"Manual", docs:["Drivers Licence","Utility Bill"], notes:"Manually reviewed. US resident." },
  T004: { status:"Pending", verifiedDate:null, method:"Sumsub", docs:["Passport (uploaded)"], notes:"Documents uploaded. Awaiting automated review." },
  T005: { status:"Verified", verifiedDate:"09 Nov 2024", method:"Sumsub", docs:["Passport","Bank Statement","Selfie"], notes:"Verified. Ghana resident. Enhanced checks passed." },
  T006: { status:"Failed", verifiedDate:null, method:"Manual", docs:["Passport (rejected — expired)"], notes:"Document rejected. Expired passport submitted. Account suspended pending re-verification." },
  T007: { status:"Verified", verifiedDate:"12 Nov 2024", method:"Sumsub", docs:["National ID","Proof of Address"], notes:"Verified. Senegal resident." },
  T008: { status:"Verified", verifiedDate:"12 Nov 2024", method:"Sumsub", docs:["Passport","Bank Statement"], notes:"Verified. China resident." },
  T009: { status:"Pending", verifiedDate:null, method:"Sumsub", docs:["No documents uploaded yet"], notes:"Account in lead stage. KYC not yet initiated." },
  T010: { status:"Pending", verifiedDate:null, method:"Manual", docs:["Passport (uploaded — under review)"], notes:"Under manual review due to lot size violation. Compliance team reviewing." },
};

const RISK_DETAILS = {
  DEMO: { flagSource:"Auto", reasons:["Shared IP 192.168.1.10 detected across 3 accounts within 6 hours","Rule violation — lot size of 5.0 exceeded maximum of 4.0 on XAUUSD","Profit generated 94% in a single 2-hour session — consistency rule breach","Account registered same day as two other flagged accounts on the same IP"], payoutImpact:{ type:"blocked", amount:5200, label:"Blocked ($5,200)" }, recommendation:"reject", recommendationLabel:"Reject Payout", notes:"Trader appears profitable (+$5,200) but multiple automated flags prevent payout." },
  T001: { flagSource:"Auto", reasons:["Shared IP 192.168.1.10 detected across 3 accounts","Account registration patterns match known multi-account behaviour"], payoutImpact:{ type:"at-risk", amount:4320, label:"At Risk ($4,320)" }, recommendation:"review", recommendationLabel:"Review Required", notes:"IP cluster with T004 and T006. Review before payout." },
  T002: { flagSource:"System", reasons:[], payoutImpact:{ type:"eligible", amount:7100, label:"Eligible ($7,100)" }, recommendation:"safe", recommendationLabel:"Safe — Approve", notes:"No flags. Risk score 8. Phase 2 targets met. KYC verified." },
  T003: { flagSource:"Auto", reasons:["Max daily loss breached on 8 Nov 2024","Challenge failed — account locked","3 trades without stop loss prior to failure"], payoutImpact:{ type:"blocked", amount:0, label:"Blocked — Challenge Failed" }, recommendation:"reject", recommendationLabel:"Reject Payout", notes:"Challenge invalidated." },
  T004: { flagSource:"Auto", reasons:["Shared IP with Dmitri Volkov (Critical risk)","No payment received — possible test account"], payoutImpact:{ type:"blocked", amount:0, label:"Blocked — No Payment" }, recommendation:"freeze", recommendationLabel:"Freeze Account", notes:"No active trading. Flagged for shared IP with T006." },
  T005: { flagSource:"System", reasons:[], payoutImpact:{ type:"eligible", amount:12400, label:"Eligible ($12,400)" }, recommendation:"safe", recommendationLabel:"Safe — Approve", notes:"Clean record. Risk score 5. $200k account. Phase 2 targets exceeded." },
  T006: { flagSource:"Auto", reasons:["IP linked to 3 accounts","Temp email domain","Consistency rule failed — 78% profit in single session","Same device fingerprint across T001, T004, T006"], payoutImpact:{ type:"blocked", amount:0, label:"Blocked — Account Frozen" }, recommendation:"freeze", recommendationLabel:"Freeze Account", notes:"Critical risk. Compliance review in progress." },
  T007: { flagSource:"System", reasons:[], payoutImpact:{ type:"blocked", amount:0, label:"Blocked — Target Not Met" }, recommendation:"safe", recommendationLabel:"No Action Needed", notes:"Low risk. Phase 1 active. Profit target not yet reached." },
  T008: { flagSource:"System", reasons:[], payoutImpact:{ type:"eligible", amount:9800, label:"Eligible ($9,800)" }, recommendation:"safe", recommendationLabel:"Safe — Approve", notes:"Clean record. Risk score 3. Phase 2 complete." },
  T009: { flagSource:"System", reasons:[], payoutImpact:{ type:"blocked", amount:0, label:"Blocked — No Account" }, recommendation:"safe", recommendationLabel:"No Action Needed", notes:"Lead stage. No trading activity." },
  T010: { flagSource:"Auto", reasons:["Lot size violation on XAUUSD","Weekend holding rule breach"], payoutImpact:{ type:"at-risk", amount:2200, label:"At Risk ($2,200)" }, recommendation:"review", recommendationLabel:"Review Required", notes:"Two rule violations. Manual review recommended." },
};

/* ─────────────────────────────────────────────────────────────
   UTILS
   ───────────────────────────────────────────────────────────── */
const $ = (n) => n.toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 });
const $k = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : $(n);

const riskColor = (l) => ({ Low:C.green, Elevated:C.amber, High:C.red, Critical:C.red }[l] || C.muted);
const stageColor = (s) => ({ lead:C.muted, signup:C.blue, active:C.green, passed:C.green, failed:C.red, flagged:C.red, suspended:C.red, onboarding:C.amber, dormant:C.faint }[s] || C.muted);
const prioColor = (p) => ({ Critical:C.red, High:C.red, Medium:C.amber, Low:C.faint }[p] || C.faint);
const severityColor = (s) => ({ High:C.red, Medium:C.amber, Low:C.blue, Critical:C.red }[s] || C.faint);
const eligibilityColor = (e) => ({ Eligible:C.green, "Not Eligible":C.red, "Under Review":C.amber }[e] || C.faint);
const resultColor = (r) => ({ Passed:C.green, Failed:C.red, Flagged:C.amber }[r] || C.faint);
const payoutStatusColor = (s) => ({ Pending:C.amber, Approved:C.green, Flagged:C.red }[s] || C.faint);
const kycColor = (s) => ({ Verified:C.green, Pending:C.amber, Failed:C.red }[s] || C.faint);
const payStatusColor = (s) => ({ Approved:C.green, Processing:C.amber, Flagged:C.red }[s] || C.faint);
const payTypeColor = (t) => ({ Deposit:C.blue, Withdrawal:C.purple }[t] || C.faint);

/* ─────────────────────────────────────────────────────────────
   ATOMS
   ───────────────────────────────────────────────────────────── */
const Pip = ({ color, pulse=false }) => (
  <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, boxShadow:`0 0 6px ${color}`, animation:pulse?"blink 2s infinite":"none" }} />
);

const Tag = ({ children, color=C.muted }) => (
  <span style={{ display:"inline-flex", alignItems:"center", background:`${color}14`, color, border:`1px solid ${color}30`, borderRadius:5, padding:"2px 9px", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>
    {children}
  </span>
);

const Av = ({ i, size=30, color=C.green }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:`${color}12`, border:`1.5px solid ${color}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.33, fontWeight:700, color, letterSpacing:"-0.01em" }}>
    {i}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   TABLE ATOMS
   ───────────────────────────────────────────────────────────── */
const Th = ({ c, children }) => (
  <th style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:C.faint, letterSpacing:"0.07em", textTransform:"uppercase", background:C.card, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap", ...c }}>
    {children}
  </th>
);
const Td = ({ c, children }) => (
  <td style={{ padding:"13px 16px", fontSize:13, color:C.muted, borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", ...c }}>
    {children}
  </td>
);
const TRow = ({ children, onClick, highlight=false }) => {
  const [hov, setHov] = useState(false);
  return (
    <tr style={{ background:highlight?`${C.red}07`:hov?C.hover:"transparent", transition:"background 0.12s", cursor:onClick?"pointer":"default" }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}>
      {children}
    </tr>
  );
};

const Card = ({ children, s={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.rL, overflow:"hidden", ...s }}>
    {children}
  </div>
);

const CardHead = ({ title, right, sub, accent }) => (
  <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:sub?"flex-start":"center", position:"relative", overflow:"hidden" }}>
    {accent && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${accent},transparent)` }} />}
    <div>
      <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{title}</div>
      {sub && <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>{sub}</div>}
    </div>
    {right}
  </div>
);

const Stat = ({ label, value, sub, trend, accent=C.green }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.rL, padding:"22px 24px", position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:0, left:24, right:24, height:1, background:`linear-gradient(90deg,transparent,${accent}55,transparent)` }} />
    <div style={{ fontSize:11, color:C.faint, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:14 }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:800, color:C.text, letterSpacing:"-0.03em", lineHeight:1, marginBottom:8 }}>{value}</div>
    {(sub||trend!=null) && (
      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
        {trend!=null && <span style={{ color:trend>=0?C.green:C.red, fontWeight:600 }}>{trend>=0?"↑":"↓"} {Math.abs(trend)}%</span>}
        {sub && <span style={{ color:C.faint }}>{sub}</span>}
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   CHARTS
   ───────────────────────────────────────────────────────────── */
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d=>d.v));
  const colors = [C.faint,C.faint,C.faint,C.green,C.green,C.green];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:72 }}>
      {data.map((d,i)=>(
        <div key={d.m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
          <div style={{ width:"100%", background:colors[i], borderRadius:"4px 4px 0 0", height:`${(d.v/max)*64}px`, minHeight:4 }} />
          <span style={{ fontSize:9, color:C.faint, fontWeight:500 }}>{d.m}</span>
        </div>
      ))}
    </div>
  );
};

const Funnel = ({ data }) => {
  const max = data[0].n;
  const colors = [C.muted,C.blue,C.purple,C.green];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {data.map((d,i)=>{
        const w = (d.n/max)*100;
        const drop = i>0?Math.round((d.n/data[i-1].n)*100):null;
        return (
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5 }}>
              <span style={{ fontSize:12, color:C.muted }}>{d.label}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {drop && <span style={{ fontSize:10, color:C.faint, background:C.hover, padding:"1px 6px", borderRadius:4 }}>{drop}% convert</span>}
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{d.n.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ height:6, background:C.hover, borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${w}%`, background:colors[i], borderRadius:3, transition:"width 0.7s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PROP COMPONENTS
   ───────────────────────────────────────────────────────────── */
function PayoutQueueRow({ item }) {
  const [status, setStatus] = useState(item.status);
  const trader = TRADERS.find(t=>t.name===item.trader);
  const col = payoutStatusColor(status);
  return (
    <TRow highlight={status==="Flagged"}>
      <Td>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          {trader && <Av i={trader.avatar} size={28} color={col} />}
          <div>
            <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{item.trader}</div>
            <div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{item.id}</div>
          </div>
        </div>
      </Td>
      <Td><span style={{ fontFamily:"monospace", fontSize:11, color:C.faint }}>{item.accountId}</span></Td>
      <Td><span style={{ fontFamily:"monospace", fontWeight:700, color:item.profit>0?C.green:C.faint }}>{item.profit>0?$(item.profit):"—"}</span></Td>
      <Td><Tag color={col}>{status}</Tag></Td>
      <Td c={{ fontSize:12, color:status==="Flagged"?C.red:C.faint, maxWidth:260 }}>{item.reason||"—"}</Td>
      <Td>
        {status==="Pending" && (
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>setStatus("Approved")} style={{ padding:"4px 11px", background:C.green, color:"#000", border:"none", borderRadius:5, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Approve</button>
            <button onClick={()=>setStatus("Flagged")} style={{ padding:"4px 11px", background:"none", color:C.red, border:`1px solid ${C.red}40`, borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Flag</button>
          </div>
        )}
        {status==="Approved" && <span style={{ fontSize:11, color:C.green, fontWeight:600 }}>Processed</span>}
        {status==="Flagged" && <span style={{ fontSize:11, color:C.red, fontWeight:600 }}>Under Review</span>}
      </Td>
    </TRow>
  );
}

function PayoutRow({ p }) {
  const [approved, setApproved] = useState(false);
  const trader = TRADERS.find(t=>t.name===p.trader);
  return (
    <TRow>
      <Td>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          {trader && <Av i={trader.avatar} size={28} color={stageColor(trader.stage)} />}
          <span style={{ fontWeight:600, color:C.text }}>{p.trader}</span>
        </div>
      </Td>
      <Td><span style={{ fontFamily:"monospace", color:C.muted }}>${p.balance.toLocaleString()}</span></Td>
      <Td><span style={{ fontFamily:"monospace", fontWeight:700, color:p.profit>=0?C.green:C.red }}>{p.profit>=0?"+":""}{$(p.profit)}</span></Td>
      <Td><span style={{ fontFamily:"monospace", fontWeight:700, color:p.eligible?C.green:C.faint }}>{p.eligible?"$"+(p.profit*0.8).toLocaleString():"—"}</span></Td>
      <Td><Tag color={p.eligible?C.green:C.red}>{p.eligible?"Yes":"No"}</Tag></Td>
      <Td c={{ fontSize:12, color:p.eligible?C.faint:C.red, maxWidth:240 }}>{p.reason}</Td>
      <Td>
        {p.eligible?(
          <button onClick={()=>setApproved(true)} style={{ padding:"5px 13px", background:approved?C.surface:C.green, color:approved?C.green:"#000", border:`1px solid ${C.green}`, borderRadius:6, fontSize:11, fontWeight:700, cursor:approved?"default":"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
            {approved?"Approved":"Approve"}
          </button>
        ):(<span style={{ fontSize:11, color:C.faint }}>—</span>)}
      </Td>
    </TRow>
  );
}

function WebhookSim() {
  const [log, setLog] = useState(WEBHOOK_INIT);
  const [busy, setBusy] = useState(null);
  const TRIGGERS = [
    { id:"payment.completed", label:"Payment Received", color:C.green },
    { id:"account.created", label:"Account Created", color:C.blue },
    { id:"challenge.failed", label:"Challenge Failed", color:C.red },
    { id:"risk.flagged", label:"Risk Flag", color:C.amber },
  ];
  const fire = (trig) => {
    setBusy(trig.id);
    const t = TRADERS[Math.floor(Math.random()*TRADERS.length)];
    const actions = { "payment.completed":`Account ${t.id}-MT5 provisioned`, "account.created":`Welcome email sent to ${t.email}`, "challenge.failed":`Support ticket created for ${t.id}`, "risk.flagged":`Risk team alerted — ${t.id} suspended` };
    setTimeout(()=>{
      setLog(prev=>[{ id:Date.now(), event:trig.id, traderId:t.id, ts:new Date().toTimeString().slice(0,5), ok:trig.id==="risk.flagged"?"warn":trig.id.includes("fail")?false:true, action:actions[trig.id] }, ...prev.slice(0,7)]);
      setBusy(null);
    }, 650);
  };
  const dot = (ok) => ok===true?C.green:ok==="warn"?C.amber:C.red;
  return (
    <div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
        {TRIGGERS.map(trig=>(
          <button key={trig.id} onClick={()=>fire(trig)} disabled={!!busy}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px", background:busy===trig.id?`${trig.color}15`:C.surface, color:busy===trig.id?trig.color:C.muted, border:`1px solid ${busy===trig.id?trig.color+"40":C.border}`, borderRadius:7, cursor:"pointer", fontSize:12, fontFamily:"inherit", transition:"all 0.15s" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:trig.color, display:"inline-block" }} />
            {busy===trig.id?"Firing…":trig.label}
          </button>
        ))}
      </div>
      <div style={{ borderRadius:9, border:`1px solid ${C.border}`, overflow:"hidden", background:C.bg }}>
        <div style={{ display:"grid", gridTemplateColumns:"28px 180px 55px 1fr 55px 70px", padding:"8px 16px", borderBottom:`1px solid ${C.border}` }}>
          {["","EVENT","TRADER","ACTION","TIME","LATENCY"].map(h=>(
            <span key={h} style={{ fontSize:9, color:C.faint, fontWeight:700, letterSpacing:"0.08em" }}>{h}</span>
          ))}
        </div>
        {log.map((e,i)=>(
          <div key={e.id} style={{ display:"grid", gridTemplateColumns:"28px 180px 55px 1fr 55px 70px", padding:"10px 16px", background:i===0?`${C.green}05`:"transparent", borderBottom:i<log.length-1?`1px solid ${C.border}`:"none", alignItems:"center" }}>
            <Pip color={dot(e.ok)} />
            <span style={{ fontSize:11, color:C.green, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.event}</span>
            <span style={{ fontSize:11, color:C.muted, fontFamily:"monospace" }}>{e.traderId}</span>
            <span style={{ fontSize:11, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.action}</span>
            <span style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{e.ts}</span>
            <span style={{ fontSize:10, color:C.green, fontFamily:"monospace" }}>{Math.floor(Math.random()*100+20)}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REPLY MODAL (shared)
   ───────────────────────────────────────────────────────────── */
function ReplyModal({ ticket, personName, onClose }) {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const firstName = personName?.split(" ")[0] || "there";
  const send = () => {
    if(!body.trim()) return;
    setSent(true);
    setTimeout(()=>{ setSent(false); setBody(""); }, 2200);
  };
  const templates = [
    `Hi ${firstName}, we're looking into this now and will update you within 24 hours.`,
    `Hi ${firstName}, your account has been reviewed and we've resolved the issue.`,
    `Hi ${firstName}, can you please provide a screenshot of the error you're seeing?`,
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:300, backdropFilter:"blur(4px)" }} />
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:560, maxHeight:"90vh", background:C.card, border:`1px solid ${C.borderHi}`, borderRadius:14, zIndex:301, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Reply — {ticket.id}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>✕</button>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:24 }}>
          <div style={{ fontSize:10, color:C.faint, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:600, marginBottom:10 }}>Quick templates</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:18 }}>
            {templates.map((t,i)=>(
              <button key={i} onClick={()=>setBody(t)} style={{ textAlign:"left", padding:"9px 13px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:C.r, fontSize:12, color:C.muted, cursor:"pointer", fontFamily:"inherit", lineHeight:1.5 }}>{t}</button>
            ))}
          </div>
          <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your reply…" rows={5} style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:C.r, color:C.text, fontSize:13, padding:"12px 14px", fontFamily:"inherit", resize:"vertical", lineHeight:1.6 }} />
        </div>
        <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
          {sent?(
            <div style={{ flex:1, padding:10, background:C.greenDim, border:`1px solid ${C.greenMid}`, borderRadius:C.r, fontSize:13, color:C.green, textAlign:"center", fontWeight:600 }}>Reply sent successfully</div>
          ):(
            <>
              <button onClick={send} disabled={!body.trim()} style={{ flex:1, padding:"10px", cursor:body.trim()?"pointer":"not-allowed", background:body.trim()?C.green:C.surface, color:body.trim()?"#000":C.faint, border:`1px solid ${body.trim()?C.green:C.border}`, borderRadius:C.r, fontSize:13, fontWeight:700, fontFamily:"inherit", transition:"all 0.15s" }}>Send Reply</button>
              <button onClick={onClose} style={{ padding:"10px 20px", background:"none", color:C.muted, border:`1px solid ${C.border}`, borderRadius:C.r, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROP FIRM PAGES
   ───────────────────────────────────────────────────────────── */
function PropOverview({ traders, payoutQueue, ruleViolations }) {
  const { stats, loading } = useLiveOverview("prop");
  const { breached } = useDrawdownMonitor(10);
  const $k2 = (n) => !n||isNaN(n)?"$0":n>=1000000?`$${(n/1000000).toFixed(2)}M`:n>=1000?`$${(n/1000).toFixed(1)}k`:`$${Number(n).toLocaleString()}`;
  const totalRev = traders.filter(t=>t.accountSize>0).reduce((s,t)=>s+t.accountSize*0.08,0);
  const pendingPayouts = payoutQueue.filter(p=>p.status==="Pending").length;
  const flaggedPayouts = payoutQueue.filter(p=>p.status==="Flagged").length;
  const underReview = traders.filter(t=>t.payoutEligibility==="Under Review").length;
  const revMonths = REV_MONTHS;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {!loading && stats.totalAccounts > 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.green}30`, borderRadius:C.rL, padding:"16px 20px" }}>
          <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>⬤ Live Data — Condor API</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[
              { label:"Live Accounts", value:stats.totalAccounts, color:C.green },
              { label:"Total Funds", value:$k2(stats.totalFunds), color:C.green },
              { label:"Total Equity", value:$k2(stats.totalEquity), color:C.blue },
              { label:"Drawdown Alerts", value:breached.length, color:breached.length>0?C.red:C.green },
            ].map(s=>(
              <div key={s.label}>
                <div style={{ fontSize:10, color:C.faint, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:24, fontWeight:800, color:s.color, letterSpacing:"-0.02em" }}>{s.value}</div>
              </div>
            ))}
          </div>
          {breached.length > 0 && (
            <div style={{ marginTop:12, padding:"10px 14px", background:C.redDim, border:`1px solid ${C.red}25`, borderRadius:C.r, fontSize:12, color:C.red }}>
              ⚠ {breached.length} account(s) breached drawdown limit and were auto-disabled
            </div>
          )}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Revenue" value={$k(totalRev)} trend={12.4} sub="all-time" accent={C.green} />
        <Stat label="Active Traders" value={traders.filter(t=>t.stage==="active").length} trend={8} sub={`of ${traders.length} enrolled`} accent={C.green} />
        <Stat label="Pending Payouts" value={pendingPayouts} sub="awaiting approval" accent={C.amber} />
        <Stat label="Rule Violations" value={ruleViolations.length} sub="this cycle" accent={C.red} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {[
          { label:"Accounts Under Review", value:underReview, color:C.red, sub:"Compliance hold — payouts blocked" },
          { label:"Disputed Payouts", value:flaggedPayouts, color:C.amber, sub:"Flagged — manual review required" },
          { label:"Automated Decisions", value:"83%", color:C.green, sub:"17% required manual intervention" },
        ].map(m=>(
          <div key={m.label} style={{ background:C.card, border:`1px solid ${m.color}22`, borderRadius:C.rL, padding:"18px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${m.color},transparent)` }} />
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10 }}>{m.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:m.color, letterSpacing:"-0.03em", lineHeight:1, marginBottom:6 }}>{m.value}</div>
            <div style={{ fontSize:12, color:C.faint }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:14 }}>
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14 }}>Monthly Revenue</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:"-0.03em" }}>$34.1k</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                  <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>↑ 18.7%</span>
                  <span style={{ color:C.faint, fontSize:12 }}>vs October</span>
                </div>
              </div>
              <Tag color={C.green}>Best month</Tag>
            </div>
            <BarChart data={revMonths} />
          </div>
        </Card>
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:16 }}>Conversion Funnel</div>
            <Funnel data={FUNNEL} />
            <div style={{ marginTop:16, padding:"10px 14px", background:C.hover, borderRadius:8 }}>
              <div style={{ fontSize:10, color:C.faint, marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>Lead → Active</div>
              <div style={{ fontSize:20, fontWeight:800, color:C.green }}>31.0%</div>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <CardHead title="Recent Trader Activity" sub="Payout eligibility and violation status included" right={<Tag color={C.faint}>{traders.length} traders</Tag>} />
        <table>
          <thead><tr>{["Trader","Stage","P&L","Risk","Payout Eligibility","Violations"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {traders.slice(0,8).map(t=>(
              <TRow key={t.id} highlight={t.hasViolation}>
                <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av i={t.avatar} size={30} color={stageColor(t.stage)} /><div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{t.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{t.id}</div></div></div></Td>
                <Td><Tag color={stageColor(t.stage)}>{t.stage.charAt(0).toUpperCase()+t.stage.slice(1)}</Tag></Td>
                <Td c={{ color:t.pnl>=0?C.green:C.red, fontFamily:"monospace", fontWeight:600 }}>{t.pnl?(t.pnl>0?"+":"")+$(t.pnl):"—"}</Td>
                <Td><Tag color={riskColor(t.riskLevel)}>{t.riskLevel}</Tag></Td>
                <Td><Tag color={eligibilityColor(t.payoutEligibility)}>{t.payoutEligibility}</Tag></Td>
                <Td>{t.hasViolation?<Tag color={C.red}>Violation on file</Tag>:<span style={{ color:C.faint, fontSize:12, opacity:0.45 }}>Clean</span>}</Td>
              </TRow>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PropLifecycle({ traders }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
        {["lead","signup","active","passed","failed","flagged"].map(s=>{
          const ct = traders.filter(t=>t.stage===s).length;
          return (
            <div key={s} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.r, padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:800, color:stageColor(s), letterSpacing:"-0.03em" }}>{ct}</div>
              <div style={{ fontSize:10, color:C.faint, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s}</div>
            </div>
          );
        })}
      </div>
      <Card>
        <div style={{ padding:"20px 24px" }}>
          <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:16 }}>Trader Journey</div>
          <div style={{ display:"flex", alignItems:"center" }}>
            {["Lead","Signup","Payment","Phase 1","Phase 2","Funded"].map((s,i,arr)=>(
              <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", border:`2px solid ${C.green}`, background:`${C.green}10`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:12, fontWeight:700, color:C.green }}>{i+1}</div>
                  <div style={{ fontSize:11, color:C.muted, fontWeight:500 }}>{s}</div>
                </div>
                {i<arr.length-1 && <div style={{ width:20, height:1, background:`linear-gradient(90deg,${C.green}55,${C.border})`, flexShrink:0 }} />}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <CardHead title="All Traders" sub="Includes payout eligibility and violation status" right={<Tag color={C.faint}>{traders.length}</Tag>} />
        <table>
          <thead><tr>{["Trader","Stage","Challenge","P&L","Risk","Payout Eligibility","Violations"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {traders.map(t=>(
              <TRow key={t.id} highlight={t.hasViolation}>
                <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av i={t.avatar} size={30} color={stageColor(t.stage)} /><div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{t.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{t.id}</div></div></div></Td>
                <Td><Tag color={stageColor(t.stage)}>{t.stage.charAt(0).toUpperCase()+t.stage.slice(1)}</Tag></Td>
                <Td c={{ fontFamily:"monospace", fontSize:11, color:C.faint }}>{t.challenge||"—"}</Td>
                <Td c={{ color:t.pnl>=0?C.green:C.red, fontFamily:"monospace", fontWeight:600 }}>{t.pnl?(t.pnl>0?"+":"")+$(t.pnl):"—"}</Td>
                <Td><Tag color={riskColor(t.riskLevel)}>{t.riskLevel}</Tag></Td>
                <Td><Tag color={eligibilityColor(t.payoutEligibility)}>{t.payoutEligibility}</Tag></Td>
                <Td>{t.hasViolation?<Tag color={C.red}>Active</Tag>:<span style={{ color:C.faint, opacity:0.4, fontSize:12 }}>None</span>}</Td>
              </TRow>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PropViolations() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Violations" value={RULE_VIOLATIONS.length} sub="This cycle" accent={C.red} />
        <Stat label="High Severity" value={RULE_VIOLATIONS.filter(v=>v.severity==="High").length} sub="Immediate" accent={C.red} />
        <Stat label="Auto-Detected" value={RULE_VIOLATIONS.filter(v=>v.detection==="Auto").length} sub="By system" accent={C.green} />
        <Stat label="Manual Review" value={RULE_VIOLATIONS.filter(v=>v.detection==="Manual").length} sub="By risk team" accent={C.amber} />
      </div>
      <Card s={{ border:`1px solid ${C.red}18` }}>
        <CardHead title="Rule Violations Panel" sub="All violations detected this cycle — sorted by severity" accent={C.red} right={<Tag color={C.red}>{RULE_VIOLATIONS.length} violations</Tag>} />
        <table>
          <thead><tr>{["Trader","Account","Rule Broken","Severity","Detection","Timestamp","Detail"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {[...RULE_VIOLATIONS].sort((a,b)=>["High","Medium","Low"].indexOf(a.severity)-["High","Medium","Low"].indexOf(b.severity)).map(v=>{
              const trader = TRADERS.find(t=>t.name===v.trader);
              return (
                <TRow key={v.id} highlight={v.severity==="High"}>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:9 }}>{trader&&<Av i={trader.avatar} size={27} color={severityColor(v.severity)} />}<span style={{ fontWeight:600, color:C.text, fontSize:13 }}>{v.trader}</span></div></Td>
                  <Td><span style={{ fontFamily:"monospace", fontSize:11, color:C.faint }}>{v.accountId}</span></Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:7 }}><Pip color={severityColor(v.severity)} /><span style={{ fontWeight:600, color:C.text, fontSize:12 }}>{v.rule}</span></div></Td>
                  <Td><Tag color={severityColor(v.severity)}>{v.severity}</Tag></Td>
                  <Td><Tag color={v.detection==="Auto"?C.green:C.purple}>{v.detection}</Tag></Td>
                  <Td c={{ fontFamily:"monospace", fontSize:10, color:C.faint, whiteSpace:"nowrap" }}>{v.ts}</Td>
                  <Td c={{ fontSize:11, color:C.faint, maxWidth:260, lineHeight:1.5 }}>{v.detail}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PropPayouts() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Pending Approval" value={PAYOUT_QUEUE.filter(p=>p.status==="Pending").length} sub="Awaiting review" accent={C.amber} />
        <Stat label="Approved" value={PAYOUT_QUEUE.filter(p=>p.status==="Approved").length} sub="Ready to process" accent={C.green} />
        <Stat label="Flagged" value={PAYOUT_QUEUE.filter(p=>p.status==="Flagged").length} sub="Manual review needed" accent={C.red} />
        <Stat label="Total Value" value={$k(PAYOUT_QUEUE.filter(p=>p.status!=="Flagged").reduce((s,p)=>s+p.profit,0))} sub="Approved + Pending" accent={C.green} />
      </div>
      <Card s={{ border:`1px solid ${C.amber}18` }}>
        <CardHead title="Payout Queue" sub="Approve or flag each payout — actions take effect immediately" accent={C.amber} right={<div style={{ display:"flex", gap:8 }}><Tag color={C.amber}>{PAYOUT_QUEUE.filter(p=>p.status==="Pending").length} pending</Tag><Tag color={C.red}>{PAYOUT_QUEUE.filter(p=>p.status==="Flagged").length} flagged</Tag></div>} />
        <table>
          <thead><tr>{["Trader","Account ID","Profit","Status","Reason","Action"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>{PAYOUT_QUEUE.map(item=><PayoutQueueRow key={item.id} item={item} />)}</tbody>
        </table>
      </Card>
      <Card>
        <CardHead title="Payout Eligibility" sub="Determines which traders can request profit payouts this cycle" />
        <table>
          <thead><tr>{["Trader","Balance","Profit","80% Split","Eligible","Reason","Action"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>{PAYOUTS_DATA.map((p,i)=><PayoutRow key={i} p={p} />)}</tbody>
        </table>
      </Card>
    </div>
  );
}

function PropAutomation() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Webhooks Fired" value="847" trend={6} sub="Last 30 days" accent={C.green} />
        <Stat label="Success Rate" value="98.2%" trend={0.3} sub="16 failures" accent={C.green} />
        <Stat label="Avg Latency" value="143ms" sub="p99: 820ms" accent={C.blue} />
        <Stat label="Active Triggers" value="4" sub="all healthy" accent={C.amber} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
        {[
          { trigger:"payment.completed", label:"Create Trading Account", desc:"Provisions MT4/MT5 with leverage, lot size, and drawdown limits set per plan.", color:C.green, count:61, ok:true },
          { trigger:"account.created", label:"Send Welcome Email", desc:"Sends onboarding sequence — login credentials, challenge rules, video guides.", color:C.blue, count:61, ok:true },
          { trigger:"challenge.failed", label:"Create Support Ticket", desc:"Auto-opens a ticket, notifies risk team, and queues a retry-discount offer.", color:C.red, count:12, ok:true },
          { trigger:"risk.flagged", label:"Suspend & Alert Compliance", desc:"Suspends account access, sends Slack alert, schedules manual review within 2h.", color:C.amber, count:3, ok:false },
        ].map(wf=>(
          <div key={wf.trigger} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.rL, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                  <Pip color={wf.ok?C.green:C.amber} />
                  <span style={{ fontFamily:"monospace", fontSize:11, color:C.faint }}>{wf.trigger}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{wf.label}</div>
              </div>
              <div style={{ background:`${wf.color}14`, color:wf.color, border:`1px solid ${wf.color}28`, borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:700, flexShrink:0, marginLeft:12 }}>{wf.count}×</div>
            </div>
            <div style={{ fontSize:12, color:C.faint, lineHeight:1.65 }}>{wf.desc}</div>
          </div>
        ))}
      </div>
      <Card>
        <CardHead title="Live Event Stream" sub="Click a trigger to simulate a webhook event" right={<div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.green }}><Pip color={C.green} pulse={true} />Listening</div>} />
        <div style={{ padding:"20px 24px" }}><WebhookSim /></div>
      </Card>
    </div>
  );
}

function PropRisk({ traders, demoMode }) {
  const [expandedId, setExpandedId] = useState(null);
  const sorted = [...traders].sort((a,b)=>(b.isDemo?1:-1)||(b.riskScore-a.riskScore));
  const ACTIONS_LIST = [
    { id:"approve", label:"Approve", icon:"✓", bg:C.green, fg:"#000" },
    { id:"reject", label:"Reject", icon:"✕", bg:"none", fg:C.red, border:C.red },
    { id:"review", label:"Review", icon:"⊙", bg:"none", fg:C.amber, border:C.amber },
    { id:"freeze", label:"Freeze", icon:"❄", bg:"none", fg:C.blue, border:C.blue },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Critical Risk" value={traders.filter(t=>t.riskLevel==="Critical").length} sub="Immediate action" accent={C.red} />
        <Stat label="High Risk" value={traders.filter(t=>t.riskLevel==="High").length} sub="Monitoring" accent={C.red} />
        <Stat label="Shared IPs" value="3" sub="Same IP cluster" accent={C.amber} />
        <Stat label="Under Review" value={traders.filter(t=>t.payoutEligibility==="Under Review").length} sub="Compliance hold" accent={C.blue} />
      </div>
      <Card>
        <CardHead title="Risk Decision Board — All Traders" sub="Click any row to see full flag detail" accent={C.red} />
        <div style={{ overflowX:"auto" }}>
          <table>
            <thead><tr>{["Trader","IP Address","Risk Level","Flags","Payout Impact","Recommended Action","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {sorted.map(t=>{
                const detail = RISK_DETAILS[t.id];
                const sip = traders.filter(x=>x.ip===t.ip&&x.id!==t.id);
                const flags = [];
                if(sip.length>0) flags.push({ label:"Shared IP", color:C.red });
                if(t.email.includes("temp")) flags.push({ label:"Temp Email", color:C.amber });
                if(t.riskLevel==="Critical") flags.push({ label:"Critical", color:C.red });
                if(t.hasViolation) flags.push({ label:"Violation", color:C.red });
                const imp = detail?.payoutImpact;
                const impColor = ({ eligible:C.green, "at-risk":C.amber, blocked:C.red }[imp?.type])||C.faint;
                const recC = ({ safe:C.green, review:C.amber, reject:C.red, freeze:C.red }[detail?.recommendation])||C.faint;
                return (
                  <RiskRow key={t.id} t={t} sip={sip} flags={flags} detail={detail} imp={imp} impColor={impColor} recC={recC} demoMode={demoMode} ACTIONS_LIST={ACTIONS_LIST} onExpand={setExpandedId} />
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {expandedId && (
        <>
          <div onClick={()=>setExpandedId(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:400 }} />
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:540, maxHeight:"85vh", overflowY:"auto", background:C.card, border:`1px solid ${C.borderHi}`, borderRadius:16, zIndex:401, padding:24 }}>
            {(() => {
              const t = traders.find(x=>x.id===expandedId);
              const detail = RISK_DETAILS[expandedId];
              if(!t||!detail) return null;
              return (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Av i={t.avatar} size={44} color={riskColor(t.riskLevel)} />
                      <div>
                        <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{t.name}</div>
                        <Tag color={riskColor(t.riskLevel)}>{t.riskLevel} Risk — Score {t.riskScore}/100</Tag>
                      </div>
                    </div>
                    <button onClick={()=>setExpandedId(null)} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }}>✕</button>
                  </div>
                  {detail.reasons.length>0 && (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:10, color:C.faint, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Why Flagged</div>
                      {detail.reasons.map((r,i)=>(
                        <div key={i} style={{ display:"flex", gap:10, padding:"10px 12px", background:C.redDim, border:`1px solid ${C.red}20`, borderRadius:8, marginBottom:6 }}>
                          <span style={{ color:C.red, fontSize:13, flexShrink:0 }}>⚑</span>
                          <span style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding:"12px 14px", background:C.surface, borderRadius:8, border:`1px solid ${C.border}`, fontSize:12, color:C.muted, lineHeight:1.7 }}>{detail.notes}</div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}

function RiskRow({ t, sip, flags, detail, imp, impColor, recC, demoMode, ACTIONS_LIST, onExpand }) {
  const [action, setAction] = useState(null);
  const glow = demoMode && t.isDemo;
  return (
    <tr style={{ background:t.isDemo?`linear-gradient(90deg,${C.amber}0A,${C.red}06,transparent)`:"transparent", borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}
      onClick={()=>onExpand(t.id)}
      onMouseEnter={e=>{ if(!t.isDemo) e.currentTarget.style.background=C.hover; }}
      onMouseLeave={e=>{ if(!t.isDemo) e.currentTarget.style.background="transparent"; }}>
      <td style={{ padding:"14px 16px", verticalAlign:"middle" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Av i={t.avatar} size={32} color={t.isDemo?C.amber:riskColor(t.riskLevel)} />
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ fontWeight:700, color:C.text, fontSize:13 }}>{t.name}</span>
              {t.isDemo && <span style={{ fontSize:9, fontWeight:700, color:C.amber, background:C.amberDim, border:`1px solid ${C.amber}40`, borderRadius:3, padding:"1px 7px", letterSpacing:"0.07em" }}>DEMO</span>}
            </div>
            <div style={{ fontSize:10, color:C.faint, fontFamily:"monospace", marginTop:2 }}>{t.id} · {t.country}</div>
          </div>
        </div>
      </td>
      <td style={{ padding:"14px 16px", verticalAlign:"middle" }}>
        <span style={{ fontFamily:"monospace", fontSize:11, color:sip.length>0?C.red:C.faint }}>{t.ip}</span>
        {sip.length>0 && <div style={{ fontSize:9, color:C.red, fontWeight:700 }}>{sip.length} account{sip.length>1?"s":""} linked</div>}
      </td>
      <td style={{ padding:"14px 16px", verticalAlign:"middle" }}>
        <Tag color={riskColor(t.riskLevel)}>{t.riskLevel}</Tag>
        <div style={{ fontSize:10, color:C.faint, fontFamily:"monospace", marginTop:4 }}>Score {t.riskScore}/100</div>
      </td>
      <td style={{ padding:"14px 16px", verticalAlign:"middle" }}>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {flags.map(f=><Tag key={f.label} color={f.color}>{f.label}</Tag>)}
          {!flags.length && <span style={{ color:C.faint, opacity:0.4, fontSize:12 }}>Clean</span>}
        </div>
      </td>
      <td style={{ padding:"14px 16px", verticalAlign:"middle" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${impColor}12`, color:impColor, border:`1px solid ${impColor}28`, borderRadius:7, padding:"4px 10px", fontSize:11, fontWeight:800, whiteSpace:"nowrap" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:impColor, display:"inline-block", boxShadow:`0 0 5px ${impColor}` }} />
          {imp?.label||"—"}
        </div>
      </td>
      <td style={{ padding:"14px 16px", verticalAlign:"middle" }}>
        <span style={{ fontSize:12, fontWeight:700, color:recC }}>{detail?.recommendationLabel||"—"}</span>
      </td>
      <td style={{ padding:"14px 16px", verticalAlign:"middle" }} onClick={e=>e.stopPropagation()}>
        {action?(
          <span style={{ fontSize:12, fontWeight:700, color:{ approve:C.green, reject:C.red, review:C.amber, freeze:C.blue }[action] }}>
            {{ approve:"Approved", reject:"Rejected", review:"In Review", freeze:"Frozen" }[action]}
          </span>
        ):(
          <div style={{ display:"flex", gap:5 }}>
            {ACTIONS_LIST.map(a=>(
              <button key={a.id} onClick={()=>setAction(a.id)} style={{ height:28, padding:"0 8px", borderRadius:7, background:a.bg==="none"?"transparent":a.bg, color:a.fg, border:`1.5px solid ${a.border||a.bg}`, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" }}>
                {a.icon}
              </button>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

function PropRiskPayouts() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Valid Trades" value={TRADES_DATA.filter(t=>t.status==="Valid").length} accent={C.green} />
        <Stat label="Violated Trades" value={TRADES_DATA.filter(t=>t.status==="Violated").length} accent={C.red} />
        <Stat label="Eligible Payouts" value={PAYOUTS_DATA.filter(p=>p.eligible).length} accent={C.green} />
        <Stat label="Total Eligible" value={$k(PAYOUTS_DATA.filter(p=>p.eligible).reduce((s,p)=>s+p.profit,0))} accent={C.green} />
      </div>
      <Card>
        <CardHead title="Trade Validation" sub="All recent trades reviewed against challenge rules" />
        <table>
          <thead><tr>{["Trade ID","Trader","Symbol","Lots","P/L","Status","Reason"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {TRADES_DATA.map((t,i)=>{
              const v = t.status==="Violated";
              const trader = TRADERS.find(tr=>tr.name===t.trader);
              return (
                <TRow key={i} highlight={v}>
                  <Td><span style={{ fontFamily:"monospace", fontSize:11, color:C.faint }}>{t.id}</span></Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:9 }}>{trader&&<Av i={trader.avatar} size={26} color={stageColor(trader.stage)} />}<span style={{ fontWeight:600, color:C.text }}>{t.trader}</span></div></Td>
                  <Td><span style={{ fontFamily:"monospace", fontWeight:600, color:C.blue }}>{t.symbol}</span></Td>
                  <Td><span style={{ fontFamily:"monospace", color:C.muted }}>{t.lots.toFixed(2)}</span></Td>
                  <Td><span style={{ fontFamily:"monospace", fontWeight:700, color:t.pnl>=0?C.green:C.red }}>{t.pnl>=0?"+":""}{$(t.pnl)}</span></Td>
                  <Td><Tag color={v?C.red:C.green}>{t.status}</Tag></Td>
                  <Td c={{ fontSize:12, color:v?C.red:C.faint }}>{t.reason}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Card>
        <CardHead title="Audit Log" sub="Complete record of all system actions and events" />
        <table>
          <thead><tr>{["Timestamp","Action","Result"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {AUDIT_LOG.map((entry,i)=>{
              const isRisk = entry.action.toLowerCase().includes("risk")||entry.action.toLowerCase().includes("flag");
              const isFailed = entry.result.toLowerCase().includes("failed");
              const isSuccess = entry.result.toLowerCase().includes("provisioned")||entry.result.toLowerCase().includes("sent")||entry.result.toLowerCase().includes("approved");
              const dotColor = isRisk?C.red:isFailed?C.amber:isSuccess?C.green:C.faint;
              return (
                <TRow key={i}>
                  <Td c={{ fontFamily:"monospace", fontSize:11, color:C.faint, whiteSpace:"nowrap" }}>{entry.ts}</Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ width:6, height:6, borderRadius:"50%", background:dotColor, display:"inline-block", flexShrink:0 }} /><span style={{ fontSize:13, color:C.text }}>{entry.action}</span></div></Td>
                  <Td c={{ fontSize:12, color:isSuccess?C.green:isFailed?C.amber:isRisk?C.red:C.muted }}>{entry.result}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PropRevenue() {
  const totalRev = TRADERS.filter(t=>t.accountSize>0).reduce((s,t)=>s+t.accountSize*0.08,0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Revenue" value={$k(totalRev)} trend={18.7} sub="vs last month" accent={C.green} />
        <Stat label="Net Profit" value="$24.5k" trend={14.2} sub="72% margin" accent={C.green} />
        <Stat label="Aff. Payouts" value="$1.2k" sub="3 partners" accent={C.amber} />
        <Stat label="Avg per Trader" value={$k(Math.round(totalRev/Math.max(1,TRADERS.filter(t=>t.accountSize>0).length)))} sub="funded only" accent={C.blue} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:14 }}>
        <Card>
          <div style={{ padding:"22px 24px" }}>
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14 }}>Revenue by Month</div>
            <div style={{ fontSize:28, fontWeight:800, color:C.text, letterSpacing:"-0.03em", marginBottom:4 }}>$34.1k</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
              <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>↑ 18.7%</span>
              <span style={{ color:C.faint, fontSize:12 }}>vs October</span>
            </div>
            <BarChart data={REV_MONTHS} />
          </div>
        </Card>
        <Card>
          <div style={{ padding:"22px 24px" }}>
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:16 }}>Affiliate Performance</div>
            {AFFILIATES.map((a,i)=>(
              <div key={a.id} style={{ marginBottom:i<AFFILIATES.length-1?18:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div><div style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.name}</div><div style={{ fontSize:11, color:C.faint }}>{a.referrals} referrals</div></div>
                  <div style={{ textAlign:"right" }}><div style={{ fontSize:13, fontWeight:700, color:C.green }}>{$(a.revenue)}</div><div style={{ fontSize:10, color:C.faint }}>comm. {$(a.commission)}</div></div>
                </div>
                <div style={{ height:5, background:C.hover, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${a.convRate}%`, background:`linear-gradient(90deg,${C.green},${C.blue})`, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PropSupport({ setPanel }) {
  const openTix = PROP_TICKETS.filter(t=>t.status==="open"||t.status==="escalated").length;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Open Tickets" value={PROP_TICKETS.filter(t=>t.status==="open").length} sub="Awaiting response" accent={C.amber} />
        <Stat label="Escalated" value={PROP_TICKETS.filter(t=>t.status==="escalated").length} sub="Urgent" accent={C.red} />
        <Stat label="Resolved" value={PROP_TICKETS.filter(t=>t.status==="resolved").length} sub="This week" accent={C.green} />
        <Stat label="Total" value={PROP_TICKETS.length} sub="All time" accent={C.muted} />
      </div>
      <Card>
        <CardHead title="Support Tickets" right={<Tag color={C.faint}>{PROP_TICKETS.length}</Tag>} />
        <table>
          <thead><tr>{["Ticket","Trader","Subject","Category","Priority","Status","Opened"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {PROP_TICKETS.map(ticket=>{
              const trader = TRADERS.find(t=>t.id===ticket.trader);
              const pc = prioColor(ticket.priority);
              const esc = ticket.status==="escalated";
              return (
                <TRow key={ticket.id} onClick={()=>setPanel(ticket)} highlight={esc}>
                  <Td><span style={{ fontFamily:"monospace", fontSize:11, color:C.green }}>{ticket.id}</span></Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:8 }}><Av i={trader?.avatar} size={26} color={esc?C.red:C.green} /><div><div style={{ fontSize:12, fontWeight:600, color:C.text }}>{trader?.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{trader?.id}</div></div></div></Td>
                  <Td c={{ maxWidth:220 }}><div style={{ fontSize:13, color:C.text, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ticket.subject}</div></Td>
                  <Td><Tag color={C.faint}>{ticket.category}</Tag></Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:6 }}><Pip color={pc} /><span style={{ fontSize:12, fontWeight:600, color:pc }}>{ticket.priority}</span></div></Td>
                  <Td><Tag color={esc?C.red:ticket.status==="resolved"?C.green:C.amber}>{ticket.status.charAt(0).toUpperCase()+ticket.status.slice(1)}</Tag></Td>
                  <Td c={{ fontSize:11, color:C.faint }}>{ticket.ago}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BROKER PAGES — completely prop-free
   ───────────────────────────────────────────────────────────── */
function BrokerOverview() {
  const { stats, loading } = useLiveOverview("broker");
  const $k2 = (n) => !n||isNaN(n)?"$0":n>=1000000?`$${(n/1000000).toFixed(2)}M`:n>=1000?`$${(n/1000).toFixed(1)}k`:`$${Number(n).toLocaleString()}`;
  const totalFunds = BROKER_CLIENTS.reduce((s,c)=>s+c.balance,0);
  const verifiedClients = Object.values(BROKER_KYC).filter(k=>k.status==="Verified").length;
  const kycRate = Math.round((verifiedClients/BROKER_CLIENTS.length)*100);
  const flaggedPay = BROKER_PAYMENTS.filter(p=>p.status==="Flagged").length;
  const activeClients = BROKER_CLIENTS.filter(c=>c.stage==="active").length;
  const flaggedClients = BROKER_CLIENTS.filter(c=>c.flagged).length;
  const brokerRevMonths = [
    { m:"Jan", v:24000 },{ m:"Feb", v:31000 },{ m:"Mar", v:28000 },
    { m:"Apr", v:44000 },{ m:"May", v:52000 },{ m:"Jun", v:61000 },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {!loading && stats.totalAccounts > 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.blue}30`, borderRadius:C.rL, padding:"16px 20px" }}>
          <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>⬤ Live Data — Condor API</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[
              { label:"Live Clients", value:stats.totalAccounts, color:C.blue },
              { label:"Total Funds", value:$k2(stats.totalFunds), color:C.green },
              { label:"Total Equity", value:$k2(stats.totalEquity), color:C.blue },
              { label:"Active", value:stats.activeAccounts, color:C.green },
            ].map(s=>(
              <div key={s.label}>
                <div style={{ fontSize:10, color:C.faint, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:24, fontWeight:800, color:s.color, letterSpacing:"-0.02em" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Client Funds" value={$k(totalFunds)} trend={8.4} sub="All accounts" accent={C.green} />
        <Stat label="Active Clients" value={activeClients} sub={`of ${BROKER_CLIENTS.length} enrolled`} accent={C.green} />
        <Stat label="KYC Compliance" value={`${kycRate}%`} sub={`${verifiedClients} verified`} accent={kycRate>=80?C.green:C.amber} />
        <Stat label="AML Flags" value={flaggedPay} sub="Requires review" accent={C.red} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {[
          { label:"Net Exposure", value:$k(BROKER_EXPOSURE.netExposure), color:C.amber, sub:"After hedging — monitor XAUUSD" },
          { label:"Compliance Violations", value:BROKER_COMP_VIOLATIONS.length, color:C.red, sub:"FSCA reportable events this cycle" },
          { label:"Automated Decisions", value:"79%", color:C.green, sub:"21% required manual intervention" },
        ].map(m=>(
          <div key={m.label} style={{ background:C.card, border:`1px solid ${m.color}22`, borderRadius:C.rL, padding:"18px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${m.color},transparent)` }} />
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10 }}>{m.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:m.color, letterSpacing:"-0.03em", lineHeight:1, marginBottom:6 }}>{m.value}</div>
            <div style={{ fontSize:12, color:C.faint }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:14 }}>
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14 }}>Monthly Revenue</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:"-0.03em" }}>$61.0k</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                  <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>↑ 17.3%</span>
                  <span style={{ color:C.faint, fontSize:12 }}>vs May</span>
                </div>
              </div>
              <Tag color={C.green}>Best month</Tag>
            </div>
            <BarChart data={brokerRevMonths} />
          </div>
        </Card>
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:16 }}>Client KYC Breakdown</div>
            {[
              { label:"Verified", count:Object.values(BROKER_KYC).filter(k=>k.status==="Verified").length, color:C.green },
              { label:"Pending", count:Object.values(BROKER_KYC).filter(k=>k.status==="Pending").length, color:C.amber },
              { label:"Failed", count:Object.values(BROKER_KYC).filter(k=>k.status==="Failed").length, color:C.red },
            ].map(k=>(
              <div key={k.label} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, color:C.muted }}>{k.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:k.color }}>{k.count}</span>
                </div>
                <div style={{ height:6, background:C.hover, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(k.count/BROKER_CLIENTS.length)*100}%`, background:k.color, borderRadius:3 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop:16, padding:"10px 14px", background:C.hover, borderRadius:8 }}>
              <div style={{ fontSize:10, color:C.faint, marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>FSCA KYC Rate</div>
              <div style={{ fontSize:20, fontWeight:800, color:kycRate>=80?C.green:C.amber }}>{kycRate}%</div>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <CardHead title="Recent Client Activity" sub="KYC status, balance and compliance flags" right={<Tag color={C.faint}>{BROKER_CLIENTS.length} clients</Tag>} />
        <table>
          <thead><tr>{["Client","Account Type","Balance","Open P&L","KYC","Risk Level","Status"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {BROKER_CLIENTS.slice(0,8).map(c=>(
              <TRow key={c.id} highlight={c.flagged}>
                <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av i={c.avatar} size={30} color={stageColor(c.stage)} /><div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{c.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{c.id} · {c.country}</div></div></div></Td>
                <Td><Tag color={c.accountType==="VIP"?C.amber:c.accountType==="ECN"?C.blue:C.muted}>{c.accountType}</Tag></Td>
                <Td c={{ fontFamily:"monospace", fontWeight:600, color:C.text }}>{c.balance>0?$(c.balance):"—"}</Td>
                <Td c={{ fontFamily:"monospace", fontWeight:600, color:c.openPnl>=0?C.green:C.red }}>{c.openPnl!==0?(c.openPnl>0?"+":"")+$(c.openPnl):"—"}</Td>
                <Td><Tag color={kycColor(BROKER_KYC[c.id]?.status||"Pending")}>{BROKER_KYC[c.id]?.status||"Pending"}</Tag></Td>
                <Td><Tag color={riskColor(c.riskLevel)}>{c.riskLevel}</Tag></Td>
                <Td><Tag color={stageColor(c.stage)}>{c.stage.charAt(0).toUpperCase()+c.stage.slice(1)}</Tag></Td>
              </TRow>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BrokerClients() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
        {["onboarding","active","suspended","dormant"].map(s=>{
          const ct = BROKER_CLIENTS.filter(c=>c.stage===s).length;
          return (
            <div key={s} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.r, padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:800, color:stageColor(s), letterSpacing:"-0.03em" }}>{ct}</div>
              <div style={{ fontSize:10, color:C.faint, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s}</div>
            </div>
          );
        })}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.r, padding:"16px", textAlign:"center" }}>
          <div style={{ fontSize:26, fontWeight:800, color:C.blue, letterSpacing:"-0.03em" }}>{BROKER_CLIENTS.filter(c=>c.accountType==="VIP").length}</div>
          <div style={{ fontSize:10, color:C.faint, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>VIP</div>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.r, padding:"16px", textAlign:"center" }}>
          <div style={{ fontSize:26, fontWeight:800, color:C.red, letterSpacing:"-0.03em" }}>{BROKER_CLIENTS.filter(c=>c.flagged).length}</div>
          <div style={{ fontSize:10, color:C.faint, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>Flagged</div>
        </div>
      </div>
      <Card>
        <div style={{ padding:"20px 24px" }}>
          <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:16 }}>Client Onboarding Journey</div>
          <div style={{ display:"flex", alignItems:"center" }}>
            {["Lead","Signup","KYC","Funded","Active","VIP"].map((s,i,arr)=>(
              <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", border:`2px solid ${C.blue}`, background:`${C.blue}10`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:12, fontWeight:700, color:C.blue }}>{i+1}</div>
                  <div style={{ fontSize:11, color:C.muted, fontWeight:500 }}>{s}</div>
                </div>
                {i<arr.length-1 && <div style={{ width:20, height:1, background:`linear-gradient(90deg,${C.blue}55,${C.border})`, flexShrink:0 }} />}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <CardHead title="All Clients" sub="Full client roster with account status and compliance flags" right={<Tag color={C.faint}>{BROKER_CLIENTS.length}</Tag>} />
        <div style={{ overflowX:"auto" }}>
          <table>
            <thead><tr>{["Client","Account Type","Balance","Open P&L","Risk","KYC Status","IB Ref","Last Trade","Status"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {BROKER_CLIENTS.map(c=>(
                <TRow key={c.id} highlight={c.flagged}>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av i={c.avatar} size={30} color={stageColor(c.stage)} /><div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{c.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{c.id} · {c.country}</div></div></div></Td>
                  <Td><Tag color={c.accountType==="VIP"?C.amber:c.accountType==="ECN"?C.blue:C.muted}>{c.accountType}</Tag></Td>
                  <Td c={{ fontFamily:"monospace", fontWeight:600, color:C.text }}>{c.balance>0?$(c.balance):"—"}</Td>
                  <Td c={{ fontFamily:"monospace", fontWeight:600, color:c.openPnl>=0?C.green:C.red }}>{c.openPnl!==0?(c.openPnl>0?"+":"")+$(c.openPnl):"—"}</Td>
                  <Td><Tag color={riskColor(c.riskLevel)}>{c.riskLevel}</Tag></Td>
                  <Td><Tag color={kycColor(BROKER_KYC[c.id]?.status||"Pending")}>{BROKER_KYC[c.id]?.status||"Pending"}</Tag></Td>
                  <Td c={{ fontSize:11, color:C.faint }}>{c.ibRef||"—"}</Td>
                  <Td c={{ fontSize:11, color:C.faint }}>{c.lastTrade}</Td>
                  <Td><Tag color={stageColor(c.stage)}>{c.stage.charAt(0).toUpperCase()+c.stage.slice(1)}</Tag></Td>
                </TRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function BrokerKYC() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Verified" value={Object.values(BROKER_KYC).filter(k=>k.status==="Verified").length} sub="FSCA compliant" accent={C.green} />
        <Stat label="Pending" value={Object.values(BROKER_KYC).filter(k=>k.status==="Pending").length} sub="Awaiting review" accent={C.amber} />
        <Stat label="Failed" value={Object.values(BROKER_KYC).filter(k=>k.status==="Failed").length} sub="Re-submission needed" accent={C.red} />
        <Stat label="Compliance Rate" value={`${Math.round((Object.values(BROKER_KYC).filter(k=>k.status==="Verified").length/BROKER_CLIENTS.length)*100)}%`} sub="FSCA Category I requirement" accent={C.green} />
      </div>
      <Card>
        <CardHead title="KYC Status — All Clients" sub="Document verification, method and FSCA compliance notes" accent={C.green} right={<Tag color={C.amber}>{Object.values(BROKER_KYC).filter(k=>k.status!=="Verified").length} require attention</Tag>} />
        <div style={{ overflowX:"auto" }}>
          <table>
            <thead><tr>{["Client","Risk Level","KYC Status","Method","Documents","Verified Date","Notes"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {BROKER_CLIENTS.map(c=>{
                const kyc = BROKER_KYC[c.id];
                if(!kyc) return null;
                return (
                  <TRow key={c.id} highlight={kyc.status==="Failed"}>
                    <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av i={c.avatar} size={30} color={kycColor(kyc.status)} /><div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{c.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{c.id}</div></div></div></Td>
                    <Td><Tag color={riskColor(c.riskLevel)}>{c.riskLevel}</Tag></Td>
                    <Td><div style={{ display:"flex", alignItems:"center", gap:7 }}><span style={{ width:7, height:7, borderRadius:"50%", background:kycColor(kyc.status), boxShadow:`0 0 6px ${kycColor(kyc.status)}`, display:"inline-block" }} /><Tag color={kycColor(kyc.status)}>{kyc.status}</Tag></div></Td>
                    <Td><Tag color={kyc.method==="Manual"?C.purple:C.blue}>{kyc.method}</Tag></Td>
                    <Td><div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{kyc.docs.map((d,i)=><span key={i} style={{ fontSize:10, color:d.includes("rejected")||d.includes("failed")||d.includes("mismatch")?C.red:C.faint, background:C.hover, borderRadius:4, padding:"2px 6px" }}>{d}</span>)}</div></Td>
                    <Td c={{ fontFamily:"monospace", fontSize:11, color:kyc.verifiedDate?C.green:C.faint }}>{kyc.verifiedDate||"—"}</Td>
                    <Td c={{ fontSize:11, color:kyc.status==="Failed"?C.red:C.faint, maxWidth:260, lineHeight:1.5 }}>{kyc.notes}</Td>
                  </TRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {BROKER_CLIENTS.filter(c=>BROKER_KYC[c.id]?.status==="Failed").map(c=>{
        const kyc = BROKER_KYC[c.id];
        return (
          <div key={c.id} style={{ background:C.card, border:`1px solid ${C.red}22`, borderRadius:C.rL, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <Av i={c.avatar} size={38} color={C.red} />
              <div><div style={{ fontSize:14, fontWeight:700, color:C.text }}>{c.name} — KYC Failed</div><div style={{ fontSize:11, color:C.faint, marginTop:2 }}>{c.id} · {c.email}</div></div>
              <Tag color={C.red}>Action Required</Tag>
            </div>
            <div style={{ padding:"10px 14px", background:C.redDim, borderRadius:8, border:`1px solid ${C.red}20`, fontSize:12, color:C.red, lineHeight:1.6 }}>{kyc.notes}</div>
          </div>
        );
      })}
    </div>
  );
}

function BrokerPayments() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Deposits" value={"$"+(BROKER_PAYMENTS.filter(p=>p.type==="Deposit"&&p.status==="Approved").reduce((s,p)=>s+p.amount,0)/1000).toFixed(0)+"k"} sub="Approved" accent={C.green} />
        <Stat label="Withdrawals" value={"$"+(BROKER_PAYMENTS.filter(p=>p.type==="Withdrawal"&&p.status==="Approved").reduce((s,p)=>s+p.amount,0)/1000).toFixed(0)+"k"} sub="Processed" accent={C.purple} />
        <Stat label="Processing" value={BROKER_PAYMENTS.filter(p=>p.status==="Processing").length} sub="Pending sign-off" accent={C.amber} />
        <Stat label="AML Flagged" value={BROKER_PAYMENTS.filter(p=>p.status==="Flagged").length} sub="Compliance hold" accent={C.red} />
      </div>
      {BROKER_PAYMENTS.filter(p=>p.status==="Flagged").length>0 && (
        <div style={{ background:C.card, border:`1px solid ${C.red}22`, borderRadius:C.rL, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.faint, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Flagged Payments — AML Review Required</div>
            <Tag color={C.red}>{BROKER_PAYMENTS.filter(p=>p.status==="Flagged").length} flagged</Tag>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {BROKER_PAYMENTS.filter(p=>p.status==="Flagged").map(p=>{
              const client = BROKER_CLIENTS.find(c=>c.id===p.client);
              return (
                <div key={p.id} style={{ display:"flex", gap:14, padding:"12px 14px", background:C.redDim, border:`1px solid ${C.red}20`, borderRadius:9, alignItems:"flex-start" }}>
                  <div style={{ flexShrink:0, marginTop:2 }}>{client&&<Av i={client.avatar} size={32} color={C.red} />}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{p.clientName}</span>
                      <Tag color={payTypeColor(p.type)}>{p.type}</Tag>
                      <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:C.text }}>${p.amount.toLocaleString()}</span>
                      <span style={{ fontSize:10, color:C.faint }}>{p.method}</span>
                    </div>
                    <div style={{ fontSize:12, color:C.red, lineHeight:1.6 }}>{p.flagReason}</div>
                    <div style={{ fontSize:10, color:C.faint, marginTop:4, fontFamily:"monospace" }}>{p.id} · {p.date}</div>
                  </div>
                  <Tag color={C.red}>Flagged</Tag>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Card>
        <CardHead title="All Payments" sub="Deposits and withdrawals — all statuses" accent={C.blue} right={<div style={{ display:"flex", gap:8 }}><Tag color={C.blue}>{BROKER_PAYMENTS.filter(p=>p.type==="Deposit").length} deposits</Tag><Tag color={C.purple}>{BROKER_PAYMENTS.filter(p=>p.type==="Withdrawal").length} withdrawals</Tag></div>} />
        <div style={{ overflowX:"auto" }}>
          <table>
            <thead><tr>{["Payment ID","Client","Type","Amount","Method","Status","Flag Reason","Date","Processing"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {BROKER_PAYMENTS.map(p=>{
                const client = BROKER_CLIENTS.find(c=>c.id===p.client);
                return (
                  <TRow key={p.id} highlight={p.status==="Flagged"}>
                    <Td><span style={{ fontFamily:"monospace", fontSize:11, color:C.faint }}>{p.id}</span></Td>
                    <Td><div style={{ display:"flex", alignItems:"center", gap:9 }}>{client&&<Av i={client.avatar} size={26} color={payTypeColor(p.type)} />}<span style={{ fontWeight:600, color:C.text, fontSize:13 }}>{p.clientName}</span></div></Td>
                    <Td><Tag color={payTypeColor(p.type)}>{p.type}</Tag></Td>
                    <Td><span style={{ fontFamily:"monospace", fontWeight:700, color:p.type==="Deposit"?C.green:C.purple }}>${p.amount.toLocaleString()}</span></Td>
                    <Td><span style={{ fontSize:12, color:C.muted }}>{p.method}</span></Td>
                    <Td><div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ width:6, height:6, borderRadius:"50%", background:payStatusColor(p.status), display:"inline-block" }} /><Tag color={payStatusColor(p.status)}>{p.status}</Tag></div></Td>
                    <Td c={{ fontSize:11, color:C.red, maxWidth:240 }}>{p.flagReason||<span style={{ color:C.faint, opacity:0.4 }}>—</span>}</Td>
                    <Td c={{ fontFamily:"monospace", fontSize:10, color:C.faint, whiteSpace:"nowrap" }}>{p.date}</Td>
                    <Td c={{ fontSize:11, color:p.processing==="—"?C.red:C.faint }}>{p.processing}</Td>
                  </TRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function BrokerExposure() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
        <Stat label="Total Client Funds" value={"$"+(BROKER_EXPOSURE.totalClientFunds/1000).toFixed(0)+"k"} sub="All accounts" accent={C.green} />
        <Stat label="Open Positions" value={"$"+(BROKER_EXPOSURE.totalOpenPositions/1000).toFixed(0)+"k"} sub="Live exposure" accent={C.blue} />
        <Stat label="Net Exposure" value={"$"+(BROKER_EXPOSURE.netExposure/1000).toFixed(0)+"k"} sub="After hedging" accent={C.amber} />
        <Stat label="Hedged Exposure" value={"$"+(BROKER_EXPOSURE.hedgedExposure/1000).toFixed(0)+"k"} sub="LP hedges placed" accent={C.green} />
        <Stat label="Floating P&L" value={(BROKER_EXPOSURE.floatingPnL>0?"+":"")+$k(BROKER_EXPOSURE.floatingPnL)} sub="All open positions" accent={BROKER_EXPOSURE.floatingPnL>=0?C.green:C.red} />
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.amber}22`, borderRadius:C.rL, padding:20, display:"flex", gap:16, alignItems:"center" }}>
        <div style={{ width:44, height:44, borderRadius:11, background:C.amberDim, border:`1px solid ${C.amber}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:C.amber, flexShrink:0 }}>!</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3 }}>Largest Single Position — {BROKER_EXPOSURE.largestPos.symbol}</div>
          <div style={{ fontSize:12, color:C.muted }}>{BROKER_EXPOSURE.largestPos.client} · {BROKER_EXPOSURE.largestPos.side} · Account size: ${(BROKER_EXPOSURE.largestPos.size/1000).toFixed(0)}k</div>
        </div>
        <Tag color={C.amber}>Monitor</Tag>
      </div>
      <Card>
        <CardHead title="Exposure by Asset Class" sub="Net client exposure across all open positions" accent={C.blue} />
        <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:14 }}>
          {BROKER_EXPOSURE.byAsset.map(a=>(
            <div key={a.asset}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:C.text, minWidth:64 }}>{a.asset}</span>
                  <Tag color={a.direction==="Long"?C.green:a.direction==="Short"?C.red:C.amber}>{a.direction}</Tag>
                  <Tag color={a.risk==="High"?C.red:C.amber}>{a.risk} Risk</Tag>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:12, color:C.faint }}>{a.pct}%</span>
                  <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:C.text }}>${(a.exposure/1000).toFixed(0)}k</span>
                </div>
              </div>
              <div style={{ height:6, background:C.hover, borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${a.pct}%`, background:a.risk==="High"?C.red:C.amber, borderRadius:3, transition:"width 0.6s" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card s={{ border:`1px solid ${C.red}18` }}>
        <CardHead title="High-Risk Client Accounts" sub="Accounts contributing most to firm exposure" accent={C.red} right={<Tag color={C.red}>{BROKER_CLIENTS.filter(c=>c.riskLevel==="Critical"||c.riskLevel==="High").length} high-risk</Tag>} />
        <table>
          <thead><tr>{["Client","Account Type","Balance","Open P&L","Risk Level","KYC","Exposure Note"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {BROKER_CLIENTS.filter(c=>c.riskLevel==="Critical"||c.riskLevel==="High"||c.riskLevel==="Elevated").map(c=>{
              const kyc = BROKER_KYC[c.id];
              return (
                <TRow key={c.id} highlight={c.riskLevel==="Critical"}>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av i={c.avatar} size={30} color={riskColor(c.riskLevel)} /><div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{c.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{c.id}</div></div></div></Td>
                  <Td><Tag color={c.accountType==="VIP"?C.amber:c.accountType==="ECN"?C.blue:C.muted}>{c.accountType}</Tag></Td>
                  <Td c={{ fontFamily:"monospace", fontWeight:600, color:C.text }}>{c.balance>0?$(c.balance):"—"}</Td>
                  <Td c={{ fontFamily:"monospace", fontWeight:600, color:c.openPnl>=0?C.green:C.red }}>{c.openPnl!==0?(c.openPnl>0?"+":"")+$(c.openPnl):"—"}</Td>
                  <Td><Tag color={riskColor(c.riskLevel)}>{c.riskLevel}</Tag></Td>
                  <Td>{kyc&&<Tag color={kycColor(kyc.status)}>{kyc.status}</Tag>}</Td>
                  <Td c={{ fontSize:11, color:C.faint, maxWidth:260 }}>{c.riskLevel==="Critical"?"Account suspended — all positions closed. KYC failed.":c.stage==="onboarding"?"Account not yet activated — PEP screening in progress.":"Active positions — monitoring elevated."}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BrokerComplianceViolations() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Violations" value={BROKER_COMP_VIOLATIONS.length} sub="This cycle" accent={C.red} />
        <Stat label="Critical / High" value={BROKER_COMP_VIOLATIONS.filter(v=>v.severity==="Critical"||v.severity==="High").length} sub="FSCA reportable" accent={C.red} />
        <Stat label="Auto-Detected" value={BROKER_COMP_VIOLATIONS.filter(v=>v.detection==="Auto").length} sub="By system" accent={C.green} />
        <Stat label="Manual Review" value={BROKER_COMP_VIOLATIONS.filter(v=>v.detection==="Manual").length} sub="By compliance team" accent={C.amber} />
      </div>
      <Card s={{ border:`1px solid ${C.red}18` }}>
        <CardHead title="Compliance Violations Panel" sub="AML, KYC failures and regulatory breaches — sorted by severity" accent={C.red} right={<Tag color={C.red}>{BROKER_COMP_VIOLATIONS.length} violations</Tag>} />
        <table>
          <thead><tr>{["Client","Rule Violated","Severity","Detection","Timestamp","Detail"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {[...BROKER_COMP_VIOLATIONS].sort((a,b)=>["Critical","High","Medium","Low"].indexOf(a.severity)-["Critical","High","Medium","Low"].indexOf(b.severity)).map(v=>{
              const client = BROKER_CLIENTS.find(c=>c.id===v.client);
              return (
                <TRow key={v.id} highlight={v.severity==="Critical"||v.severity==="High"}>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:9 }}>{client&&<Av i={client.avatar} size={27} color={severityColor(v.severity)} />}<div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{v.clientName}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{v.client}</div></div></div></Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:7 }}><Pip color={severityColor(v.severity)} /><span style={{ fontWeight:600, color:C.text, fontSize:12 }}>{v.rule}</span></div></Td>
                  <Td><Tag color={severityColor(v.severity)}>{v.severity}</Tag></Td>
                  <Td><Tag color={v.detection==="Auto"?C.green:C.purple}>{v.detection}</Tag></Td>
                  <Td c={{ fontFamily:"monospace", fontSize:10, color:C.faint, whiteSpace:"nowrap" }}>{v.ts}</Td>
                  <Td c={{ fontSize:11, color:C.faint, maxWidth:280, lineHeight:1.5 }}>{v.detail}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Card>
        <CardHead title="Violations by Client" sub="Clients with active compliance violations this cycle" />
        <div style={{ padding:"16px 20px", display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {[...new Set(BROKER_COMP_VIOLATIONS.map(v=>v.client))].map(id=>{
            const cvs = BROKER_COMP_VIOLATIONS.filter(v=>v.client===id);
            const client = BROKER_CLIENTS.find(c=>c.id===id);
            const maxSev = cvs.some(v=>v.severity==="Critical")?"Critical":cvs.some(v=>v.severity==="High")?"High":"Medium";
            return (
              <div key={id} style={{ padding:"14px 16px", background:C.surface, borderRadius:9, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  {client&&<Av i={client.avatar} size={32} color={severityColor(maxSev)} />}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{client?.name}</div>
                    <div style={{ fontSize:10, color:C.faint, marginTop:1 }}>{cvs.length} violation{cvs.length>1?"s":""}</div>
                  </div>
                  <Tag color={severityColor(maxSev)}>{maxSev}</Tag>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {cvs.map(v=><Tag key={v.id} color={C.faint}>{v.rule}</Tag>)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function BrokerRisk() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Critical Risk" value={BROKER_CLIENTS.filter(c=>c.riskLevel==="Critical").length} sub="Immediate action" accent={C.red} />
        <Stat label="High Risk" value={BROKER_CLIENTS.filter(c=>c.riskLevel==="High").length} sub="Monitoring" accent={C.red} />
        <Stat label="Auto-Detected" value={BROKER_RISKS.filter(r=>r.detected==="Auto").length} sub="This cycle" accent={C.purple} />
        <Stat label="Manual Reviews" value={BROKER_RISKS.filter(r=>r.detected==="Manual").length} sub="Compliance team" accent={C.amber} />
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.blue}22`, borderRadius:C.rL, padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <div style={{ fontSize:10, color:C.blue, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Broker Risk Detection</div>
            <div style={{ fontSize:13, color:C.muted }}>Multi-accounting, bonus abuse, latency arbitrage and AML patterns detected this cycle</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Tag color={C.red}>{BROKER_RISKS.filter(r=>r.severity==="Critical"||r.severity==="High").length} high severity</Tag>
            <Tag color={C.purple}>{BROKER_RISKS.filter(r=>r.detected==="Auto").length} auto-detected</Tag>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
          {[
            { type:"Multi-Accounting", icon:"⊗", color:C.red, count:BROKER_RISKS.filter(r=>r.type.includes("Multi-Acc")||r.type.includes("Structuring")).length, desc:"Same device/IP or deposit structuring patterns" },
            { type:"Bonus Abuse", icon:"◈", color:C.amber, count:BROKER_RISKS.filter(r=>r.type==="Bonus Abuse"||r.type==="Source of Funds").length, desc:"Bonus withdrawal without genuine trading" },
            { type:"Latency Arbitrage", icon:"⚡", color:C.purple, count:BROKER_RISKS.filter(r=>r.type.includes("Arbitrage")||r.type==="PEP Screening").length, desc:"Price feed exploitation or PEP screening flags" },
          ].map(s=>(
            <div key={s.type} style={{ padding:"14px 16px", background:C.surface, borderRadius:9, border:`1px solid ${s.color}20`, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${s.color},transparent)` }} />
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ color:s.color, fontSize:16 }}>{s.icon}</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{s.type}</span>
              </div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color, letterSpacing:"-0.03em", marginBottom:4 }}>{s.count}</div>
              <div style={{ fontSize:11, color:C.faint, lineHeight:1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {BROKER_RISKS.map(r=>{
            const client = BROKER_CLIENTS.find(c=>c.id===r.client);
            const col = { "Multi-Accounting":C.red, "Structuring":C.red, "Bonus Abuse":C.amber, "Source of Funds":C.amber, "Latency Arbitrage":C.red, "PEP Screening":C.purple }[r.type]||C.faint;
            return (
              <div key={r.id} style={{ display:"flex", gap:14, padding:"12px 14px", background:C.hover, borderRadius:9, border:`1px solid ${col}20`, alignItems:"flex-start" }}>
                <div style={{ flexShrink:0 }}>{client&&<Av i={client.avatar} size={30} color={col} />}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{r.clientName}</span>
                    <Tag color={col}>{r.type}</Tag>
                    <Tag color={severityColor(r.severity)}>{r.severity}</Tag>
                    <span style={{ fontSize:9, fontWeight:700, color:r.detected==="Auto"?C.purple:C.blue, background:r.detected==="Auto"?C.purpleDim:C.blueDim, border:`1px solid ${r.detected==="Auto"?C.purple:C.blue}30`, borderRadius:4, padding:"1px 6px", letterSpacing:"0.06em" }}>
                      {r.detected==="Auto"?"AUTO DETECTED":"MANUAL REVIEW"}
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{r.detail}</div>
                  <div style={{ fontSize:10, color:C.faint, marginTop:4, fontFamily:"monospace" }}>{r.id} · {r.ts}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BrokerIBPortal() {
  const totalVol = BROKER_IBS.reduce((s,ib)=>s+ib.volume,0);
  const totalComm = BROKER_IBS.reduce((s,ib)=>s+ib.commission,0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total IBs" value={BROKER_IBS.length} sub="Active partners" accent={C.blue} />
        <Stat label="IB Clients" value={BROKER_IBS.reduce((s,ib)=>s+ib.clients,0)} sub="Referred this quarter" accent={C.green} />
        <Stat label="Total Volume" value={"$"+(totalVol/1000000).toFixed(1)+"M"} sub="IB-referred accounts" accent={C.green} />
        <Stat label="Commissions Paid" value={$k(totalComm)} sub="This quarter" accent={C.amber} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {BROKER_IBS.map(ib=>(
          <div key={ib.id} style={{ background:C.card, border:`1px solid ${ib.tier==="Gold"?C.amber+"40":C.border}`, borderRadius:C.rL, padding:20, position:"relative", overflow:"hidden" }}>
            {ib.tier==="Gold" && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${C.amber},transparent)` }} />}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4 }}>{ib.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{ib.manager}</div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <Tag color={ib.tier==="Gold"?C.amber:C.blue}>{ib.tier}</Tag>
                <Tag color={C.green}>{ib.status}</Tag>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:14 }}>
              {[
                { label:"Clients", value:ib.clients },
                { label:"Active", value:ib.activeClients },
                { label:"Volume", value:"$"+(ib.volume/1000000).toFixed(1)+"M" },
                { label:"Commission", value:$k(ib.commission) },
              ].map(s=>(
                <div key={s.label} style={{ padding:"10px 12px", background:C.surface, borderRadius:8 }}>
                  <div style={{ fontSize:9, color:C.faint, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:600, marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:4 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:11, color:C.faint }}>Conversion rate</span>
                <span style={{ fontSize:11, fontWeight:700, color:C.green }}>{ib.convRate}%</span>
              </div>
              <div style={{ height:5, background:C.hover, borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${ib.convRate}%`, background:`linear-gradient(90deg,${C.green},${C.blue})`, borderRadius:3 }} />
              </div>
            </div>
            <div style={{ fontSize:10, color:C.faint, marginTop:8 }}>Partner since {ib.joined}</div>
          </div>
        ))}
      </div>
      <Card>
        <CardHead title="IB Client Breakdown" sub="All clients referred by introducing brokers" accent={C.blue} />
        <table>
          <thead><tr>{["Client","IB Partner","Account Type","Balance","Open P&L","KYC","Joined"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {BROKER_CLIENTS.filter(c=>c.ibRef).map(c=>{
              const ib = BROKER_IBS.find(ib=>ib.id===c.ibRef);
              return (
                <TRow key={c.id}>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Av i={c.avatar} size={30} color={C.blue} /><div><div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{c.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{c.id} · {c.country}</div></div></div></Td>
                  <Td><div><div style={{ fontSize:12, fontWeight:600, color:C.text }}>{ib?.name||c.ibRef}</div><div style={{ fontSize:10, color:C.faint }}>{ib?.manager}</div></div></Td>
                  <Td><Tag color={c.accountType==="VIP"?C.amber:c.accountType==="ECN"?C.blue:C.muted}>{c.accountType}</Tag></Td>
                  <Td c={{ fontFamily:"monospace", fontWeight:600, color:C.text }}>{c.balance>0?$(c.balance):"—"}</Td>
                  <Td c={{ fontFamily:"monospace", fontWeight:600, color:c.openPnl>=0?C.green:C.red }}>{c.openPnl!==0?(c.openPnl>0?"+":"")+$(c.openPnl):"—"}</Td>
                  <Td><Tag color={kycColor(BROKER_KYC[c.id]?.status||"Pending")}>{BROKER_KYC[c.id]?.status||"Pending"}</Tag></Td>
                  <Td c={{ fontSize:11, color:C.faint }}>{c.joined}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BrokerAuditLog() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Events" value={BROKER_AUDIT.length} sub="This cycle" accent={C.green} />
        <Stat label="Compliance" value={BROKER_AUDIT.filter(e=>e.action.toLowerCase().includes("aml")||e.action.toLowerCase().includes("kyc")||e.action.toLowerCase().includes("pep")||e.action.toLowerCase().includes("str")).length} sub="Regulatory events" accent={C.red} />
        <Stat label="Approved" value={BROKER_AUDIT.filter(e=>e.result.toLowerCase().includes("approved")||e.result.toLowerCase().includes("sent")).length} sub="Processed" accent={C.green} />
        <Stat label="Flagged / Held" value={BROKER_AUDIT.filter(e=>e.result.toLowerCase().includes("held")||e.result.toLowerCase().includes("suspended")||e.result.toLowerCase().includes("paused")).length} sub="Under review" accent={C.amber} />
      </div>
      <Card>
        <CardHead title="Compliance Audit Log" sub="Immutable record of all compliance and operational events" accent={C.green} />
        <table>
          <thead><tr>{["Timestamp","Action","Result"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {BROKER_AUDIT.map((entry,i)=>{
              const isRisk = entry.action.toLowerCase().includes("aml")||entry.action.toLowerCase().includes("flag")||entry.action.toLowerCase().includes("pep")||entry.action.toLowerCase().includes("str")||entry.action.toLowerCase().includes("structuring");
              const isFailed = entry.result.toLowerCase().includes("suspended")||entry.result.toLowerCase().includes("failed");
              const isSuccess = entry.result.toLowerCase().includes("approved")||entry.result.toLowerCase().includes("sent")||entry.result.toLowerCase().includes("activated");
              const dotColor = isRisk?C.red:isFailed?C.amber:isSuccess?C.green:C.faint;
              return (
                <TRow key={i}>
                  <Td c={{ fontFamily:"monospace", fontSize:11, color:C.faint, whiteSpace:"nowrap" }}>{entry.ts}</Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ width:6, height:6, borderRadius:"50%", background:dotColor, boxShadow:`0 0 5px ${dotColor}`, display:"inline-block", flexShrink:0 }} /><span style={{ fontSize:13, color:C.text }}>{entry.action}</span></div></Td>
                  <Td c={{ fontSize:12, color:isSuccess?C.green:isFailed?C.amber:isRisk?C.red:C.muted }}>{entry.result}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BrokerSupport({ setPanel }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Open Tickets" value={BROKER_TICKETS.filter(t=>t.status==="open").length} sub="Awaiting response" accent={C.amber} />
        <Stat label="Escalated" value={BROKER_TICKETS.filter(t=>t.status==="escalated").length} sub="Urgent" accent={C.red} />
        <Stat label="Resolved" value={BROKER_TICKETS.filter(t=>t.status==="resolved").length} sub="This week" accent={C.green} />
        <Stat label="Total" value={BROKER_TICKETS.length} sub="All time" accent={C.muted} />
      </div>
      <Card>
        <CardHead title="Client Support Tickets" right={<Tag color={C.faint}>{BROKER_TICKETS.length}</Tag>} />
        <table>
          <thead><tr>{["Ticket","Client","Subject","Category","Priority","Status","Opened"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {BROKER_TICKETS.map(ticket=>{
              const client = BROKER_CLIENTS.find(c=>c.id===ticket.client);
              const pc = prioColor(ticket.priority);
              const esc = ticket.status==="escalated";
              return (
                <TRow key={ticket.id} onClick={()=>setPanel({ ...ticket, trader:ticket.client })} highlight={esc}>
                  <Td><span style={{ fontFamily:"monospace", fontSize:11, color:C.blue }}>{ticket.id}</span></Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:8 }}><Av i={client?.avatar} size={26} color={esc?C.red:C.blue} /><div><div style={{ fontSize:12, fontWeight:600, color:C.text }}>{client?.name}</div><div style={{ fontSize:10, color:C.faint, fontFamily:"monospace" }}>{client?.id}</div></div></div></Td>
                  <Td c={{ maxWidth:220 }}><div style={{ fontSize:13, color:C.text, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ticket.subject}</div></Td>
                  <Td><Tag color={C.faint}>{ticket.category}</Tag></Td>
                  <Td><div style={{ display:"flex", alignItems:"center", gap:6 }}><Pip color={pc} /><span style={{ fontSize:12, fontWeight:600, color:pc }}>{ticket.priority}</span></div></Td>
                  <Td><Tag color={esc?C.red:ticket.status==="resolved"?C.green:C.amber}>{ticket.status.charAt(0).toUpperCase()+ticket.status.slice(1)}</Tag></Td>
                  <Td c={{ fontSize:11, color:C.faint }}>{ticket.ago}</Td>
                </TRow>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAV CONFIGS — completely separate per mode
   ───────────────────────────────────────────────────────────── */
const PROP_NAVS = [
  { id:"overview", label:"Overview", icon:"□", group:null },
  { id:"accounts", label:"Account Management", icon:"⊞", group:null },
  { id:"lifecycle", label:"Trader Lifecycle", icon:"◎", group:"─ Operations ─" },
  { id:"payouts", label:"Payouts / Withdrawals", icon:"$", group:null },
  { id:"violations", label:"Rule Violations", icon:"⚑", group:null },
  { id:"automation", label:"Automation", icon:"⚡", group:null },
  { id:"risk", label:"Risk Detection", icon:"⊘", group:"─ Management ─" },
  { id:"riskpay", label:"Risk & Payouts", icon:"⊕", group:null },
  { id:"revenue", label:"Revenue", icon:"↗", group:"─ Analytics ─" },
  { id:"support", label:"Support", icon:"✉", group:null },
];

const BROKER_NAVS = [
  { id:"b_overview", label:"Overview", icon:"□", group:null },
  { id:"b_accounts", label:"Account Management", icon:"⊞", group:null },
  { id:"b_clients", label:"Client Management", icon:"◎", group:"─ Operations ─" },
  { id:"b_payments", label:"Payments Monitor", icon:"⇄", group:null },
  { id:"b_kyc", label:"KYC / Compliance", icon:"✦", group:null },
  { id:"b_exposure", label:"Exposure Overview", icon:"◉", group:null },
  { id:"b_violations", label:"Compliance Violations", icon:"⚑", group:null },
  { id:"b_risk", label:"AML & Risk", icon:"⊘", group:"─ Management ─" },
  { id:"b_ibs", label:"IB Portal", icon:"◈", group:null },
  { id:"b_audit", label:"Audit Log", icon:"≡", group:"─ Compliance ─" },
  { id:"b_support", label:"Client Support", icon:"✉", group:null },
];

const PROP_TITLES = {
  overview:"Operations Overview", accounts:"Account Management", lifecycle:"Trader Lifecycle",
  payouts:"Payouts / Withdrawals", violations:"Rule Violations Panel",
  automation:"Automation Engine", risk:"Risk Detection",
  riskpay:"Risk & Payouts", revenue:"Revenue Analytics", support:"Support Center",
};

const BROKER_TITLES = {
  b_overview:"Operations Overview", b_accounts:"Account Management", b_clients:"Client Management",
  b_payments:"Payments Monitor", b_kyc:"KYC / Compliance",
  b_exposure:"Exposure Overview", b_violations:"Compliance Violations",
  b_risk:"AML & Risk Detection", b_ibs:"IB Portal",
  b_audit:"Compliance Audit Log", b_support:"Client Support",
};

/* ─────────────────────────────────────────────────────────────
   TICKET PANEL (shared)
   ───────────────────────────────────────────────────────────── */
function TicketPanel({ ticket, mode, onClose, onReply }) {
  const person = mode==="broker"
    ? BROKER_CLIENTS.find(c=>c.id===ticket.client||c.id===ticket.trader)
    : TRADERS.find(t=>t.id===ticket.trader);
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, backdropFilter:"blur(3px)" }} />
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:480, background:C.card, borderLeft:`1px solid ${C.borderHi}`, zIndex:201, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1, paddingRight:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                <span style={{ fontFamily:"monospace", fontSize:11, color:mode==="broker"?C.blue:C.green }}>{ticket.id}</span>
                <Tag color={prioColor(ticket.priority)}>{ticket.priority}</Tag>
                <Tag color={ticket.status==="escalated"?C.red:ticket.status==="resolved"?C.green:C.amber}>{ticket.status}</Tag>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.text, lineHeight:1.35 }}>{ticket.subject}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>{ticket.created} · {ticket.ago} · {ticket.messages} messages</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16, padding:"4px 7px", borderRadius:6, flexShrink:0 }}>✕</button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"18px 24px", display:"flex", flexDirection:"column", gap:14 }}>
          {person && (
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:C.surface, borderRadius:10, border:`1px solid ${C.border}` }}>
              <Av i={person.avatar} size={40} color={mode==="broker"?C.blue:C.green} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{person.name}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{person.email}</div>
              </div>
              <Tag color={riskColor(person.riskLevel)}>{person.riskLevel}</Tag>
            </div>
          )}
          <div style={{ padding:"12px 14px", background:C.surface, borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, color:C.muted, lineHeight:1.7 }}>{ticket.notes}</div>
        </div>
        <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
          <button onClick={()=>onReply(ticket)} style={{ flex:1, padding:"10px", background:mode==="broker"?C.blue:C.green, color:"#000", border:"none", borderRadius:C.r, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Reply</button>
          <button onClick={onClose} style={{ flex:1, padding:"10px", background:"none", color:C.muted, border:`1px solid ${C.border}`, borderRadius:C.r, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Close</button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   BADGE COUNTS
   ───────────────────────────────────────────────────────────── */
function getBadge(id, mode) {
  if(mode==="prop") {
    if(id==="payouts") return PAYOUT_QUEUE.filter(p=>p.status==="Pending").length||null;
    if(id==="violations") return RULE_VIOLATIONS.length||null;
    if(id==="risk") return TRADERS.filter(t=>t.riskScore>=70).length||null;
    if(id==="support") return PROP_TICKETS.filter(t=>t.status==="open"||t.status==="escalated").length||null;
  } else {
    if(id==="b_payments") return BROKER_PAYMENTS.filter(p=>p.status==="Flagged").length||null;
    if(id==="b_kyc") return Object.values(BROKER_KYC).filter(k=>k.status==="Pending"||k.status==="Failed").length||null;
    if(id==="b_violations") return BROKER_COMP_VIOLATIONS.filter(v=>v.severity==="Critical"||v.severity==="High").length||null;
    if(id==="b_risk") return BROKER_RISKS.filter(r=>r.severity==="Critical"||r.severity==="High").length||null;
    if(id==="b_support") return BROKER_TICKETS.filter(t=>t.status==="open"||t.status==="escalated").length||null;
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
   APP
   ───────────────────────────────────────────────────────────── */
export default function App() {
  const [mode, setMode] = useState("prop");
  const [propTab, setPropTab] = useState("overview");
  const [brokerTab, setBrokerTab] = useState("b_overview");
  const [demoMode, setDemoMode] = useState(false);
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const tab = mode==="prop"?propTab:brokerTab;
  const setTab = mode==="prop"?setPropTab:setBrokerTab;
  const navs = mode==="prop"?PROP_NAVS:BROKER_NAVS;
  const titles = mode==="prop"?PROP_TITLES:BROKER_TITLES;
  const accentColor = mode==="prop"?C.green:C.blue;

  const filteredTraders = TRADERS.filter(t=>
    t.name.toLowerCase().includes(search.toLowerCase())||
    t.id.toLowerCase().includes(search.toLowerCase())||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleModeSwitch = (m) => {
    setMode(m);
    setPanel(null);
    setReplyTo(null);
  };

  const getPersonName = (ticket) => {
    if(mode==="broker") {
      const c = BROKER_CLIENTS.find(c=>c.id===ticket.client||c.id===ticket.trader);
      return c?.name;
    }
    const t = TRADERS.find(t=>t.id===ticket.trader);
    return t?.name;
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, fontFamily:'"Inter","DM Sans",system-ui,sans-serif', color:C.muted }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes slideR{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        table{border-collapse:collapse;width:100%}
        button:focus,textarea:focus,input:focus{outline:none}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:228, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", zIndex:100, overflowY:"auto" }}>
        <div style={{ padding:"18px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <img src="/logo.png" alt="ForexOpsPro" style={{ height:22, maxWidth:140, objectFit:"contain" }} />
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:3, display:"flex", gap:2 }}>
            {["prop","broker"].map(m=>(
              <button key={m} onClick={()=>handleModeSwitch(m)} style={{ flex:1, padding:"5px 0", borderRadius:6, background:mode===m?m==="prop"?`${C.green}15`:`${C.blue}15`:"transparent", border:`1px solid ${mode===m?m==="prop"?C.green+"40":C.blue+"40":"transparent"}`, color:mode===m?m==="prop"?C.green:C.blue:C.faint, fontSize:10, fontWeight:mode===m?700:500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", letterSpacing:"0.04em", textTransform:"uppercase" }}>
                {m==="prop"?"Prop Firm":"Broker"}
              </button>
            ))}
          </div>
        </div>

        <nav style={{ flex:1, padding:"8px 8px", display:"flex", flexDirection:"column", gap:1 }}>
          {navs.map(n=>{
            const active = tab===n.id;
            const badge = getBadge(n.id, mode);
            return (
              <div key={n.id}>
                {n.group && <div style={{ fontSize:9, color:C.faint, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"10px 12px 4px", opacity:0.5 }}>{n.group}</div>}
                <button onClick={()=>setTab(n.id)} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px", borderRadius:8, background:active?`${accentColor}10`:"transparent", border:`1px solid ${active?accentColor+"30":"transparent"}`, color:active?accentColor:C.muted, fontSize:13, fontWeight:active?600:400, fontFamily:"inherit", transition:"all 0.12s", textAlign:"left", width:"100%" }}>
                  <span style={{ fontSize:11, opacity:active?1:0.5, fontFamily:"monospace", flexShrink:0 }}>{n.icon}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  {badge&&badge>0 && (
                    <span style={{ background:n.id.includes("violation")||n.id==="risk"||n.id==="b_risk"?C.redDim:C.amberDim, color:n.id.includes("violation")||n.id==="risk"||n.id==="b_risk"?C.red:C.amber, border:`1px solid ${n.id.includes("violation")||n.id==="risk"||n.id==="b_risk"?C.red+"35":C.amber+"35"}`, borderRadius:9, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{badge}</span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.faint, marginBottom:3 }}>
            <Pip color={C.green} pulse={true} />All systems operational
          </div>
          <div style={{ fontSize:10, color:C.faint }}>{new Date().toLocaleDateString("en-GB",{dateStyle:"medium"})}</div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft:228, flex:1, padding:"32px 32px 64px", minWidth:0 }}>
        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{ fontSize:11, color:C.faint, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{navs.find(n=>n.id===tab)?.label}</div>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:accentColor, background:mode==="prop"?C.greenDim:C.blueDim, border:`1px solid ${accentColor}35`, borderRadius:4, padding:"2px 7px" }}>
                {mode==="prop"?"Prop Firm Mode":"Broker Mode"}
              </span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:"-0.03em", lineHeight:1 }}>{titles[tab]||tab}</h1>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:C.faint, fontSize:13, pointerEvents:"none" }}>⌕</span>
              <input placeholder={mode==="prop"?"Search traders…":"Search clients…"} value={search} onChange={e=>setSearch(e.target.value)}
                style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, padding:"8px 14px 8px 32px", borderRadius:C.r, fontSize:13, fontFamily:"inherit", width:200 }}
                onFocus={e=>e.target.style.borderColor=accentColor} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, background:C.card, border:`1px solid ${C.border}`, borderRadius:C.r, padding:"7px 13px" }}>
              <Pip color={C.green} pulse={true} />
              <span style={{ fontSize:12, color:C.muted, fontWeight:500 }}>Live</span>
            </div>
            {mode==="prop" && (
              <button onClick={()=>setDemoMode(d=>!d)} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px", borderRadius:C.r, background:demoMode?`${C.amber}15`:C.card, border:`1px solid ${demoMode?C.amber+"50":C.border}`, color:demoMode?C.amber:C.faint, fontSize:12, fontWeight:demoMode?700:500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:demoMode?C.amber:C.faint, boxShadow:demoMode?`0 0 8px ${C.amber}`:"none", display:"inline-block", flexShrink:0, transition:"all 0.2s" }} />
                Demo Mode {demoMode?"ON":"OFF"}
              </button>
            )}
          </div>
        </div>

        {/* PROP FIRM PAGES */}
        {mode==="prop" && tab==="overview" && <PropOverview traders={filteredTraders} payoutQueue={PAYOUT_QUEUE} ruleViolations={RULE_VIOLATIONS} />}
        {mode==="prop" && tab==="accounts" && <PropAccountManagement />}
        {mode==="prop" && tab==="lifecycle" && <PropLifecycle traders={filteredTraders} />}
        {mode==="prop" && tab==="payouts" && <PropPayouts />}
        {mode==="prop" && tab==="violations" && <PropViolations />}
        {mode==="prop" && tab==="automation" && <PropAutomation />}
        {mode==="prop" && tab==="risk" && <PropRisk traders={filteredTraders} demoMode={demoMode} />}
        {mode==="prop" && tab==="riskpay" && <PropRiskPayouts />}
        {mode==="prop" && tab==="revenue" && <PropRevenue />}
        {mode==="prop" && tab==="support" && <PropSupport setPanel={setPanel} />}

        {/* BROKER PAGES */}
        {mode==="broker" && tab==="b_overview" && <BrokerOverview />}
        {mode==="broker" && tab==="b_accounts" && <BrokerAccountManagement />}
        {mode==="broker" && tab==="b_clients" && <BrokerClients />}
        {mode==="broker" && tab==="b_payments" && <BrokerPayments />}
        {mode==="broker" && tab==="b_kyc" && <BrokerKYC />}
        {mode==="broker" && tab==="b_exposure" && <BrokerExposure />}
        {mode==="broker" && tab==="b_violations" && <BrokerComplianceViolations />}
        {mode==="broker" && tab==="b_risk" && <BrokerRisk />}
        {mode==="broker" && tab==="b_ibs" && <BrokerIBPortal />}
        {mode==="broker" && tab==="b_audit" && <BrokerAuditLog />}
        {mode==="broker" && tab==="b_support" && <BrokerSupport setPanel={setPanel} />}
      </main>

      {panel && <TicketPanel ticket={panel} mode={mode} onClose={()=>setPanel(null)} onReply={t=>{ setPanel(null); setReplyTo(t); }} />}
      {replyTo && <ReplyModal ticket={replyTo} personName={getPersonName(replyTo)} onClose={()=>setReplyTo(null)} />}
    </div>
  );
}
