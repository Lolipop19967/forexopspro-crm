import { useState, useEffect } from "react";
import { PropAccountManagement, BrokerAccountManagement } from "./AccountManagement";
import { useLiveOverview, useDrawdownMonitor } from "./useLiveData";

const C = {
  bg:"#0B0F14", surface:"#111418", card:"#161B22", hover:"#1C2128",
  border:"#21262D", borderHi:"#30363D",
  green:"#00FF88", greenDim:"rgba(0,255,136,0.08)",
  blue:"#3B82F6", blueDim:"rgba(59,130,246,0.10)",
  red:"#FF4D4D", redDim:"rgba(255,77,77,0.10)",
  amber:"#F59E0B", amberDim:"rgba(245,158,11,0.10)",
  purple:"#A78BFA",
  text:"#FFFFFF", muted:"#9CA3AF", faint:"#4B5563",
  r:"8px", rL:"12px",
};

const BACKEND = "https://forexopspro-backend-production.up.railway.app";

async function apiFetch(path) {
  const res = await fetch(`${BACKEND}${path}`);
  return res.json();
}

const $k = (n) => {
  if (!n || isNaN(n)) return "$0";
  if (n >= 1000000) return `$${(n/1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(1)}k`;
  return `$${Number(n).toLocaleString()}`;
};

const stageColor = (s) => ({ active:C.green, disabled:C.red, suspended:C.red, onboarding:C.amber }[s] || C.muted);

/* ── ATOMS ── */
const Tag = ({ children, color=C.muted }) => (
  <span style={{ display:"inline-flex", alignItems:"center", background:`${color}14`, color, border:`1px solid ${color}30`, borderRadius:5, padding:"2px 9px", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{children}</span>
);

const Av = ({ i="?", size=32, color=C.green }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:`${color}12`, border:`1.5px solid ${color}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.33, fontWeight:700, color }}>{(i||"?")[0]?.toUpperCase()}</div>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.rL, overflow:"hidden", ...style }}>{children}</div>
);

const Stat = ({ label, value, sub, accent=C.green, trend }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:C.rL, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:0, left:24, right:24, height:1, background:`linear-gradient(90deg,transparent,${accent}55,transparent)` }} />
    <div style={{ fontSize:11, color:C.faint, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:800, color:accent, letterSpacing:"-0.03em", lineHeight:1, marginBottom:6 }}>{value ?? "—"}</div>
    <div style={{ fontSize:12, color:C.faint, display:"flex", alignItems:"center", gap:6 }}>
      {trend && <span style={{ color:trend>0?C.green:C.red, fontWeight:700 }}>↑ {Math.abs(trend)}%</span>}
      {sub}
    </div>
  </div>
);

const Empty = ({ message="No data yet", sub="" }) => (
  <div style={{ padding:"48px 24px", textAlign:"center" }}>
    <div style={{ fontSize:32, marginBottom:12, opacity:0.3 }}>◎</div>
    <div style={{ fontSize:13, color:C.faint, marginBottom:6 }}>{message}</div>
    {sub && <div style={{ fontSize:11, color:C.faint, opacity:0.6 }}>{sub}</div>}
  </div>
);

const TH = ({ cols }) => (
  <thead>
    <tr>{cols.map(h => (
      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:C.faint, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
    ))}</tr>
  </thead>
);

const TR = ({ children }) => {
  const [hov, setHov] = useState(false);
  return (
    <tr style={{ borderBottom:`1px solid ${C.border}`, background:hov?C.hover:"transparent", transition:"background 0.1s" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </tr>
  );
};

const TD = ({ children, mono=false, color }) => (
  <td style={{ padding:"12px 16px", fontFamily:mono?"monospace":"inherit", fontSize:13, color:color||C.text, verticalAlign:"middle" }}>{children}</td>
);

const TraderCell = ({ acc, color }) => (
  <TD>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <Av i={acc.first_name||"?"} size={30} color={color||C.green} />
      <div>
        <div style={{ fontWeight:600, color:C.text, fontSize:13 }}>{acc.first_name} {acc.last_name}</div>
        <div style={{ fontSize:10, color:C.faint }}>{acc.email}</div>
      </div>
    </div>
  </TD>
);

/* ─────────────────────────────────────────────────────────────
   PROP FIRM PAGES
   ───────────────────────────────────────────────────────────── */
function PropOverview() {
  const { stats, accounts, loading } = useLiveOverview("prop");
  const { breached } = useDrawdownMonitor(10);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {breached.length > 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.red}30`, borderRadius:C.rL, padding:"16px 20px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.red, marginBottom:10 }}>⚠ Drawdown Breach — Accounts Auto-Disabled</div>
          {breached.map(b => (
            <div key={b.externalAccountID} style={{ fontSize:12, color:C.muted, marginBottom:4 }}>
              {b.externalAccountID} — Balance ${Number(b.balance).toLocaleString()} / Equity ${Number(b.equity).toLocaleString()} — {b.drawdownPct}% drawdown
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Accounts" value={loading?"...":stats.totalAccounts} sub="On Condor" accent={C.green} />
        <Stat label="Active Traders" value={loading?"...":stats.activeAccounts} sub={`of ${stats.totalAccounts} accounts`} accent={C.green} />
        <Stat label="Total Funds" value={loading?"...":$k(stats.totalFunds)} sub="Live from Condor" accent={C.blue} />
        <Stat label="Drawdown Alerts" value={breached.length} sub={breached.length>0?"Accounts breached":"All healthy"} accent={breached.length>0?C.red:C.green} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <Stat label="Disabled Accounts" value={stats.disabledAccounts} sub="Suspended or breached" accent={C.red} />
        <Stat label="Total Equity" value={$k(stats.totalEquity)} sub="Real-time" accent={C.blue} />
        <Stat label="Floating P&L" value={$k(stats.floatingPnl)} sub="Open positions" accent={stats.floatingPnl>=0?C.green:C.red} />
      </div>
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Live Accounts</div>
          <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>All traders on Condor — ForexOpsPro group</div>
        </div>
        {loading ? <Empty message="Loading live data from Condor..." /> : accounts.length===0 ? (
          <Empty message="No accounts yet" sub="Create accounts via Account Management" />
        ) : (
          <table style={{ borderCollapse:"collapse", width:"100%" }}>
            <TH cols={["Trader","Login","Balance","Equity","P&L","Status"]} />
            <tbody>
              {accounts.map((a,i) => (
                <TR key={i}>
                  <TraderCell acc={a} color={a.status==="active"?C.green:C.faint} />
                  <TD mono color={C.green}>{a.condor_login}</TD>
                  <TD mono>{$k(a.live_balance||a.balance)}</TD>
                  <TD mono color={C.blue}>{$k(a.live_equity||a.balance)}</TD>
                  <TD mono color={(a.live_pnl||0)>=0?C.green:C.red}>{$k(a.live_pnl||0)}</TD>
                  <TD><Tag color={stageColor(a.status)}>{a.status}</Tag></TD>
                </TR>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function PropLifecycle() {
  const { accounts, loading } = useLiveOverview("prop");
  return (
    <Card>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Trader Lifecycle</div>
        <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>All traders and their current stage</div>
      </div>
      {loading ? <Empty message="Loading..." /> : accounts.length===0 ? <Empty message="No traders yet" sub="Create accounts via Account Management" /> : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <TH cols={["Trader","Email","Login","Balance","Status","Created"]} />
          <tbody>
            {accounts.map((a,i) => (
              <TR key={i}>
                <TraderCell acc={a} />
                <TD color={C.muted}>{a.email}</TD>
                <TD mono color={C.green}>{a.condor_login}</TD>
                <TD mono>{$k(a.live_balance||a.balance)}</TD>
                <TD><Tag color={stageColor(a.status)}>{a.status}</Tag></TD>
                <TD color={C.faint}>{a.created_at?new Date(a.created_at).toLocaleDateString("en-GB"):"—"}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function PropPayouts() {
  const { accounts, loading } = useLiveOverview("prop");
  return (
    <Card>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Payouts / Withdrawals</div>
        <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>Trader balances and payout eligibility based on live Condor data</div>
      </div>
      {loading ? <Empty message="Loading..." /> : accounts.length===0 ? <Empty message="No accounts yet" sub="Create accounts via Account Management" /> : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <TH cols={["Trader","Login","Balance","Equity","P&L","Progress","Eligibility"]} />
          <tbody>
            {accounts.map((a,i) => {
              const bal = a.live_balance||a.balance||0;
              const pnl = a.live_pnl||0;
              const pct = bal>0?(pnl/bal*100):0;
              const eligible = pct>=8 && a.status==="active";
              return (
                <TR key={i}>
                  <TraderCell acc={a} />
                  <TD mono color={C.green}>{a.condor_login}</TD>
                  <TD mono>{$k(bal)}</TD>
                  <TD mono color={C.blue}>{$k(a.live_equity||bal)}</TD>
                  <TD mono color={pnl>=0?C.green:C.red}>{$k(pnl)}</TD>
                  <TD>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:80, height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min(pct/8*100,100)}%`, background:eligible?C.green:C.amber, borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:11, color:C.faint }}>{pct.toFixed(1)}%</span>
                    </div>
                  </TD>
                  <TD><Tag color={eligible?C.green:C.amber}>{eligible?"Eligible":"Not Yet"}</Tag></TD>
                </TR>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function PropViolations() {
  const { accounts, loading } = useLiveOverview("prop");
  const disabled = accounts.filter(a=>a.status==="disabled");
  return (
    <Card>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Rule Violations</div>
        <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>Accounts disabled due to rule breaches</div>
      </div>
      {loading ? <Empty message="Loading..." /> : disabled.length===0 ? <Empty message="No violations" sub="All accounts within rules" /> : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <TH cols={["Trader","Login","Reason","Disabled At"]} />
          <tbody>
            {disabled.map((a,i) => (
              <TR key={i}>
                <TraderCell acc={a} color={C.red} />
                <TD mono color={C.red}>{a.condor_login}</TD>
                <TD color={C.amber}>{a.disabled_reason||"Manual disable"}</TD>
                <TD color={C.faint}>{a.disabled_at?new Date(a.disabled_at).toLocaleString("en-GB"):"—"}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function PropAutomation() {
  return (
    <Card>
      <div style={{ padding:"24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Automation Status</div>
        {[
          { label:"Drawdown Monitor", status:"Active", desc:"Runs every 60s — auto-disables accounts that breach 10% drawdown", color:C.green },
          { label:"Account Provisioning", status:"Manual", desc:"Create accounts manually via Account Management. Connect Payfast to automate", color:C.amber },
          { label:"Welcome Email", status:"Not Connected", desc:"Connect Resend or SendGrid to auto-send welcome emails on account creation", color:C.red },
          { label:"Challenge Pass/Fail", status:"In Development", desc:"Requires PropStat monitoring via Condor API", color:C.amber },
          { label:"Payout Processing", status:"Manual", desc:"Process payouts manually via Account Management → Withdraw", color:C.amber },
        ].map(a => (
          <div key={a.label} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:a.color, boxShadow:`0 0 6px ${a.color}`, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.label}</div>
              <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>{a.desc}</div>
            </div>
            <Tag color={a.color}>{a.status}</Tag>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PropRisk() {
  const { accounts, stats, loading } = useLiveOverview("prop");
  const { breached, lastCheck, checkNow } = useDrawdownMonitor(10);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <Stat label="Accounts Monitored" value={stats.totalAccounts} sub="Auto every 60s" accent={C.green} />
        <Stat label="Drawdown Breaches" value={breached.length} sub="Auto-disabled" accent={breached.length>0?C.red:C.green} />
        <Stat label="Last Check" value={lastCheck?new Date(lastCheck).toLocaleTimeString("en-GB"):"—"} sub="Runs automatically" accent={C.blue} />
      </div>
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Risk Monitor</div>
            <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>Live drawdown monitoring — auto-disables at 10% breach</div>
          </div>
          <button onClick={checkNow} style={{ padding:"7px 16px", background:`${C.green}10`, color:C.green, border:`1px solid ${C.green}30`, borderRadius:C.r, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Run Check Now</button>
        </div>
        {loading ? <Empty message="Loading..." /> : accounts.length===0 ? <Empty message="No accounts to monitor" /> : (
          <table style={{ borderCollapse:"collapse", width:"100%" }}>
            <TH cols={["Trader","Login","Balance","Equity","Drawdown","Status"]} />
            <tbody>
              {accounts.map((a,i) => {
                const bal = a.live_balance||a.balance||0;
                const eq = a.live_equity||bal;
                const dd = bal>0?((bal-eq)/bal*100).toFixed(1):"0.0";
                return (
                  <TR key={i}>
                    <TraderCell acc={a} color={breached.find(b=>b.externalAccountID===a.external_id)?C.red:C.green} />
                    <TD mono color={C.green}>{a.condor_login}</TD>
                    <TD mono>{$k(bal)}</TD>
                    <TD mono color={C.blue}>{$k(eq)}</TD>
                    <TD mono color={parseFloat(dd)>5?C.red:parseFloat(dd)>2?C.amber:C.green}>{dd}%</TD>
                    <TD><Tag color={a.status==="active"?C.green:C.red}>{a.status}</Tag></TD>
                  </TR>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function PropRevenue() {
  const { stats, loading } = useLiveOverview("prop");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <Stat label="Funds Under Management" value={loading?"...":$k(stats.totalFunds)} sub="Live from Condor" accent={C.green} />
        <Stat label="Est. Revenue (8% FUM)" value={loading?"...":$k(stats.totalFunds*0.08)} sub="Challenge fees" accent={C.green} />
        <Stat label="Active Accounts" value={loading?"...":stats.activeAccounts} sub="Trading now" accent={C.blue} />
      </div>
      <Card>
        <div style={{ padding:"24px" }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:8 }}>Revenue Tracking</div>
          <div style={{ fontSize:12, color:C.faint }}>Connect a payment processor (Payfast, Checkout.com) to track real revenue here. Showing estimated revenue based on live Condor balances.</div>
        </div>
      </Card>
    </div>
  );
}

function PropSupport() {
  return (
    <Card>
      <div style={{ padding:"24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>Support Tickets</div>
        <div style={{ fontSize:12, color:C.faint, marginBottom:16 }}>Connect a helpdesk (Freshdesk, Zendesk) to manage support tickets here.</div>
        <Empty message="No support tickets" sub="Connect a helpdesk integration to manage tickets" />
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
   BROKER PAGES
   ───────────────────────────────────────────────────────────── */
function BrokerOverview() {
  const { stats, accounts, loading } = useLiveOverview("broker");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <Stat label="Total Client Funds" value={loading?"...":$k(stats.totalFunds)} sub="Live from Condor" accent={C.green} />
        <Stat label="Active Clients" value={loading?"...":stats.activeAccounts} sub={`of ${stats.totalAccounts} total`} accent={C.green} />
        <Stat label="Total Equity" value={loading?"...":$k(stats.totalEquity)} sub="Real-time" accent={C.blue} />
        <Stat label="Disabled" value={stats.disabledAccounts} sub="Suspended or flagged" accent={C.red} />
      </div>
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Client Accounts</div>
        </div>
        {loading ? <Empty message="Loading..." /> : accounts.length===0 ? <Empty message="No clients yet" sub="Create client accounts via Account Management" /> : (
          <table style={{ borderCollapse:"collapse", width:"100%" }}>
            <TH cols={["Client","Login","Balance","Equity","P&L","Status"]} />
            <tbody>
              {accounts.map((a,i) => (
                <TR key={i}>
                  <TraderCell acc={a} color={C.blue} />
                  <TD mono color={C.blue}>{a.condor_login}</TD>
                  <TD mono>{$k(a.live_balance||a.balance)}</TD>
                  <TD mono color={C.blue}>{$k(a.live_equity||a.balance)}</TD>
                  <TD mono color={(a.live_pnl||0)>=0?C.green:C.red}>{$k(a.live_pnl||0)}</TD>
                  <TD><Tag color={stageColor(a.status)}>{a.status}</Tag></TD>
                </TR>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function BrokerClients() {
  const { accounts, loading } = useLiveOverview("broker");
  return (
    <Card>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Client Management</div>
        <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>All broker clients — manage accounts, deposits, withdrawals</div>
      </div>
      {loading ? <Empty message="Loading..." /> : accounts.length===0 ? <Empty message="No clients yet" sub="Create client accounts via Account Management" /> : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <TH cols={["Client","Email","Login","Balance","Status","Joined"]} />
          <tbody>
            {accounts.map((a,i) => (
              <TR key={i}>
                <TraderCell acc={a} color={C.blue} />
                <TD color={C.muted}>{a.email}</TD>
                <TD mono color={C.blue}>{a.condor_login}</TD>
                <TD mono>{$k(a.live_balance||a.balance)}</TD>
                <TD><Tag color={stageColor(a.status)}>{a.status}</Tag></TD>
                <TD color={C.faint}>{a.created_at?new Date(a.created_at).toLocaleDateString("en-GB"):"—"}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function BrokerPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch("/accounts").then(async r => {
      if (!r.ok) return;
      const all = [];
      for (const acc of (r.accounts||[])) {
        if (acc.mode!=="broker") continue;
        const t = await apiFetch(`/accounts/${acc.external_id}/transactions`);
        if (t.ok) all.push(...(t.transactions||[]).map(tx=>({ ...tx, name:`${acc.first_name} ${acc.last_name}`, login:acc.condor_login })));
      }
      setTransactions(all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)));
    }).finally(()=>setLoading(false));
  }, []);
  return (
    <Card>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Payments Monitor</div>
        <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>All deposits and withdrawals</div>
      </div>
      {loading ? <Empty message="Loading transactions..." /> : transactions.length===0 ? <Empty message="No transactions yet" sub="Deposits and withdrawals will appear here" /> : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <TH cols={["Client","Login","Type","Amount","Comment","Date"]} />
          <tbody>
            {transactions.map((t,i) => (
              <TR key={i}>
                <TD>{t.name}</TD>
                <TD mono color={C.blue}>{t.login}</TD>
                <TD><Tag color={t.type==="deposit"?C.green:C.purple}>{t.type}</Tag></TD>
                <TD mono color={t.type==="deposit"?C.green:C.red}>{$k(t.amount)}</TD>
                <TD color={C.faint}>{t.comments}</TD>
                <TD color={C.faint}>{new Date(t.created_at).toLocaleString("en-GB")}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function BrokerKYC() {
  return (
    <Card>
      <div style={{ padding:"24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>KYC / Compliance</div>
        <div style={{ fontSize:12, color:C.faint, marginBottom:16 }}>Connect a KYC provider (Sumsub, Veriff, Onfido) to manage identity verification. Use Account Management to manually approve/reject.</div>
        <Empty message="No KYC submissions" sub="Connect a KYC provider to automate verification" />
      </div>
    </Card>
  );
}

function BrokerExposure() {
  const { accounts, stats, loading } = useLiveOverview("broker");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <Stat label="Total Exposure" value={loading?"...":$k(stats.totalFunds)} sub="All client funds" accent={C.blue} />
        <Stat label="Total Equity" value={loading?"...":$k(stats.totalEquity)} sub="Live" accent={C.green} />
        <Stat label="Floating P&L" value={$k(stats.floatingPnl)} sub="Open positions" accent={stats.floatingPnl>=0?C.green:C.red} />
      </div>
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Exposure Overview</div>
        </div>
        {loading ? <Empty message="Loading..." /> : accounts.length===0 ? <Empty message="No clients yet" /> : (
          <table style={{ borderCollapse:"collapse", width:"100%" }}>
            <TH cols={["Client","Login","Balance","Equity","Margin","P&L"]} />
            <tbody>
              {accounts.map((a,i) => (
                <TR key={i}>
                  <TD>{a.first_name} {a.last_name}</TD>
                  <TD mono color={C.blue}>{a.condor_login}</TD>
                  <TD mono>{$k(a.live_balance||a.balance)}</TD>
                  <TD mono color={C.blue}>{$k(a.live_equity||a.balance)}</TD>
                  <TD mono color={C.amber}>{$k(a.live_margin||0)}</TD>
                  <TD mono color={(a.live_pnl||0)>=0?C.green:C.red}>{$k(a.live_pnl||0)}</TD>
                </TR>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function BrokerCompliance() {
  const { accounts } = useLiveOverview("broker");
  const disabled = accounts.filter(a=>a.status==="disabled");
  return (
    <Card>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Compliance Violations</div>
        <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>Accounts flagged or disabled</div>
      </div>
      {disabled.length===0 ? <Empty message="No compliance violations" sub="All accounts in good standing" /> : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <TH cols={["Client","Login","Reason","Date"]} />
          <tbody>
            {disabled.map((a,i) => (
              <TR key={i}>
                <TraderCell acc={a} color={C.red} />
                <TD mono color={C.red}>{a.condor_login}</TD>
                <TD color={C.amber}>{a.disabled_reason||"Manually disabled"}</TD>
                <TD color={C.faint}>{a.disabled_at?new Date(a.disabled_at).toLocaleString("en-GB"):"—"}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function BrokerRisk() {
  const { stats } = useLiveOverview("broker");
  const { breached, checkNow } = useDrawdownMonitor(10);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        <Stat label="Total Clients" value={stats.totalAccounts} sub="Monitored" accent={C.blue} />
        <Stat label="Risk Flags" value={breached.length} sub="Drawdown breaches" accent={breached.length>0?C.red:C.green} />
        <Stat label="Disabled" value={stats.disabledAccounts} sub="Suspended accounts" accent={C.red} />
      </div>
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>AML & Risk Monitor</div>
          <button onClick={checkNow} style={{ padding:"7px 16px", background:`${C.blue}10`, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:C.r, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Run Check</button>
        </div>
        <Empty message="No risk flags" sub="All clients within acceptable risk parameters" />
      </Card>
    </div>
  );
}

function BrokerIBPortal() {
  return (
    <Card>
      <div style={{ padding:"24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>IB Portal</div>
        <div style={{ fontSize:12, color:C.faint }}>Introducing broker management coming soon. Connect referral tracking to manage IB commissions and rebates.</div>
      </div>
    </Card>
  );
}

function BrokerAuditLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch("/accounts").then(async r => {
      if (!r.ok) return;
      const all = [];
      for (const acc of (r.accounts||[])) {
        if (acc.mode!=="broker") continue;
        const re = await apiFetch(`/accounts/${acc.external_id}/risk`);
        if (re.ok) all.push(...(re.events||[]).map(e=>({ ...e, name:`${acc.first_name} ${acc.last_name}` })));
        const te = await apiFetch(`/accounts/${acc.external_id}/transactions`);
        if (te.ok) all.push(...(te.transactions||[]).map(t=>({ ...t, event_type:t.type, name:`${acc.first_name} ${acc.last_name}` })));
      }
      setEvents(all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)));
    }).finally(()=>setLoading(false));
  }, []);
  return (
    <Card>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Audit Log</div>
        <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>All account events and transactions</div>
      </div>
      {loading ? <Empty message="Loading..." /> : events.length===0 ? <Empty message="No events yet" sub="Account actions will be logged here" /> : (
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <TH cols={["Client","Event","Details","Date"]} />
          <tbody>
            {events.map((e,i) => (
              <TR key={i}>
                <TD>{e.name}</TD>
                <TD><Tag color={e.event_type==="deposit"?C.green:e.event_type==="withdrawal"?C.purple:C.amber}>{e.event_type}</Tag></TD>
                <TD color={C.faint}>{e.comments||(e.details?JSON.stringify(e.details):"—")}</TD>
                <TD color={C.faint}>{new Date(e.created_at).toLocaleString("en-GB")}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function BrokerSupport() {
  return (
    <Card>
      <div style={{ padding:"24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>Client Support</div>
        <div style={{ fontSize:12, color:C.faint }}>Connect a helpdesk integration to manage client support tickets here.</div>
        <Empty message="No support tickets" sub="Connect a helpdesk to manage client support" />
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAV CONFIG
   ───────────────────────────────────────────────────────────── */
const PROP_NAVS = [
  { id:"overview", label:"Overview", icon:"□" },
  { id:"accounts", label:"Account Management", icon:"⊞" },
  { id:"lifecycle", label:"Trader Lifecycle", icon:"◎", group:"─ Operations ─" },
  { id:"payouts", label:"Payouts / Withdrawals", icon:"$" },
  { id:"violations", label:"Rule Violations", icon:"▣" },
  { id:"automation", label:"Automation", icon:"⚡" },
  { id:"risk", label:"Risk Detection", icon:"⊘", group:"─ Management ─" },
  { id:"revenue", label:"Revenue", icon:"↗" },
  { id:"support", label:"Support", icon:"✉", group:"─ Analytics ─" },
];

const BROKER_NAVS = [
  { id:"b_overview", label:"Overview", icon:"□" },
  { id:"b_accounts", label:"Account Management", icon:"⊞" },
  { id:"b_clients", label:"Client Management", icon:"◎", group:"─ Operations ─" },
  { id:"b_payments", label:"Payments Monitor", icon:"$" },
  { id:"b_kyc", label:"KYC / Compliance", icon:"✓" },
  { id:"b_exposure", label:"Exposure Overview", icon:"◈" },
  { id:"b_compliance", label:"Compliance Violations", icon:"▣" },
  { id:"b_risk", label:"AML & Risk", icon:"⊘", group:"─ Management ─" },
  { id:"b_ib", label:"IB Portal", icon:"◎" },
  { id:"b_audit", label:"Audit Log", icon:"≡", group:"─ Compliance ─" },
  { id:"b_support", label:"Client Support", icon:"✉" },
];

const TITLES = {
  overview:"Operations Overview", accounts:"Account Management", lifecycle:"Trader Lifecycle",
  payouts:"Payouts / Withdrawals", violations:"Rule Violations", automation:"Automation",
  risk:"Risk Detection", revenue:"Revenue", support:"Support",
  b_overview:"Operations Overview", b_accounts:"Account Management", b_clients:"Client Management",
  b_payments:"Payments Monitor", b_kyc:"KYC / Compliance", b_exposure:"Exposure Overview",
  b_compliance:"Compliance Violations", b_risk:"AML & Risk", b_ib:"IB Portal",
  b_audit:"Audit Log", b_support:"Client Support",
};

/* ─────────────────────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────────────────────── */
export default function App() {
  const [mode, setMode] = useState("prop");
  const [tab, setTab] = useState("overview");

  const accentColor = mode==="prop"?C.green:C.blue;
  const switchMode = (m) => { setMode(m); setTab(m==="prop"?"overview":"b_overview"); };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <aside style={{ width:228, background:C.surface, borderRight:`1px solid ${C.border}`, position:"fixed", top:0, bottom:0, left:0, display:"flex", flexDirection:"column", zIndex:100, overflowY:"auto" }}>
        <div style={{ padding:"20px 16px 0" }}>
          <div style={{ marginBottom:14 }}>
            <img src="/logo.png" alt="ForexOpsPro" style={{ height:22, maxWidth:140, objectFit:"contain" }} />
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:20 }}>
            {["prop","broker"].map(m => (
              <button key={m} onClick={()=>switchMode(m)}
                style={{ flex:1, padding:"7px 0", borderRadius:C.r, background:mode===m?(m==="prop"?`${C.green}15`:`${C.blue}15`):"transparent", color:mode===m?(m==="prop"?C.green:C.blue):C.faint, border:`1.5px solid ${mode===m?(m==="prop"?C.green:C.blue):C.border}`, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", textTransform:"uppercase", letterSpacing:"0.05em", transition:"all 0.15s" }}>
                {m==="prop"?"Prop Firm":"Broker"}
              </button>
            ))}
          </div>
          <nav style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {(mode==="prop"?PROP_NAVS:BROKER_NAVS).map(n => (
              <div key={n.id}>
                {n.group && <div style={{ fontSize:9, color:C.faint, fontWeight:700, letterSpacing:"0.1em", padding:"10px 8px 4px", textTransform:"uppercase" }}>{n.group}</div>}
                <button onClick={()=>setTab(n.id)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:C.r, background:tab===n.id?`${accentColor}12`:"transparent", color:tab===n.id?accentColor:C.muted, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:tab===n.id?700:400, textAlign:"left", transition:"all 0.12s" }}>
                  <span style={{ fontSize:14 }}>{n.icon}</span>
                  {n.label}
                </button>
              </div>
            ))}
          </nav>
        </div>
        <div style={{ marginTop:"auto", padding:"16px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, boxShadow:`0 0 6px ${C.green}` }} />
            <span style={{ fontSize:11, color:C.faint }}>All systems operational</span>
          </div>
          <div style={{ fontSize:10, color:C.faint, marginTop:4 }}>{new Date().toLocaleDateString("en-GB",{dateStyle:"medium"})}</div>
        </div>
      </aside>

      <main style={{ marginLeft:228, flex:1, padding:"32px 32px 64px", minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:11, color:C.faint, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>{TITLES[tab]}</span>
              <span style={{ fontSize:10, background:`${accentColor}15`, color:accentColor, border:`1px solid ${accentColor}30`, borderRadius:4, padding:"2px 8px", fontWeight:700 }}>{mode==="prop"?"PROP FIRM MODE":"BROKER MODE"}</span>
            </div>
            <h1 style={{ fontSize:24, fontWeight:800, color:C.text, letterSpacing:"-0.02em" }}>{TITLES[tab]}</h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}` }} />
            <span style={{ fontSize:12, color:C.green, fontWeight:700 }}>Live</span>
          </div>
        </div>

        {mode==="prop" && tab==="overview" && <PropOverview />}
        {mode==="prop" && tab==="accounts" && <PropAccountManagement />}
        {mode==="prop" && tab==="lifecycle" && <PropLifecycle />}
        {mode==="prop" && tab==="payouts" && <PropPayouts />}
        {mode==="prop" && tab==="violations" && <PropViolations />}
        {mode==="prop" && tab==="automation" && <PropAutomation />}
        {mode==="prop" && tab==="risk" && <PropRisk />}
        {mode==="prop" && tab==="revenue" && <PropRevenue />}
        {mode==="prop" && tab==="support" && <PropSupport />}

        {mode==="broker" && tab==="b_overview" && <BrokerOverview />}
        {mode==="broker" && tab==="b_accounts" && <BrokerAccountManagement />}
        {mode==="broker" && tab==="b_clients" && <BrokerClients />}
        {mode==="broker" && tab==="b_payments" && <BrokerPayments />}
        {mode==="broker" && tab==="b_kyc" && <BrokerKYC />}
        {mode==="broker" && tab==="b_exposure" && <BrokerExposure />}
        {mode==="broker" && tab==="b_compliance" && <BrokerCompliance />}
        {mode==="broker" && tab==="b_risk" && <BrokerRisk />}
        {mode==="broker" && tab==="b_ib" && <BrokerIBPortal />}
        {mode==="broker" && tab==="b_audit" && <BrokerAuditLog />}
        {mode==="broker" && tab==="b_support" && <BrokerSupport />}
      </main>
    </div>
  );
}
