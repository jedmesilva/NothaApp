// Variante B — "Dois números, uma história"
// Recebido e A receber como dois blocos simétricos e igualmente pesados.
// O percentual aparece como um pill discreto no topo — suporte, não destaque.
// A barra conecta visualmente os dois blocos sem precisar de legenda.

export function DoisNumeros() {
  const pct = 34;
  const recebido = "R$ 12.400";
  const aReceber = "R$ 23.900";

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
         style={{ background: "#F4F5F7", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[390px] rounded-[28px] p-6"
           style={{ background: "#15151D" }}>

        {/* Topo: eyebrow + pill de % */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[11px] font-semibold tracking-[0.3px] uppercase"
             style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
            Capital retornado
          </p>
          {/* Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
               style={{ background: "rgba(255,255,255,0.10)" }}>
            <span className="text-[12px] font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {pct}%
            </span>
            <span className="text-[11px]"
                  style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
              devolvido
            </span>
          </div>
        </div>

        {/* Dois blocos simétricos */}
        <div className="flex items-start justify-between mb-5">
          {/* Recebido */}
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.2px] uppercase mb-2"
               style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              Recebido
            </p>
            <p className="text-[26px] font-bold leading-none text-white"
               style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.5px" }}>
              {recebido}
            </p>
          </div>

          {/* Divisor vertical */}
          <div className="w-px self-stretch mx-4 mt-5"
               style={{ background: "rgba(255,255,255,0.12)" }} />

          {/* A receber */}
          <div className="text-right">
            <p className="text-[10.5px] font-semibold tracking-[0.2px] uppercase mb-2"
               style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              A receber
            </p>
            <p className="text-[26px] font-bold leading-none"
               style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.5px",
                        color: "rgba(255,255,255,0.50)" }}>
              {aReceber}
            </p>
          </div>
        </div>

        {/* Barra simples — conecta os dois */}
        <div className="w-full h-1.5 rounded-full overflow-hidden"
             style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="h-full rounded-full"
               style={{ width: `${pct}%`, background: "#fff" }} />
        </div>

      </div>
    </div>
  );
}
