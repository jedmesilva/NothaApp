import React, { createContext, useContext, useState } from 'react';

type ContaModalContextValue = {
  visible: boolean;
  openConta: () => void;
  closeConta: () => void;
};

const ContaModalContext = createContext<ContaModalContextValue>({
  visible: false,
  openConta: () => {},
  closeConta: () => {},
});

export function useContaModal() {
  return useContext(ContaModalContext);
}

export function ContaModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <ContaModalContext.Provider
      value={{ visible, openConta: () => setVisible(true), closeConta: () => setVisible(false) }}
    >
      {children}
    </ContaModalContext.Provider>
  );
}
