const C = {
  dark: "#15151D",
  onDarkSoft: "rgba(255,255,255,0.55)",
  onDarkFaint: "rgba(255,255,255,0.45)",
  onDarkBorder: "rgba(255,255,255,0.14)",
  bg: "#F4F5F7",
};

const VALOR_INVESTIDO  = 50000;  // R$ 500,00 em cents
const RATE_PCT         = 12.5;
const PRAZO            = 30;

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function StatusBadge() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderRadius: 999, padding: "3px 10px",
    }}>
      <div style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: "#4ade80" }} />
      <span style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#fff" }}>
        Ativo
      </span>
    </div>
  );
}

function PaymentBar() {
  const pct = 42;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, color: C.onDarkFaint, textTransform: "uppercase", letterSpacing: "0.2px" }}>
          Pagamento
        </span>
        <span style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, color: C.onDarkFaint }}>
          {pct}% pago
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#fff", borderRadius: 999 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: C.onDarkFaint, fontFamily: "Inter, sans-serif" }}>
          R$ {formatBRL(Math.round(VALOR_INVESTIDO * (1 + RATE_PCT / 100) * pct / 100))} pago
        </span>
        <span style={{ fontSize: 11, color: C.onDarkFaint, fontFamily: "Inter, sans-serif" }}>
          R$ {formatBRL(Math.round(VALOR_INVESTIDO * (1 + RATE_PCT / 100)))} total
        </span>
      </div>
    </div>
  );
}

export function JaInvestido() {
  const totalComRetorno = Math.round(VALOR_INVESTIDO * (1 + RATE_PCT / 100));
  const retorno         = totalComRetorno - VALOR_INVESTIDO;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: C.bg,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 358,
        backgroundColor: C.dark,
        borderRadius: 28,
        padding: 24,
      }}>

        {/* Eyebrow row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.3px", color: C.onDarkSoft }}>
            Retorno do contrato
          </span>
          <StatusBadge />
        </div>

        {/* Hero value */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 44,
          color: "#fff",
          letterSpacing: -1.1,
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 24 }}>+</span>{RATE_PCT}%
        </div>
        <div style={{ fontSize: 13.5, color: C.onDarkFaint, fontFamily: "Inter, sans-serif", marginBottom: 22 }}>
          Rendimento de R$ {formatBRL(retorno)} em {PRAZO} dias
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: C.onDarkBorder, marginBottom: 20 }} />

        {/* Three-column metrics */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.2px", color: C.onDarkFaint, textTransform: "uppercase", marginBottom: 4 }}>
              Investimento
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.3 }}>
              R$ {formatBRL(VALOR_INVESTIDO)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.2px", color: C.onDarkFaint, textTransform: "uppercase", marginBottom: 4 }}>
              Retorno
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.3 }}>
              R$ {formatBRL(totalComRetorno)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.2px", color: C.onDarkFaint, textTransform: "uppercase", marginBottom: 4 }}>
              Prazo
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.3 }}>
              {PRAZO} dias
            </div>
          </div>
        </div>

        {/* Payment bar */}
        <PaymentBar />

      </div>
    </div>
  );
}
