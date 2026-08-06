/**
 * XIRR — Taxa Interna de Retorno com datas irregulares (annualizada).
 *
 * Mesmo algoritmo usado por Nubank, XP e Warren para calcular rentabilidade
 * de carteira. Usa Newton-Raphson para encontrar a taxa que zera o VPL dos
 * fluxos fornecidos.
 *
 * @param cashflows  Lista de { date, amountCents } ordenada por data.
 *                   Deve conter pelo menos um valor negativo (aporte) e um
 *                   positivo (retorno). Valores em centavos.
 * @param guess      Estimativa inicial da taxa (default 10% a.a.)
 * @returns          Taxa anual (ex: 0.184 = 18,4% a.a.) ou null se não
 *                   convergir ou dados insuficientes.
 */
export function xirr(
  cashflows: { date: Date; amountCents: number }[],
  guess = 0.1,
): number | null {
  if (cashflows.length < 2) return null;

  const hasNeg = cashflows.some((cf) => cf.amountCents < 0);
  const hasPos = cashflows.some((cf) => cf.amountCents > 0);
  if (!hasNeg || !hasPos) return null;

  const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
  const t0 = cashflows[0].date.getTime();
  const times = cashflows.map((cf) => (cf.date.getTime() - t0) / MS_PER_YEAR);
  const amounts = cashflows.map((cf) => cf.amountCents);

  function npv(rate: number) {
    return amounts.reduce(
      (sum, amt, i) => sum + amt / Math.pow(1 + rate, times[i]),
      0,
    );
  }
  function dnpv(rate: number) {
    return amounts.reduce(
      (sum, amt, i) => sum - (times[i] * amt) / Math.pow(1 + rate, times[i] + 1),
      0,
    );
  }

  let rate = guess;
  for (let i = 0; i < 200; i++) {
    const d = dnpv(rate);
    if (Math.abs(d) < 1e-14) break;
    const delta = npv(rate) / d;
    rate -= delta;
    if (Math.abs(delta) < 1e-8) break;
  }

  if (!isFinite(rate) || isNaN(rate) || rate <= -1) return null;
  return rate;
}

/** Calcula o total de juros recebidos (interestCents) de fluxos do tipo parcela. */
export function totalInterestCents(
  cashflows: { kind: string; interestCents?: number }[],
): number {
  return cashflows
    .filter((cf) => cf.kind === 'parcela')
    .reduce((s, cf) => s + (cf.interestCents ?? 0), 0);
}
