/**
 * OfertaOverlayContext
 *
 * Polls /api/investor/offers every 20 s and surfaces the first unseen
 * pending offer so the global overlay can display it Uber-style.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useInvestorOffers } from '@/hooks/useInvestorOffers';
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
  const seenIds = useRef<Set<string>>(new Set());
  const [activeOffer, setActiveOffer] = useState<InvestorOffer | null>(null);

  // Poll every 20 s for new pending offers
  const { data } = useInvestorOffers(20_000);

  useEffect(() => {
    if (!data?.offers) return;
    // Already showing one — don't stack
    if (activeOffer) return;

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
