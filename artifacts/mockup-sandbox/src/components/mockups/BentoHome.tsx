/**
 * BentoHome — "Bento grid" home screen variation
 *
 * Same mental model as the current design (dashboard, everything visible,
 * scroll vertical) but different spatial architecture:
 *
 *   Current  → hero dark card (limit) → medium light card (balance) → section → loan list
 *   Bento    → greeting → tile row (limit tile | balance tile) →
 *              next-payment strip → loan tiles (denser, 2-col for multiple)
 *
 * Visual reference: Revolut / Robinhood widget-grid home.
 */

import { useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F2F3F6",
  dark: "#15151D",
  darkSoft: "#26262F",
  ink: "#15151D",
  inkSoft: "#6C707A",
  inkFaint: "#B0B4BC",
  line: "#E8E9ED",
  white: "#FFFFFF",
  red: "#C0392B",
  redBg: "#FBEAE8",
  amber: "#A6690A",
  amberBg: "#FCF1DC",
  green: "#1A7A4A",
  greenBg: "#E6F4ED",
  onDark: "rgba(255,255,255,1)",
  onDarkMid: "rgba(255,255,255,0.55)",
  onDarkFaint: "rgba(255,255,255,0.38)",
  onDarkSubtle: "rgba(255,255,255,0.09)",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const D = {
  name: "Ana",
  greeting: "Boa tarde",
  limiteDisponivel: 1500,
  limiteTotal: 3000,
  saldo: 847.3,
  loans: [
    {
      id: 1,
      valor: 720,
      parcelas: "3 / 6",
      ciclo: "semanal",
      status: "atrasado" as const,
      nextDue: "Vencida",
      nextValue: 120,
    },
    {
      id: 2,
      valor: 1200,
      parcelas: "1 / 12",
      ciclo: "mensal",
      status: "ativo" as const,
      nextDue: "em 18 dias",
      nextValue: 110,
    },
  ],
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtShort(n: number) {
  if (n >= 1000) return `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  return fmt(n);
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function BentoHome() {
  const pctUsado = Math.round(
    ((D.limiteTotal - D.limiteDisponivel) / D.limiteTotal) * 100
  );

  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: C.bg,
        borderRadius: 48,
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        position: "relative",
      }}
    >
      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 28,
          paddingTop: 10,
          flexShrink: 0,
          background: C.bg,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: C.inkSoft }}>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[3, 2, 1].map((b) => (
            <div
              key={b}
              style={{
                width: b === 3 ? 16 : b === 2 ? 11 : 7,
                height: 8,
                borderRadius: 2,
                background: C.inkFaint,
                opacity: b === 3 ? 1 : b === 2 ? 0.6 : 0.35,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 96,
        }}
      >
        {/* Greeting */}
        <div style={{ paddingInline: 22, paddingTop: 6, paddingBottom: 16 }}>
          <span style={{ fontSize: 15, color: C.inkSoft }}>
            {D.greeting},{" "}
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>
            {D.name}
          </span>
        </div>

        {/* ── Row 1: Limit tile (wide) + Balance tile (narrow) ──────────── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            paddingInline: 16,
            marginBottom: 10,
          }}
        >
          {/* Limit tile — 2/3 */}
          <div
            style={{
              flex: 2,
              background: C.dark,
              borderRadius: 24,
              padding: "20px 20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              minHeight: 180,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle radial glow */}
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                pointerEvents: "none",
              }}
            />

            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.onDarkFaint,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Limite disponível
            </span>

            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: C.onDark,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              R$ {fmtShort(D.limiteDisponivel)}
            </span>

            <span
              style={{
                fontSize: 12,
                color: C.onDarkFaint,
                marginTop: 3,
                marginBottom: 14,
              }}
            >
              de R$ {fmtShort(D.limiteTotal)}
            </span>

            {/* Segmented bar */}
            <SegBar pct={pctUsado} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: 11, color: C.onDarkFaint }}>
                R$ {fmtShort(D.limiteTotal - D.limiteDisponivel)} usados
              </span>
              <span style={{ fontSize: 11, color: C.onDarkFaint }}>
                {pctUsado}%
              </span>
            </div>

            {/* CTA */}
            <button
              style={{
                marginTop: 14,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: C.onDark,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Solicitar
            </button>
          </div>

          {/* Balance tile — 1/3 */}
          <div
            style={{
              flex: 1,
              background: C.white,
              borderRadius: 24,
              padding: "20px 16px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 180,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.inkFaint,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Saldo
              </span>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.ink,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                R$
                <br />
                {fmtShort(D.saldo)}
              </div>
            </div>

            {/* Mini sparkline placeholder */}
            <MiniSparkline />

            <button
              style={{
                height: 32,
                borderRadius: 9,
                background: C.bg,
                border: "none",
                color: C.ink,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Depositar
            </button>
          </div>
        </div>

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 22,
            marginBottom: 10,
            marginTop: 6,
          }}
        >
          <span
            style={{ fontSize: 16, fontWeight: 700, color: C.ink }}
          >
            Meus Empréstimos
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: C.inkFaint,
              cursor: "pointer",
            }}
          >
            Ver todos →
          </span>
        </div>

        {/* ── Summary strip ──────────────────────────────────────────────── */}
        <SummaryStrip loans={D.loans} />

        {/* ── Loan tiles ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingInline: 16,
            marginTop: 10,
          }}
        >
          {D.loans.map((loan) => (
            <LoanTile key={loan.id} loan={loan} />
          ))}
        </div>

        {/* Empty state CTA */}
        <div
          style={{
            paddingInline: 16,
            marginTop: 10,
          }}
        >
          <button
            style={{
              width: "100%",
              height: 48,
              borderRadius: 14,
              background: C.dark,
              border: "none",
              color: C.onDark,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Solicitar novo empréstimo
          </button>
        </div>
      </div>

      {/* ── Bottom nav ─────────────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}

// ─── Segmented progress bar (replaces ThinBar) ───────────────────────────────
function SegBar({ pct }: { pct: number }) {
  const segs = 12;
  const filledSegs = Math.round((pct / 100) * segs);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: segs }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background:
              i < filledSegs
                ? "rgba(255,255,255,0.85)"
                : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Mini sparkline (decorative) ─────────────────────────────────────────────
function MiniSparkline() {
  const pts = [28, 22, 26, 18, 24, 20, 25, 19, 24, 22, 27];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const h = 28;
  const w = 90;
  const step = w / (pts.length - 1);
  const normalize = (v: number) => h - ((v - min) / (max - min)) * h;
  const d = pts
    .map((v, i) =>
      i === 0 ? `M ${i * step},${normalize(v)}` : `L ${i * step},${normalize(v)}`
    )
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <path d={d} fill="none" stroke={C.inkFaint} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </svg>
  );
}

// ─── Summary strip (totals) ───────────────────────────────────────────────────
function SummaryStrip({ loans }: { loans: typeof D.loans }) {
  const totalEmAberto = loans.reduce((s, l) => s + l.valor, 0);
  const atrasados = loans.filter((l) => l.status === "atrasado").length;

  return (
    <div
      style={{
        marginInline: 16,
        background: C.white,
        borderRadius: 18,
        padding: "14px 18px",
        display: "flex",
        gap: 0,
      }}
    >
      <StatCell label="Em aberto" value={`R$ ${fmt(totalEmAberto)}`} borderRight />
      <StatCell label="Empréstimos" value={`${loans.length} ativos`} borderRight />
      <StatCell
        label="Situação"
        value={atrasados > 0 ? `${atrasados} em atraso` : "Em dia"}
        accent={atrasados > 0 ? C.red : C.green}
      />
    </div>
  );
}

function StatCell({
  label,
  value,
  accent,
  borderRight,
}: {
  label: string;
  value: string;
  accent?: string;
  borderRight?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        paddingRight: borderRight ? 12 : 0,
        paddingLeft: borderRight ? 0 : 12,
        borderRight: borderRight ? `1px solid ${C.line}` : "none",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 600,
          color: C.inkFaint,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: accent ?? C.ink,
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Loan tile (replaces LoanCard) ───────────────────────────────────────────
type LoanStatus = "ativo" | "atrasado" | "analise" | "captacao";

function LoanTile({
  loan,
}: {
  loan: {
    id: number;
    valor: number;
    parcelas: string;
    ciclo: string;
    status: LoanStatus;
    nextDue: string;
    nextValue: number;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig: Record<
    LoanStatus,
    { label: string; bg: string; color: string }
  > = {
    ativo: { label: "Ativo", bg: C.greenBg, color: C.green },
    atrasado: { label: "Em atraso", bg: C.redBg, color: C.red },
    analise: { label: "Em análise", bg: C.amberBg, color: C.amber },
    captacao: { label: "Em captação", bg: C.amberBg, color: C.amber },
  };

  const st = statusConfig[loan.status];

  return (
    <div
      style={{
        background: C.white,
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        border:
          loan.status === "atrasado"
            ? `1.5px solid ${C.redBg}`
            : `1px solid transparent`,
      }}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Main row */}
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: value + parcelas */}
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: C.ink,
              letterSpacing: "-0.02em",
            }}
          >
            R$ {fmt(loan.valor)}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 12,
              color: C.inkSoft,
            }}
          >
            Parcela {loan.parcelas} · {loan.ciclo}
          </p>
        </div>

        {/* Right: status badge + chevron */}
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: st.color,
              background: st.bg,
              paddingInline: 9,
              paddingBlock: 4,
              borderRadius: 999,
            }}
          >
            {st.label}
          </span>
          <span
            style={{
              fontSize: 18,
              color: C.inkFaint,
              lineHeight: 1,
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              display: "inline-block",
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* Next due strip — always visible */}
      <div
        style={{
          marginInline: 14,
          marginBottom: 14,
          background:
            loan.status === "atrasado" ? C.redBg : C.bg,
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color:
              loan.status === "atrasado" ? C.red : C.inkSoft,
            fontWeight: 500,
          }}
        >
          {loan.status === "atrasado" ? "Parcela vencida" : "Próximo vencimento"}{" "}
          <strong
            style={{
              fontWeight: 700,
              color: loan.status === "atrasado" ? C.red : C.ink,
            }}
          >
            {loan.nextDue}
          </strong>
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: loan.status === "atrasado" ? C.red : C.ink,
          }}
        >
          R$ {fmt(loan.nextValue)}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${C.line}`,
            padding: "14px 18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <DetailRow label="Total a pagar" value={`R$ ${fmt(loan.valor * 1.12)}`} />
          <DetailRow label="Taxa de juros" value="12% total" />
          <DetailRow label="Ciclo" value={loan.ciclo} />
          <button
            style={{
              marginTop: 6,
              height: 40,
              borderRadius: 10,
              background: loan.status === "atrasado" ? C.red : C.dark,
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loan.status === "atrasado" ? "Pagar parcela em atraso" : "Ver detalhes"}
          </button>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 13, color: C.inkSoft }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{value}</span>
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
function BottomNav() {
  const tabs = [
    { icon: "⌂", label: "Início", active: true },
    { icon: "↕", label: "Crédito", active: false },
    { icon: "◈", label: "Investir", active: false },
    { icon: "⊙", label: "Conta", active: false },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        height: 64,
        borderRadius: 22,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${C.line}`,
        display: "flex",
        alignItems: "center",
        zIndex: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      }}
    >
      {tabs.map((t) => (
        <div
          key={t.label}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 18,
              color: t.active ? C.ink : C.inkFaint,
              lineHeight: 1,
            }}
          >
            {t.icon}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: t.active ? 700 : 400,
              color: t.active ? C.ink : C.inkFaint,
            }}
          >
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}
