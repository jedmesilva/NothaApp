import { useState } from "react";

const C = {
  dark: "#15151D",
  darkSoft: "#26262F",
  onDarkSoft: "rgba(255,255,255,0.55)",
  onDarkFaint: "rgba(255,255,255,0.45)",
  onDarkSubtle: "rgba(255,255,255,0.12)",
  onDarkBorder: "rgba(255,255,255,0.14)",
  line: "#EBEBF0",
  bg: "#F4F5F7",
};

const MIN_CENTS = 10000;   // R$ 100
const MAX_CENTS = 100000;  // R$ 1.000
const RATE_PCT  = 12.5;
const PRAZO     = 30;

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function PoolBar({ pctCaptado, pctOferta }: { pctCaptado: number; pctOferta: number }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, color: C.onDarkFaint, textTransform: "uppercase", letterSpacing: "0.2px" }}>
          Captação
        </span>
        <span style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, color: C.onDarkFaint }}>
          {pctCaptado + pctOferta}% captado
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pctCaptado}%`, backgroundColor: "#fff", transition: "width 0.15s" }} />
        <div style={{ width: `${pctOferta}%`, backgroundColor: "rgba(255,255,255,0.35)", transition: "width 0.15s" }} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {[["#fff", "outros"], ["rgba(255,255,255,0.35)", "esta oferta"], ["rgba(255,255,255,0.12)", "captando"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color as string }} />
            <span style={{ fontSize: 10.5, fontFamily: "Inter, sans-serif", color: C.onDarkFaint }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ParaInvestir() {
  const [sliderCents, setSliderCents] = useState(MAX_CENTS);

  const valorInvestido  = sliderCents / 100;
  const retorno         = sliderCents * (RATE_PCT / 100) / 100;
  const totalComRetorno = valorInvestido + retorno;
  const pctOferta       = Math.round((sliderCents / 100 / 5000) * 100);
  const isMax           = sliderCents >= MAX_CENTS;
  const isMin           = sliderCents <= MIN_CENTS;
  const pct             = ((sliderCents - MIN_CENTS) / (MAX_CENTS - MIN_CENTS)) * 100;

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
            Retorno oferecido
          </span>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.10)",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#fff",
          }}>
            Classificação A+
          </div>
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
          Rendimento de R$ {formatBRL(sliderCents * RATE_PCT / 100)} em {PRAZO} dias
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: C.onDarkBorder, marginBottom: 20 }} />

        {/* Three-column metrics */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.2px", color: C.onDarkFaint, textTransform: "uppercase", marginBottom: 4 }}>
              Você investe
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 6 }}>
              R$ {valorInvestido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              {isMin && <span style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#f5a623", backgroundColor: "rgba(245,166,35,0.15)", borderRadius: 999, padding: "2px 7px" }}>mín</span>}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.2px", color: C.onDarkFaint, textTransform: "uppercase", marginBottom: 4 }}>
              Você recebe
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.3 }}>
              R$ {totalComRetorno.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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

        {/* Slider — abaixo da row, sem repetir o valor */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <input
              type="range"
              min={MIN_CENTS}
              max={MAX_CENTS}
              step={100}
              value={sliderCents}
              onChange={e => setSliderCents(Number(e.target.value))}
              style={{
                width: "100%",
                appearance: "none" as any,
                height: 6,
                borderRadius: 999,
                background: `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.18) ${pct}%)`,
                outline: "none",
                cursor: "pointer",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: C.onDarkFaint, fontFamily: "Inter, sans-serif" }}>R$ {formatBRL(MIN_CENTS)}</span>
            <span style={{ fontSize: 11, color: C.onDarkFaint, fontFamily: "Inter, sans-serif" }}>R$ {formatBRL(MAX_CENTS)}</span>
          </div>
        </div>

        {/* Pool bar */}
        <PoolBar pctCaptado={58} pctOferta={Math.min(pctOferta, 42)} />

      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #15151D;
          border: 4px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          margin-top: -11px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 999px;
        }
        input[type=range]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #15151D;
          border: 4px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
