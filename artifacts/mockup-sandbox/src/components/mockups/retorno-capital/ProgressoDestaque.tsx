// Variante A — "Progresso em destaque"
// A barra de progresso é o elemento central. O percentual aparece grande
// acima dela; os dois valores ficam menores embaixo como suporte.

export function ProgressoDestaque() {
  const pct = 34;
  const recebido = "R$ 12.400";
  const aReceber = "R$ 23.900";

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
         style={{ background: "#F4F5F7", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[390px] rounded-[28px] p-6"
           style={{ background: "#15151D" }}>

        {/* Eyebrow */}
        <p className="text-[11px] font-semibold tracking-[0.3px] uppercase mb-3"
           style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
          Capital retornado
        </p>

        {/* Percentual — hero visual */}
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-[52px] font-bold leading-none tracking-[-1.5px] text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {pct}
          </span>
          <span className="text-[28px] font-bold leading-none"
                style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Space Grotesk', sans-serif" }}>
            %
          </span>
          <span className="ml-2 text-[13px] font-medium"
                style={{ color: "rgba(255,255,255,0.40)", fontFamily: "'Inter', sans-serif" }}>
            já retornou
          </span>
        </div>

        {/* Barra grossa */}
        <div className="w-full h-3 rounded-full mb-5 overflow-hidden"
             style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="h-full rounded-full"
               style={{ width: `${pct}%`, background: "#fff" }} />
        </div>

        {/* Dois valores */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.2px] uppercase mb-1.5"
               style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              Recebido
            </p>
            <p className="text-[22px] font-bold leading-none text-white"
               style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.3px" }}>
              {recebido}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold tracking-[0.2px] uppercase mb-1.5"
               style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              A receber
            </p>
            <p className="text-[22px] font-bold leading-none"
               style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.3px",
                        color: "rgba(255,255,255,0.55)" }}>
              {aReceber}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
