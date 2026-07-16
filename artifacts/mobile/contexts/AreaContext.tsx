import React, { createContext, useContext, useState } from 'react';

export type Area = 'credito' | 'investir';

interface AreaContextValue {
  area: Area;
  setArea: (area: Area) => void;
}

const AreaContext = createContext<AreaContextValue>({
  area: 'credito',
  setArea: () => {},
});

export function AreaProvider({ children }: { children: React.ReactNode }) {
  const [area, setArea] = useState<Area>('credito');
  return (
    <AreaContext.Provider value={{ area, setArea }}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  return useContext(AreaContext);
}
