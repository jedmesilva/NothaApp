import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

export type Area = 'credito' | 'investir';

interface AreaContextValue {
  area: Area;
  setArea: (area: Area) => void;
  /** Registrado pelo index.tsx para animar o scroll ao trocar de área pelo toggle */
  registerScrollTo: (fn: (a: Area) => void) => void;
  /** Chamado pelo GlobalHeader ao clicar no toggle */
  scrollToArea: (a: Area) => void;
}

const AreaContext = createContext<AreaContextValue>({
  area: 'credito',
  setArea: () => {},
  registerScrollTo: () => {},
  scrollToArea: () => {},
});

export function AreaProvider({ children }: { children: React.ReactNode }) {
  const [area, setArea] = useState<Area>('credito');
  const scrollFnRef = useRef<((a: Area) => void) | null>(null);

  const registerScrollTo = useCallback((fn: (a: Area) => void) => {
    scrollFnRef.current = fn;
  }, []);

  const scrollToArea = useCallback((a: Area) => {
    setArea(a);
    scrollFnRef.current?.(a);
  }, []);

  return (
    <AreaContext.Provider value={{ area, setArea, registerScrollTo, scrollToArea }}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  return useContext(AreaContext);
}
