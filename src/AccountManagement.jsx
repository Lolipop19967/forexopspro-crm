import { useState, useEffect } from "react";

const BACKEND = "https://forexopspro-backend-production.up.railway.app";

const C = {
  bg: "#0B0F14", surface: "#111418", card: "#161B22", hover: "#1C2128",
  border: "#21262D", borderHi: "#30363D",
  green: "#00FF88", greenDim: "rgba(0,255,136,0.08)",
  blue: "#3B82F6", blueDim: "rgba(59,130,246,0.10)",
  red: "#FF4D4D", redDim: "rgba(255,77,77,0.10)",
  amber: "#F59E0B", amberDim: "rgba(245,158,11,0.10)",
  purple: "#A78BFA",
  text: "#FFFFFF", muted: "#9CA3AF", faint: "#4B5563",
  r: "8px", rL: "12px",
};

/* ─── API HELPERS ─── */
async function apiPost(path, body) {
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function apiGet(path) {
  const res = await fetch(`${BACKEND}${path}`);
  return await res.json();
}

function md5Simple(str) {
  // Simple hash for demo — in production use a proper MD5
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").repeat(4).slice(0, 32);
}

/* ─── ATOMS ─── */
const Tag = ({ children, color = C.muted }) => (
  <span style={{ display: "inline-flex", alignItems: "center", background: `${color}14`, color, border: `1px solid ${color}30`, borderRadius: 5, padding: "2px 9px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const Av = ({ i, size = 30, color = C.green }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `${color}12`, border: `1.5px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, color }}>
    {i}
  </div>
);

const Btn = ({ children, onClick, color = C.green, outline = false, disabled = false, small = false }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ padding: small ? "4px 12px" : "8px 18px", background: outline ? "transparent" : disabled ? C.hover : color, color: outline ? color : disabled ? C.faint : "#000", border: `1.5px solid ${disabled ? C.border : color}`, borderRadius: C.r, fontSize: small ? 11 : 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s", opacity: disabled ? 0.5 : 1 }}>
    {children}
  </button>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, color: C.text, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", width: "100%" }}
      onFocus={e => e.target.style.borderColor = C.green}
      onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, color: C.text, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", width: "100%" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const color = type === "success" ? C.green : type === "error" ? C.red : C.amber;
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, background: C.card, border: `1px solid ${color}50`, borderRadius: C.rL, padding: "14px 20px", zIndex: 9999, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 8px 32px rgba(0,0,0,0.5)`, maxWidth: 380 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, display: "inline-block", flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 14, marginLeft: "auto" }}>✕</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CREATE ACCOUNT MODAL (shared by prop + broker)
   ───────────────────────────────────────────────────────────── */
function CreateAccountModal({ mode, onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    initialBalance: mode === "prop" ? "50000" : "10000",
    currencyID: "1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const externalID = `${mode.toUpperCase()}-${Date.now()}`;
      const passwordHash = md5Simple(form.password);
      const result = await apiPost("/condor/accounts", {
        externalAccountID: externalID,
        initialBalance: parseFloat(form.initialBalance),
        currencyID: parseInt(form.currencyID),
        passwordHash,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      });
      if (result.ok) {
        onSuccess(result.account);
        onClose();
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err) {
      setError("Connection error — check backend");
    }
    setLoading(false);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 500, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 520, background: C.card, border: `1px solid ${C.borderHi}`, borderRadius: 16, zIndex: 501, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: mode === "prop" ? `${C.green}08` : `${C.blue}08` }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Create {mode === "prop" ? "Trader" : "Client"} Account</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Provisions a live account on Condor — ForexOpsPro group</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="First Name" value={form.firstName} onChange={f("firstName")} placeholder="John" />
            <Input label="Last Name" value={form.lastName} onChange={f("lastName")} placeholder="Smith" />
          </div>
          <Input label="Email" value={form.email} onChange={f("email")} placeholder="john@example.com" type="email" />
          <Input label="Password" value={form.password} onChange={f("password")} placeholder="Set trading account password" type="password" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label={mode === "prop" ? "Initial Balance ($)" : "Opening Deposit ($)"} value={form.initialBalance} onChange={f("initialBalance")} placeholder="50000" type="number" />
            <Select label="Currency" value={form.currencyID} onChange={f("currencyID")} options={[{ value: "1", label: "USD" }, { value: "2", label: "EUR" }, { value: "3", label: "GBP" }]} />
          </div>
          {error && (
            <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid ${C.red}25`, borderRadius: C.r, fontSize: 12, color: C.red }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn onClick={submit} disabled={loading} color={mode === "prop" ? C.green : C.blue}>
              {loading ? "Creating..." : "Create Account on Condor"}
            </Btn>
            <Btn onClick={onClose} outline color={C.muted}>Cancel</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCOUNT ACTION PANEL (disable/enable/deposit/withdraw/closeall)
   ───────────────────────────────────────────────────────────── */
function AccountActionPanel({ account, mode, onClose, onRefresh }) {
  const [action, setAction] = useState(null);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [details, setDetails] = useState(null);

  const id = account.externalAccountID || account.ExternalAccountID || account.id;
  const accentColor = mode === "prop" ? C.green : C.blue;

  useEffect(() => {
    apiGet(`/condor/accounts/${id}`).then(r => {
      if (r.ok) setDetails(r.account);
    });
  }, [id]);

  const execute = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (action === "deposit") {
        res = await apiPost(`/condor/accounts/${id}/deposit`, { amount: parseFloat(amount), comments: comment || "Deposit via ForexOpsPro" });
      } else if (action === "withdraw") {
        res = await apiPost(`/condor/accounts/${id}/withdraw`, { amount: parseFloat(amount), comments: comment || "Withdrawal via ForexOpsPro" });
      } else if (action === "disable") {
        res = await apiPost(`/condor/accounts/${id}/disable`, {});
      } else if (action === "enable") {
        res = await apiPost(`/condor/accounts/${id}/enable`, {});
      } else if (action === "closeall") {
        res = await apiPost(`/condor/accounts/${id}/closeall`, {});
      }
      if (res?.ok) {
        setResult({ type: "success", message: `${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully` });
        onRefresh && onRefresh();
      } else {
        setResult({ type: "error", message: res?.error || "Action failed" });
      }
    } catch (err) {
      setResult({ type: "error", message: "Connection error" });
    }
    setLoading(false);
  };

  const actions = [
    { id: "deposit", label: "Deposit", icon: "↓", color: C.green },
    { id: "withdraw", label: "Withdraw", icon: "↑", color: C.purple },
    { id: "enable", label: "Enable", icon: "✓", color: C.blue },
    { id: "disable", label: "Disable", icon: "⊘", color: C.amber },
    ...(mode === "prop" ? [{ id: "closeall", label: "Close All Trades", icon: "✕", color: C.red }] : []),
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 500, background: C.card, borderLeft: `1px solid ${C.borderHi}`, zIndex: 501, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, background: `${accentColor}08`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Av i={(account.firstName || account.name || "?")[0]} size={44} color={accentColor} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{account.firstName || account.name} {account.lastName || ""}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{account.email || ""}</div>
                <div style={{ fontSize: 11, color: accentColor, fontFamily: "monospace", marginTop: 3 }}>{account.condorLogin || account.AccountLogin || id}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Live account stats from Condor */}
          {details && (
            <div>
              <div style={{ fontSize: 10, color: C.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Live Account Data — Condor</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { label: "Balance", value: details.Balance !== undefined ? `$${Number(details.Balance).toLocaleString()}` : "—", color: C.green },
                  { label: "Equity", value: details.Equity !== undefined ? `$${Number(details.Equity).toLocaleString()}` : "—", color: C.blue },
                  { label: "Margin", value: details.Margin !== undefined ? `$${Number(details.Margin).toLocaleString()}` : "—", color: C.amber },
                  { label: "Open P&L", value: details.OpenPnL !== undefined ? `$${Number(details.OpenPnL).toLocaleString()}` : "—", color: details.OpenPnL >= 0 ? C.green : C.red },
                  { label: "Account ID", value: id, color: C.faint },
                  { label: "Group", value: "ForexOpsPro", color: accentColor },
                ].map(s => (
                  <div key={s.label} style={{ padding: "10px 12px", background: C.surface, borderRadius: C.r, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div>
            <div style={{ fontSize: 10, color: C.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Actions</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {actions.map(a => (
                <button key={a.id} onClick={() => { setAction(a.id); setResult(null); setAmount(""); setComment(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: C.r, background: action === a.id ? `${a.color}15` : C.surface, border: `1.5px solid ${action === a.id ? a.color : C.border}`, color: action === a.id ? a.color : C.muted, fontSize: 12, fontWeight: action === a.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  <span>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action form */}
          {action && (
            <div style={{ background: C.surface, borderRadius: C.rL, border: `1px solid ${C.border}`, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                {action === "deposit" && "Deposit Funds"}
                {action === "withdraw" && "Withdraw Funds"}
                {action === "disable" && "Disable Account"}
                {action === "enable" && "Enable Account"}
                {action === "closeall" && "Close All Open Trades"}
              </div>

              {(action === "deposit" || action === "withdraw") && (
                <>
                  <Input label="Amount (USD)" value={amount} onChange={setAmount} placeholder="Enter amount" type="number" />
                  <Input label="Comment (optional)" value={comment} onChange={setComment} placeholder="Reason for transaction" />
                </>
              )}

              {action === "disable" && (
                <div style={{ padding: "10px 14px", background: C.amberDim, border: `1px solid ${C.amber}25`, borderRadius: C.r, fontSize: 12, color: C.amber }}>
                  This will immediately suspend all trading on this account. The trader will not be able to open new positions.
                </div>
              )}

              {action === "enable" && (
                <div style={{ padding: "10px 14px", background: `${C.green}10`, border: `1px solid ${C.green}25`, borderRadius: C.r, fontSize: 12, color: C.green }}>
                  This will restore trading access for this account.
                </div>
              )}

              {action === "closeall" && (
                <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid ${C.red}25`, borderRadius: C.r, fontSize: 12, color: C.red }}>
                  This will immediately close ALL open positions on this account. This cannot be undone.
                </div>
              )}

              {result && (
                <div style={{ padding: "10px 14px", background: result.type === "success" ? `${C.green}10` : C.redDim, border: `1px solid ${result.type === "success" ? C.green : C.red}25`, borderRadius: C.r, fontSize: 12, color: result.type === "success" ? C.green : C.red }}>
                  {result.message}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={execute} disabled={loading || ((action === "deposit" || action === "withdraw") && !amount)}
                  color={action === "disable" ? C.amber : action === "closeall" ? C.red : action === "withdraw" ? C.purple : C.green}>
                  {loading ? "Processing..." : "Confirm"}
                </Btn>
                <Btn onClick={() => setAction(null)} outline color={C.muted}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   KYC APPROVE/REJECT MODAL (broker only)
   ───────────────────────────────────────────────────────────── */
function KYCModal({ client, onClose, onUpdate }) {
  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!decision) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onUpdate(client.id, decision, notes);
    setDone(true);
    setLoading(false);
    setTimeout(onClose, 1500);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 500, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 480, background: C.card, border: `1px solid ${C.borderHi}`, borderRadius: 16, zIndex: 501, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `${C.blue}08` }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>KYC Decision — {client.name}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Review and approve or reject this client's KYC application</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.surface, borderRadius: C.r, border: `1px solid ${C.border}` }}>
            <Av i={client.avatar} size={40} color={C.blue} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{client.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{client.email} · {client.country}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Decision</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { value: "Verified", label: "Approve KYC", color: C.green },
                { value: "Failed", label: "Reject KYC", color: C.red },
                { value: "Pending", label: "Request More Info", color: C.amber },
              ].map(d => (
                <button key={d.value} onClick={() => setDecision(d.value)}
                  style={{ flex: 1, padding: "10px 8px", borderRadius: C.r, background: decision === d.value ? `${d.color}15` : C.surface, border: `1.5px solid ${decision === d.value ? d.color : C.border}`, color: decision === d.value ? d.color : C.muted, fontSize: 12, fontWeight: decision === d.value ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Compliance Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes for compliance record..." rows={3}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, color: C.text, fontSize: 13, padding: "10px 13px", fontFamily: "inherit", resize: "vertical" }} />
          </div>

          {done && (
            <div style={{ padding: "10px 14px", background: `${C.green}10`, border: `1px solid ${C.green}25`, borderRadius: C.r, fontSize: 12, color: C.green }}>
              KYC decision recorded successfully
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={submit} disabled={!decision || loading || done} color={decision === "Verified" ? C.green : decision === "Failed" ? C.red : C.amber}>
              {loading ? "Saving..." : "Confirm Decision"}
            </Btn>
            <Btn onClick={onClose} outline color={C.muted}>Cancel</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCOUNT MANAGEMENT PAGE — PROP FIRM
   ───────────────────────────────────────────────────────────── */
export function PropAccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const r = await apiGet("/accounts");
      if (r.ok) setAccounts(r.accounts || []);
    } catch (e) {
      setToast({ message: "Failed to load accounts", type: "error" });
    }
    setLoading(false);
  };

  useEffect(() => { loadAccounts(); }, []);

  const filtered = accounts.filter(a =>
    !search ||
    (a.first_name + " " + a.last_name).toLowerCase().includes(search.toLowerCase()) ||
    (a.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.external_id || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreated = (account) => {
    setToast({ message: `Account ${account.AccountLogin} created on Condor`, type: "success" });
    loadAccounts();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Accounts", value: accounts.length, color: C.green },
          { label: "Active", value: accounts.filter(a => a.status === "active").length, color: C.green },
          { label: "Disabled", value: accounts.filter(a => a.status === "disabled").length, color: C.red },
          { label: "On Condor", value: accounts.filter(a => a.condor_login).length, color: C.blue },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.rL, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 24, right: 24, height: 1, background: `linear-gradient(90deg,transparent,${s.color}55,transparent)` }} />
            <div style={{ fontSize: 11, color: C.faint, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.rL, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Trader Accounts</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>All accounts provisioned on Condor — ForexOpsPro group</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts..."
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, color: C.text, padding: "7px 13px", fontSize: 12, fontFamily: "inherit", width: 180 }} />
            <Btn onClick={() => setShowCreate(true)} color={C.green} small>+ Create Account</Btn>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.faint, fontSize: 13 }}>Loading accounts from Condor...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.faint, marginBottom: 12 }}>No accounts found. Create your first trader account.</div>
            <Btn onClick={() => setShowCreate(true)} color={C.green}>Create First Account</Btn>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {["Trader", "Condor Login", "Balance", "Status", "Group", "Created", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: "0.07em", textTransform: "uppercase", background: C.card, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((acc, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Av i={(acc.first_name || "?")[0]} size={30} color={acc.status === "active" ? C.green : C.faint} />
                        <div>
                          <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{acc.first_name} {acc.last_name}</div>
                          <div style={{ fontSize: 10, color: C.faint }}>{acc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: C.green }}>{acc.condor_login || "—"}</span>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, color: C.text }}>{acc.balance ? `$${Number(acc.balance).toLocaleString()}` : "—"}</span>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <Tag color={acc.status === "active" ? C.green : acc.status === "disabled" ? C.red : C.amber}>
                        {acc.status || "active"}
                      </Tag>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <Tag color={C.green}>{acc.group_name || "ForexOpsPro"}</Tag>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle", fontSize: 11, color: C.faint }}>
                      {acc.created_at ? new Date(acc.created_at).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <button onClick={() => setSelectedAccount({ ...acc, externalAccountID: acc.external_id, firstName: acc.first_name, lastName: acc.last_name })}
                        style={{ padding: "5px 12px", background: `${C.green}10`, color: C.green, border: `1px solid ${C.green}30`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateAccountModal mode="prop" onClose={() => setShowCreate(false)} onSuccess={handleCreated} />}
      {selectedAccount && <AccountActionPanel account={selectedAccount} mode="prop" onClose={() => setSelectedAccount(null)} onRefresh={loadAccounts} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCOUNT MANAGEMENT PAGE — BROKER
   ───────────────────────────────────────────────────────────── */
export function BrokerAccountManagement({ clients, kycData, onKYCUpdate }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [kycClient, setKYCClient] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const r = await apiGet("/accounts");
      if (r.ok) setAccounts(r.accounts || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleCreated = (account) => {
    setToast({ message: `Client account ${account.AccountLogin} created on Condor`, type: "success" });
    loadAccounts();
  };

  const handleKYCUpdate = (clientId, decision, notes) => {
    onKYCUpdate && onKYCUpdate(clientId, decision, notes);
    setToast({ message: `KYC ${decision} for client recorded`, type: decision === "Verified" ? "success" : "error" });
  };

  const pendingKYC = clients ? clients.filter(c => kycData && (kycData[c.id]?.status === "Pending" || kycData[c.id]?.status === "Failed")) : [];
  const filtered = accounts.filter(a =>
    !search ||
    (a.first_name + " " + a.last_name).toLowerCase().includes(search.toLowerCase()) ||
    (a.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Clients", value: accounts.length, color: C.blue },
          { label: "Active", value: accounts.filter(a => a.status === "active").length, color: C.green },
          { label: "KYC Pending", value: pendingKYC.length, color: C.amber },
          { label: "Disabled", value: accounts.filter(a => a.status === "disabled").length, color: C.red },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.rL, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 24, right: 24, height: 1, background: `linear-gradient(90deg,transparent,${s.color}55,transparent)` }} />
            <div style={{ fontSize: 11, color: C.faint, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* KYC queue */}
      {pendingKYC.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.amber}22`, borderRadius: C.rL, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>KYC Review Queue</div>
            <Tag color={C.amber}>{pendingKYC.length} pending</Tag>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingKYC.map(c => {
              const kyc = kycData[c.id];
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.surface, borderRadius: C.r, border: `1px solid ${C.border}` }}>
                  <Av i={c.avatar} size={34} color={C.amber} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.faint }}>{c.email} · {kyc?.notes?.slice(0, 60)}...</div>
                  </div>
                  <Tag color={kyc?.status === "Failed" ? C.red : C.amber}>{kyc?.status}</Tag>
                  <button onClick={() => setKYCClient(c)}
                    style={{ padding: "6px 14px", background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}30`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Review KYC
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accounts table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.rL, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Client Accounts</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>All client accounts provisioned on Condor</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, color: C.text, padding: "7px 13px", fontSize: 12, fontFamily: "inherit", width: 180 }} />
            <Btn onClick={() => setShowCreate(true)} color={C.blue} small>+ Create Account</Btn>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.faint, fontSize: 13 }}>Loading client accounts...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.faint, marginBottom: 12 }}>No client accounts yet. Create your first account.</div>
            <Btn onClick={() => setShowCreate(true)} color={C.blue}>Create First Account</Btn>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {["Client", "Condor Login", "Balance", "Status", "Created", "KYC", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: "0.07em", textTransform: "uppercase", background: C.card, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((acc, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Av i={(acc.first_name || "?")[0]} size={30} color={acc.status === "active" ? C.blue : C.faint} />
                        <div>
                          <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{acc.first_name} {acc.last_name}</div>
                          <div style={{ fontSize: 10, color: C.faint }}>{acc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: C.blue }}>{acc.condor_login || "—"}</span>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, color: C.text }}>{acc.balance ? `$${Number(acc.balance).toLocaleString()}` : "—"}</span>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <Tag color={acc.status === "active" ? C.green : acc.status === "disabled" ? C.red : C.amber}>{acc.status || "active"}</Tag>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle", fontSize: 11, color: C.faint }}>
                      {acc.created_at ? new Date(acc.created_at).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <Tag color={C.amber}>Pending</Tag>
                    </td>
                    <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                      <button onClick={() => setSelectedAccount({ ...acc, externalAccountID: acc.external_id, firstName: acc.first_name, lastName: acc.last_name })}
                        style={{ padding: "5px 12px", background: `${C.blue}10`, color: C.blue, border: `1px solid ${C.blue}30`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateAccountModal mode="broker" onClose={() => setShowCreate(false)} onSuccess={handleCreated} />}
      {selectedAccount && <AccountActionPanel account={selectedAccount} mode="broker" onClose={() => setSelectedAccount(null)} onRefresh={loadAccounts} />}
      {kycClient && <KYCModal client={kycClient} onClose={() => setKYCClient(null)} onUpdate={handleKYCUpdate} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
