import { useState, useEffect, useCallback } from "react";

const BACKEND = "https://forexopspro-backend-production.up.railway.app";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BACKEND}${path}`, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  return apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/* ─────────────────────────────────────────────────────────────
   useAccounts — loads all accounts from Supabase + live Condor data
   ───────────────────────────────────────────────────────────── */
export function useAccounts(mode) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiFetch("/accounts/live");
      if (r.ok) {
        let accs = r.accounts || [];
        if (mode) accs = accs.filter(a => !a.mode || a.mode === mode);
        setAccounts(accs);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [mode]);

  useEffect(() => { load(); }, [load]);
  return { accounts, loading, error, reload: load };
}

/* ─────────────────────────────────────────────────────────────
   useTransactions — loads transaction history from Supabase
   ───────────────────────────────────────────────────────────── */
export function useTransactions(externalId) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!externalId) return;
    apiFetch(`/accounts/${externalId}/transactions`)
      .then(r => { if (r.ok) setTransactions(r.transactions || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [externalId]);

  return { transactions, loading };
}

/* ─────────────────────────────────────────────────────────────
   useRunningTrades — live open positions from Condor
   ───────────────────────────────────────────────────────────── */
export function useRunningTrades(externalId) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!externalId) return;
    apiFetch(`/condor/accounts/${externalId}/trades`)
      .then(r => { if (r.ok) setTrades(r.trades || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [externalId]);

  return { trades, loading };
}

/* ─────────────────────────────────────────────────────────────
   usePropStat — challenge stats from Condor
   ───────────────────────────────────────────────────────────── */
export function usePropStat(externalId) {
  const [stat, setStat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!externalId) return;
    apiFetch(`/condor/accounts/${externalId}/propstat`)
      .then(r => { if (r.ok) setStat(r.stat); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [externalId]);

  return { stat, loading };
}

/* ─────────────────────────────────────────────────────────────
   useLiveOverview — aggregate stats for overview dashboard
   ───────────────────────────────────────────────────────────── */
export function useLiveOverview(mode) {
  const { accounts, loading } = useAccounts(mode);

  const stats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(a => a.status === "active").length,
    disabledAccounts: accounts.filter(a => a.status === "disabled").length,
    totalFunds: accounts.reduce((s, a) => s + (a.live_balance || a.balance || 0), 0),
    totalEquity: accounts.reduce((s, a) => s + (a.live_equity || a.balance || 0), 0),
    floatingPnl: accounts.reduce((s, a) => s + (a.live_pnl || 0), 0),
    pendingPayouts: 0,
    riskFlags: accounts.filter(a => a.status === "disabled").length,
  };

  return { stats, accounts, loading };
}

/* ─────────────────────────────────────────────────────────────
   useDrawdownMonitor — check all accounts for drawdown breaches
   ───────────────────────────────────────────────────────────── */
export function useDrawdownMonitor(limitPct = 10) {
  const [breached, setBreached] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);

  const check = useCallback(async () => {
    try {
      const r = await apiPost("/condor/monitor/drawdown", { drawdownLimitPct: limitPct });
      if (r.ok) {
        setBreached(r.breached || []);
        setLastCheck(new Date().toISOString());
      }
    } catch (e) {}
  }, [limitPct]);

  // Auto-check every 60 seconds
  useEffect(() => {
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [check]);

  return { breached, lastCheck, checkNow: check };
}

/* ─────────────────────────────────────────────────────────────
   Account actions — deposit, withdraw, disable, enable, closeall
   ───────────────────────────────────────────────────────────── */
export async function depositFunds(externalId, amount, comments) {
  return apiPost(`/condor/accounts/${externalId}/deposit`, { amount, comments });
}

export async function withdrawFunds(externalId, amount, comments) {
  return apiPost(`/condor/accounts/${externalId}/withdraw`, { amount, comments });
}

export async function disableAccount(externalId) {
  return apiPost(`/condor/accounts/${externalId}/disable`, {});
}

export async function enableAccount(externalId) {
  return apiPost(`/condor/accounts/${externalId}/enable`, {});
}

export async function closeAllTrades(externalId) {
  return apiPost(`/condor/accounts/${externalId}/closeall`, {});
}
