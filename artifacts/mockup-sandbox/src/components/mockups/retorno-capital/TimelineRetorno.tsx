// Variante C — "Timeline de retorno"
// Abordagem narrativa: uma frase que conta a história ("R$ 12.400 já voltaram
// dos R$ 36.300 que você alocou"). O progresso é temporal, não só percentual —
// inclui âncora do próximo recebimento para dar senso de movimento.

export function TimelineRetorno() {
  const recebido = 12400;
  const total = 36300;
  const pct = Math.round((recebido / total) * 100);
  const proximoValor = "R$ 1.200";
  const proximoData = "15 ago";

  const fmt = (v: number) =>
    "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 0 });

  // Dot position clamped between 8% and 88%
  const dotPct = Math.min(88, Math.max(8, pct));

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
         style={{ background: "#F4F5F7", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[390px] rounded-[28px] p-6"
           style={{ background: "#15151D" }}>

        {/* Eyebrow */}
        <p className="text-[11px] font-semibold tracking-[0.3px] uppercase mb-4"
           style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
          Capital retornado
        </p>

        {/* Frase narrativa */}
        <p className="text-[15px] leading-snug mb-1"
           style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>
          <span className="text-white font-semibold">{fmt(recebido)}</span>
          {" "}já voltaram dos{" "}
          <span className="text-white font-semibold">{fmt(total)}</span>
          {" "}que você alocou
        </p>

        {/* Sub — percentual */}
        <p className="text-[13px] mb-6"
           style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
          {pct}% do capital retornado
        </p>

        {/* Divisor */}
        <div className="w-full h-px mb-5" style={{ background: "rgba(255,255,255,0.10)" }} />

        {/* Timeline visual */}
        <div className="relative mb-2">
          {/* Track */}
          <div className="w-full h-1 rounded-full"
               style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="h-full rounded-full"
                 style={{ width: `${pct}%`, background: "rgba(255,255,255,0.70)" }} />
          </div>
          {/* Dot — posição atual */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#15151D]"
               style={{ left: `${dotPct}%`, background: "#fff" }} />
        </div>

        {/* Labels da timeline */}
        <div className="flex justify-between mb-5">
          <p className="text-[10.5px]"
             style={{ color: "rgba(255,255,255,0.30)", fontFamily: "'Inter', sans-serif" }}>
            Início
          </p>
          <p className="text-[10.5px]"
             style={{ color: "rgba(255,255,255,0.30)", fontFamily: "'Inter', sans-serif" }}>
            Último vencimento
          </p>
        </div>

        {/* Próximo recebimento */}
        <div className="flex items-center justify-between rounded-[14px] px-4 py-3"
             style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            {/* Dot */}
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.45)" }} />
            <p className="text-[12.5px]"
               style={{ color: "rgba(255,255,255,0.50)", fontFamily: "'Inter', sans-serif" }}>
              Próximo recebimento
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-white"
               style={{ fontFamily: "'Inter', sans-serif" }}>
              {proximoValor}
            </p>
            <p className="text-[11px]"
               style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              {proximoData}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
