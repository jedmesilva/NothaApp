import { Router } from "express";
import { eq, sum } from "drizzle-orm";
import { db, walletsTable, loansTable } from "@workspace/db";

const router = Router();

// Parâmetros do modelo de precificação por desequilíbrio
// Ajustar conforme calibração do negócio
const AMPLITUDE_PCT = 5; // deslocamento máximo da taxa (pp) para cada extremo do desequilíbrio

// GET /api/market-rate — retorna oferta, demanda e a taxa de ajuste de mercado
// Não exige autenticação: é um sinal de mercado agregado, não dados do usuário.
router.get("/", async (_req, res) => {
  const [ofertaRow, demandaRow] = await Promise.all([
    // Oferta: capital disponível = soma de todos os saldos de wallet
    db
      .select({ total: sum(walletsTable.balanceCents) })
      .from(walletsTable),

    // Demanda: capital solicitado = soma dos empréstimos em captação
    db
      .select({ total: sum(loansTable.amountCents) })
      .from(loansTable)
      .where(eq(loansTable.status, "funding")),
  ]);

  const ofertaCentavos = Number(ofertaRow[0]?.total ?? 0);
  const demandaCentavos = Number(demandaRow[0]?.total ?? 0);

  const totalPool = ofertaCentavos + demandaCentavos;

  // Fórmula: desequilíbrio normalizado, simétrico em [-1, +1]
  // 0 = equilíbrio exato  |  +1 = só demanda  |  -1 = só oferta
  const desequilibrio = totalPool === 0 ? 0 : (demandaCentavos - ofertaCentavos) / totalPool;

  // Ajuste aditivo sobre a taxa base (pontos percentuais)
  // taxa_final(prazo) = taxaBase(prazo) + ajustePct
  const ajustePct = desequilibrio * AMPLITUDE_PCT;

  res.json({
    ofertaCentavos,
    demandaCentavos,
    desequilibrio,
    ajustePct,
    parametros: {
      amplitudePct: AMPLITUDE_PCT,
    },
  });
});

export default router;
