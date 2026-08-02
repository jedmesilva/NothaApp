/**
 * OfertaOverlayContext
 *
 * Superfície o overlay de oferta estilo Uber quando chega uma nova oferta.
 *
 * Estratégia de recebimento (duas camadas):
 *  1. SSE (primária) — conexão persistente em /api/investor/events.
 *     Latência ≈ 0 quando o app está aberto.
 *     Em caso de falha/queda, reconecta automaticamente em 5 s.
 *  2. Poll de fallback (60 s) — cobre o intervalo de reconexão SSE e
 *     o caso raro de evento perdido.
 *
 * Para app em background: Push Notification via Expo (ver usePushNotifications).
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInvestorOffers } from '@/hooks/useInvestorOffers';
import { useSSEOffers } from '@/lib/useSSEOffers';
import type { InvestorOffer } from '@/hooks/useInvestorOffers';

interface OfertaOverlayContextValue {
  activeOffer: InvestorOffer | null;
  dismiss: () => void;
}

const OfertaOverlayContext = createContext<OfertaOverlayContextValue>({
  activeOffer: null,
  dismiss: () => {},
});

export function useOfertaOverlay() {
  return useContext(OfertaOverlayContext);
}

export function OfertaOverlayProvider({ children }: { children: React.ReactNode }) {
  const seenIds   = useRef<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const [activeOffer, setActiveOffer] = useState<InvestorOffer | null>(null);

  // ── Fallback poll (60 s) ────────────────────────────────────────────────────
  // Cobre o gap de reconexão SSE e eventos ocasionalmente perdidos.
  const { data } = useInvestorOffers(60_000);

  // ── SSE primária ─────────────────────────────────────────────────────────────
  // Ao receber "offer_created", invalida a query para refetch imediato.
  useSSEOffers(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['investor-offers'] });
    }, [queryClient]),
    true, // sempre ativa enquanto o app estiver aberto
  );

  // ── Processa as ofertas chegadas (SSE → refetch → useEffect) ─────────────────
  useEffect(() => {
    if (!data?.offers) return;
    if (activeOffer) return; // já mostrando uma — não empilha

    const newOffer = data.offers.find(
      (o) => o.status === 'pending' && !seenIds.current.has(o.id),
    );
    if (newOffer) {
      seenIds.current.add(newOffer.id);
      setActiveOffer(newOffer);
    }
  }, [data, activeOffer]);

  const dismiss = useCallback(() => setActiveOffer(null), []);

  return (
    <OfertaOverlayContext.Provider value={{ activeOffer, dismiss }}>
      {children}
    </OfertaOverlayContext.Provider>
  );
}
