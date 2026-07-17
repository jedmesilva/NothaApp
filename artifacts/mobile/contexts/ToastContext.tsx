import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastConfig = {
  title: string;
  subtitle?: string;
  /** Rótulo do botão de ação (opcional) */
  actionLabel?: string;
  onAction?: () => void;
  /** Duração em ms antes de fechar automaticamente (padrão: 6000) */
  duration?: number;
};

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// Estado interno exposto para o GlobalToast renderizar
export type ToastState = (ToastConfig & { id: number }) | null;

interface ToastProviderProps {
  children: React.ReactNode;
  onToast: (toast: ToastState) => void;
}

/** Provedor interno — usado apenas pelo RootLayout para conectar contexto + UI */
export function ToastProvider({ children, onToast }: ToastProviderProps) {
  const idRef = useRef(0);

  const showToast = useCallback((config: ToastConfig) => {
    idRef.current += 1;
    onToast({ ...config, id: idRef.current });
  }, [onToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}
