/**
 * PulseHome — "Financial pulse" home screen variation
 *
 * Hypothesis: instead of a dashboard that shows everything at once, the system
 * decides what matters most right now and surfaces it as a full-bleed "moment".
 * The user swipes through moments ranked by urgency:
 *   1. Overdue installment (red)
 *   2. Upcoming payment (dark brand)
 *   3. Available credit limit (dark brand)
 *   4. Account balance (light)
 *
 * This is architecturally opposite to the current design:
 *   Current  → show everything → user finds what matters
 *   Pulse    → system ranks urgency → one thing owns the screen
 */

import { useState, useRef } from "react";

// ─── Design tokens (mirrors artifacts/mobile/constants/theme.ts) ─────────────
const C = {
  bg: "#F4F5F7",
  dark: "#15151D",
  darkSoft: "#26262F",
  ink: "#15151D",
  inkSoft: "#6C707A",
  inkFaint: "#A2A6AF",
  line: "#EBEBF0",
  red: "#C0392B",
  redDark: "#7B1D13",
  onDarkSoft: "rgba(255,255,255,0.55)",
  onDarkFaint: "rgba(255,255,255,0.40)",
  onDarkSubtle: "rgba(255,255,255,0.10)",
  white: "#FFFFFF",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const DATA = {
  user: "Ana",
  greeting: "Boa tarde",
  limiteDisponivel: 1500,
  limiteTotal: 3000,
  saldo: 847.3,
  overdueCount: 1,
  overdueValue: 120.0,
  nextDueDays: 3,
  nextDueValue: 120.0,
  nextDueLoan: "Semana 4 de 6",
};

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Moment definitions ───────────────────────────────────────────────────────
type MomentKind = "overdue" | "upcoming" | "limit" | "balance";

interface Moment {
  id: MomentKind;
  bg: string;
  accentLine?: string;      // top accent bar colour
  eyebrow: string;
  value: string;
  sub: string;
  cta: string;
  ctaBg: string;
  ctaColor: string;
  textColor: string;
  mutedColor: string;
  dotActiveColor: string;
}

const MOMENTS: Moment[] = [
  {
    id: "overdue",
    bg: C.redDark,
    accentLine: C.red,
    eyebrow: `${DATA.overdueCount} parcela em atraso`,
    value: `R$ ${formatBRL(DATA.overdueValue)}`,
    sub: "Pague agora para evitar juros adicionais",
    cta: "Pagar agora",
    ctaBg: "#FFFFFF",
    ctaColor: C.redDark,
    textColor: "#FFFFFF",
    mutedColor: "rgba(255,255,255,0.55)",
    dotActiveColor: "#FFFFFF",
  },
  {
    id: "upcoming",
    bg: C.dark,
    eyebrow: `Vence em ${DATA.nextDueDays} dias`,
    value: `R$ ${formatBRL(DATA.nextDueValue)}`,
    sub: DATA.nextDueLoan,
    cta: "Ver empréstimo",
    ctaBg: "rgba(255,255,255,0.12)",
    ctaColor: "#FFFFFF",
    textColor: "#FFFFFF",
    mutedColor: C.onDarkFaint,
    dotActiveColor: "#FFFFFF",
  },
  {
    id: "limit",
    bg: C.dark,
    eyebrow: "Limite disponível",
    value: `R$ ${formatBRL(DATA.limiteDisponivel)}`,
    sub: `de R$ ${formatBRL(DATA.limiteTotal)} no total`,
    cta: "Solicitar empréstimo",
    ctaBg: "#FFFFFF",
    ctaColor: C.dark,
    textColor: "#FFFFFF",
    mutedColor: C.onDarkFaint,
    dotActiveColor: "#FFFFFF",
  },
  {
    id: "balance",
    bg: "#FFFFFF",
    eyebrow: "Saldo em conta",
    value: `R$ ${formatBRL(DATA.saldo)}`,
    sub: "Conta notha",
    cta: "Depositar",
    ctaBg: C.dark,
    ctaColor: "#FFFFFF",
    textColor: C.ink,
    mutedColor: C.inkSoft,
    dotActiveColor: C.ink,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PulseHome() {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);

  const goTo = (i: number) => {
    if (i < 0 || i >= MOMENTS.length) return;
    setCurrent(i);
    trackRef.current?.scrollTo({ left: i * 390, behavior: "smooth" });
  };

  // Touch / mouse drag handling
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) < 30) return;
    if (delta < 0) goTo(current + 1);
    else goTo(current - 1);
  };

  const moment = MOMENTS[current];

  // Limit arc calculation
  const pct = DATA.limiteDisponivel / DATA.limiteTotal;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: "#E8E8EC",
        borderRadius: 48,
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.28)",
        userSelect: "none",
        cursor: "grab",
        position: "relative",
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 28,
          paddingTop: 8,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: moment.textColor,
            opacity: 0.7,
            transition: "color 0.3s",
          }}
        >
          9:41
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[3, 2, 1].map((b) => (
            <div
              key={b}
              style={{
                width: b === 3 ? 16 : b === 2 ? 11 : 7,
                height: 8,
                borderRadius: 2,
                background: moment.textColor,
                opacity: b === 3 ? 0.7 : b === 2 ? 0.5 : 0.3,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Greeting header ──────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 58,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingInline: 28,
          pointerEvents: "none",
          transition: "color 0.3s",
        }}
      >
        <span style={{ fontSize: 15, color: moment.mutedColor, transition: "color 0.3s" }}>
          {DATA.greeting},{" "}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: moment.textColor, transition: "color 0.3s" }}>
          {DATA.user}
        </span>
      </div>

      {/* ── Slide track (scroll-snap) ─────────────────────────────────────── */}
      <div
        ref={trackRef}
        style={{
          flex: 1,
          display: "flex",
          overflowX: "hidden",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          pointerEvents: "none",
        }}
      >
        {MOMENTS.map((m, idx) => (
          <MomentSlide
            key={m.id}
            moment={m}
            pct={pct}
            r={r}
            circ={circ}
            dash={dash}
            isCurrent={idx === current}
          />
        ))}
      </div>

      {/* ── Pagination dots ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 108,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 7,
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        {MOMENTS.map((m, i) => (
          <div
            key={m.id}
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? moment.dotActiveColor : "rgba(128,128,128,0.3)",
              transition: "width 0.25s ease, background 0.3s",
            }}
          />
        ))}
      </div>

      {/* ── Bottom nav ────────────────────────────────────────────────────── */}
      <BottomNav moment={moment} />

      {/* ── Swipe hint (first render) ─────────────────────────────────────── */}
      {current === 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 148,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <span style={{ fontSize: 11, color: moment.mutedColor, letterSpacing: "0.04em" }}>
            deslize para ver mais
          </span>
        </div>
      )}

      {/* Invisible dot tap targets */}
      <div
        style={{
          position: "absolute",
          bottom: 96,
          left: 0,
          right: 0,
          height: 40,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          zIndex: 30,
          paddingBottom: 12,
        }}
      >
        {MOMENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 32,
              height: 32,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Left / right tap zones */}
      <button
        onClick={() => goTo(current - 1)}
        style={{
          position: "absolute",
          left: 0,
          top: 100,
          width: 80,
          bottom: 120,
          background: "transparent",
          border: "none",
          cursor: current > 0 ? "pointer" : "default",
          zIndex: 25,
        }}
      />
      <button
        onClick={() => goTo(current + 1)}
        style={{
          position: "absolute",
          right: 0,
          top: 100,
          width: 80,
          bottom: 120,
          background: "transparent",
          border: "none",
          cursor: current < MOMENTS.length - 1 ? "pointer" : "default",
          zIndex: 25,
        }}
      />
    </div>
  );
}

// ─── Individual moment slide ─────────────────────────────────────────────────
function MomentSlide({
  moment,
  pct,
  r,
  circ,
  dash,
  isCurrent,
}: {
  moment: Moment;
  pct: number;
  r: number;
  circ: number;
  dash: number;
  isCurrent: boolean;
}) {
  const _ = isCurrent; // keep prop in type, unused inline

  return (
    <div
      style={{
        minWidth: 390,
        height: "100%",
        background: moment.bg,
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        paddingInline: 28,
        paddingTop: 110,
        paddingBottom: 180,
        boxSizing: "border-box",
        position: "relative",
        transition: "background 0.35s ease",
      }}
    >
      {/* Urgency / type badge */}
      <UrgencyIcon kind={moment.id} color={moment.textColor} />

      {/* Eyebrow label */}
      <p
        style={{
          margin: "12px 0 0",
          fontSize: 13,
          fontWeight: 500,
          color: moment.mutedColor,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        {moment.eyebrow}
      </p>

      {/* Big value */}
      <p
        style={{
          margin: "10px 0 0",
          fontSize: 52,
          fontWeight: 800,
          color: moment.textColor,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        {moment.value}
      </p>

      {/* Sub-context line */}
      <p
        style={{
          margin: "10px 0 0",
          fontSize: 14,
          fontWeight: 400,
          color: moment.mutedColor,
          lineHeight: 1.4,
        }}
      >
        {moment.sub}
      </p>

      {/* Contextual visualisation */}
      <div style={{ marginTop: 36 }}>
        {moment.id === "limit" && (
          <LimitArc pct={pct} r={r} circ={circ} dash={dash} color={moment.textColor} muted={moment.mutedColor} />
        )}
        {moment.id === "upcoming" && (
          <UpcomingTimeline textColor={moment.textColor} mutedColor={moment.mutedColor} />
        )}
        {moment.id === "overdue" && (
          <OverdueDetail textColor={moment.textColor} mutedColor={moment.mutedColor} />
        )}
        {moment.id === "balance" && (
          <BalanceBreakdown textColor={moment.textColor} mutedColor={moment.mutedColor} />
        )}
      </div>

      {/* CTA button — pinned to bottom via flex */}
      <div style={{ flex: 1 }} />
      <button
        style={{
          width: "100%",
          height: 52,
          borderRadius: 14,
          background: moment.ctaBg,
          color: moment.ctaColor,
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.01em",
        }}
      >
        {moment.cta}
      </button>
    </div>
  );
}

// ─── Urgency icon per moment type ────────────────────────────────────────────
function UrgencyIcon({ kind, color }: { kind: MomentKind; color: string }) {
  const alpha = color === "#FFFFFF" ? "rgba(255,255,255,0.12)" : "rgba(21,21,29,0.07)";
  const size = 44;

  const icons: Record<MomentKind, string> = {
    overdue: "⚠",
    upcoming: "⏰",
    limit: "◎",
    balance: "◈",
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: alpha,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
      }}
    >
      {icons[kind]}
    </div>
  );
}

// ─── Limit arc visualisation ─────────────────────────────────────────────────
function LimitArc({
  pct,
  r,
  circ,
  dash,
  color,
  muted,
}: {
  pct: number;
  r: number;
  circ: number;
  dash: number;
  color: string;
  muted: string;
}) {
  const usedPct = 1 - pct;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={muted}
          strokeWidth={8}
          opacity={0.2}
        />
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
        />
        <text
          x={50}
          y={54}
          textAnchor="middle"
          fill={color}
          fontSize={14}
          fontWeight={700}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <MiniStat label="Disponível" value={`R$ ${formatBRL(DATA.limiteDisponivel)}`} color={color} muted={muted} />
        <MiniStat label="Utilizado" value={`R$ ${formatBRL(DATA.limiteTotal - DATA.limiteDisponivel)}`} color={color} muted={muted} />
      </div>
    </div>
  );
}

// ─── Upcoming payment mini-timeline ─────────────────────────────────────────
function UpcomingTimeline({ textColor, mutedColor }: { textColor: string; mutedColor: string }) {
  const days = [
    { label: "Hoje", rel: 0 },
    { label: "Dom", rel: 1 },
    { label: "Seg", rel: 2 },
    { label: "Ter", rel: 3 },
  ];

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      {days.map((d, i) => (
        <div
          key={d.label}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}
        >
          {/* connector line */}
          {i < days.length - 1 && (
            <div
              style={{
                position: "absolute",
                top: 11,
                left: "50%",
                width: "100%",
                height: 2,
                background: d.rel < DATA.nextDueDays ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
              }}
            />
          )}
          {/* dot */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: d.rel === DATA.nextDueDays
                ? textColor
                : d.rel < DATA.nextDueDays
                  ? mutedColor
                  : "rgba(255,255,255,0.12)",
              border: d.rel === DATA.nextDueDays ? `3px solid ${mutedColor}` : "none",
              marginBottom: 6,
              zIndex: 1,
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          />
          <span style={{ fontSize: 11, color: d.rel === DATA.nextDueDays ? textColor : mutedColor, fontWeight: d.rel === DATA.nextDueDays ? 700 : 400 }}>
            {d.label}
          </span>
          {d.rel === DATA.nextDueDays && (
            <span style={{ fontSize: 11, color: textColor, fontWeight: 700, marginTop: 2 }}>
              R$ 120
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Overdue detail block ────────────────────────────────────────────────────
function OverdueDetail({ textColor, mutedColor }: { textColor: string; mutedColor: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Row label="Empréstimo" value="R$ 720,00" textColor={textColor} mutedColor={mutedColor} />
      <div style={{ height: 1, background: "rgba(255,255,255,0.10)" }} />
      <Row label="Parcela em atraso" value="R$ 120,00" textColor={textColor} mutedColor={mutedColor} highlight />
      <div style={{ height: 1, background: "rgba(255,255,255,0.10)" }} />
      <Row label="Semana" value="3 de 6" textColor={textColor} mutedColor={mutedColor} />
    </div>
  );
}

// ─── Balance breakdown ───────────────────────────────────────────────────────
function BalanceBreakdown({ textColor, mutedColor }: { textColor: string; mutedColor: string }) {
  return (
    <div
      style={{
        background: "#F4F5F7",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Row label="Conta notha" value="R$ 847,30" textColor={textColor} mutedColor={mutedColor} />
      <div style={{ height: 1, background: C.line }} />
      <Row label="Investimentos" value="R$ 0,00" textColor={textColor} mutedColor={mutedColor} />
    </div>
  );
}

// ─── Utility sub-components ──────────────────────────────────────────────────
function MiniStat({
  label,
  value,
  color,
  muted,
}: {
  label: string;
  value: string;
  color: string;
  muted: string;
}) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 11, color: muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 15, color, fontWeight: 700 }}>{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  textColor,
  mutedColor,
  highlight = false,
}: {
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: mutedColor }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: highlight ? 700 : 600, color: textColor }}>
        {value}
      </span>
    </div>
  );
}

// ─── Bottom navigation ───────────────────────────────────────────────────────
function BottomNav({ moment }: { moment: Moment }) {
  const tabs = [
    { icon: "⌂", label: "Início", active: true },
    { icon: "↕", label: "Crédito", active: false },
    { icon: "◈", label: "Investir", active: false },
    { icon: "⊙", label: "Conta", active: false },
  ];

  const isDark = moment.textColor === "#FFFFFF";
  const navBg = isDark ? "rgba(21,21,29,0.88)" : "rgba(255,255,255,0.92)";
  const activeColor = isDark ? "#FFFFFF" : C.ink;
  const inactiveColor = isDark ? "rgba(255,255,255,0.35)" : C.inkFaint;
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : C.line;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 28,
        left: 20,
        right: 20,
        height: 64,
        borderRadius: 20,
        background: navBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        zIndex: 30,
        transition: "background 0.35s, border-color 0.35s",
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
              color: t.active ? activeColor : inactiveColor,
              transition: "color 0.3s",
              lineHeight: 1,
            }}
          >
            {t.icon}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: t.active ? 700 : 400,
              color: t.active ? activeColor : inactiveColor,
              transition: "color 0.3s",
            }}
          >
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}
