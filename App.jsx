import { useState, useEffect, useRef } from 'react';

// ── CONFIGURATION & COULEURS ──────────────────────────────
const SUPA_URL = "https://fiftdixtzeiidvwblvtr.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZnRkaXh0emVpaWR2d2JsdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDk3MzcsImV4cCI6MjA4OTc4NTczN30.BFvldCWsJQPXa6dHqR8wRJikVpG7qXTAEw_T6mtCGKM";

const R="#D4103F", D="#080808", C="#111", C2="#161616", B="rgba(255,255,255,0.07)", M="rgba(255,255,255,0.38)";
const G="#22c55e", BL="#60a5fa", PU="#a78bfa", YE="#fbbf24";

// ── BASE DE DONNÉES ───────────────────────────────────────
async function supabase(method, table, body, match) {
  const url = `${SUPA_URL}/rest/v1/${table}${match ? `?${match}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

const db = {
  getUsers: () => supabase("GET", "users", null),
  getReferrals: () => supabase("GET", "referrals", null),
  addReferral: (data) => supabase("POST", "referrals", data),
};

// ── COMPOSANTS ATOMES ─────────────────────────────────────
const Pill = ({ children, color = "red", xs }) => {
  const m = {
    red: { bg: "rgba(212,16,63,0.12)", t: R, b: "rgba(212,16,63,0.25)" },
    green: { bg: "rgba(34,197,94,0.12)", t: G, b: "rgba(34,197,94,0.25)" },
    gray: { bg: "rgba(255,255,255,0.06)", t: M, b: B }
  };
  const c = m[color] || m.gray;
  return <span style={{ background: c.bg, color: c.t, border: `1px solid ${c.b}`, borderRadius: 100, padding: xs ? "2px 8px" : "4px 12px", fontSize: xs ? 10 : 11, fontWeight: 700 }}>{children}</span>;
};

const Card = ({ children, style }) => (
  <div style={{ background: C, border: `1px solid ${B}`, borderRadius: 16, padding: 20, ...style }}>{children}</div>
);

const SC = ({ label, value, icon, color = "red" }) => {
  const cl = { red: R, green: G, blue: BL, purple: PU }[color] || R;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: M, textTransform: "uppercase" }}>{label}</div>
        <span>{icon}</span>
      </div>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 32, color: cl }}>{value}</div>
    </Card>
  );
};

// ── APPLICATION PRINCIPALE ────────────────────────────────
export default function App() {
  const [user, setUser] = useState({ name: "Ethan", email: "ethanbfr06@gmail.com", role: "admin" }); // Simulé pour l'aperçu
  const [page, setPage] = useState("admin_parrainage");
  const [referrals, setReferrals] = useState([
    { ownerName: "AlexStream", owner: "alex@test.com", code: "REF-ALEX-123", usedBy: "Viewer99", usedAt: "25/03/2026" },
    { ownerName: "GamingPro", owner: "pro@test.com", code: "REF-GAME-456", usedBy: null, usedAt: null }
  ]);

  // Vue Admin Parrainage (La version LARGE)
  const AdminParrainageView = () => (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontFamily: "Impact, sans-serif", fontSize: 32, color: R, letterSpacing: 1 }}>GESTION DES PARRAINAGES</h2>
        <p style={{ color: M }}>Suivi des invitations et des récompenses créateurs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
        <SC label="Codes actifs" value={referrals.length} icon="🎟️" color="blue" />
        <SC label="Parrainages réussis" value={referrals.filter(r => r.usedBy).length} icon="✅" color="green" />
        <SC label="Réductions à appliquer" value={referrals.filter(r => r.usedBy).length} icon="💰" color="purple" />
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${B}` }}>
              <th style={{ padding: 15, textAlign: 'left', color: M }}>PARRAIN</th>
              <th style={{ padding: 15, textAlign: 'left', color: M }}>CODE</th>
              <th style={{ padding: 15, textAlign: 'left', color: M }}>FILLEUL</th>
              <th style={{ padding: 15, textAlign: 'right', color: M }}>STATUT</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${B}` }}>
                <td style={{ padding: 1
