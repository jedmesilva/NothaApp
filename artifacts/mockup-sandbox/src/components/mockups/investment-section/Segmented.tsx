import './_group.css';
import { useState } from 'react';

// ── Theme tokens ─────────────────────────────────────────────────────────────
const C = {
  ink:      '#15151D',
  inkSoft:  '#6C707A',
  inkFaint: '#A2A6AF',
  line:     '#EBEBF0',
  dark:     '#15151D',
  bg:       '#F4F5F7',
  card:     '#FFFFFF',
};

const MIN_CENTS = 25000;   // R$ 250,00
const MAX_CENTS = 100000;  // R$ 1.000,00
const RATE_PCT  = 12.50;
const TERM_DAYS = 30;

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Segmented() {
  const [valueCents, setValueCents] = useState(MAX_CENTS);

  const valorR$   = valueCents / 100;
  const retorno   = Math.round(valorR$ * (RATE_PCT / 100));
  const totalR$   = valorR$ + retorno;
  
  const segments = [
    { pct: 25, value: 25000 },
    { pct: 50, value: 50000 },
    { pct: 75, value: 75000 },
    { pct: 100, value: 100000 },
  ];

  return (
    <div className="min-h-screen flex items-start justify-center pt-10"
         style={{ background: C.bg, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 350, background: C.card, borderRadius: 22, padding: '0 20px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {/* Divider */}
        <div style={{ height: 1, background: C.line, marginBottom: 18 }} />

        {/* 3-column metrics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          {[
            { label: 'Investimento', value: `R$ ${formatBRL(valueCents)}` },
            { label: 'Retorno',      value: `R$ ${formatBRL(totalR$ * 100)}` },
            { label: 'Prazo',        value: `${TERM_DAYS} dias` },
          ].map(({ label, value }, i) => (
            <div key={label} style={{ textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2px', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 17, color: C.ink, letterSpacing: '-0.3px' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Segmented Control */}
        <div style={{ 
          display: 'flex', 
          width: 310, 
          height: 52, 
          borderRadius: 12, 
          overflow: 'hidden', 
          background: C.line 
        }}>
          {segments.map((seg) => {
            const isActive = valueCents === seg.value;
            return (
              <button
                key={seg.pct}
                onClick={() => setValueCents(seg.value)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? C.dark : 'transparent',
                  color: isActive ? '#FFFFFF' : C.inkFaint,
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 150ms ease, color 150ms ease'
                }}
              >
                <div style={{ 
                  fontFamily: '"Space Grotesk", sans-serif', 
                  fontWeight: 700, 
                  fontSize: 15, 
                  lineHeight: 1.2
                }}>
                  {seg.pct}%
                </div>
                <div style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontWeight: 500, 
                  fontSize: 10,
                  opacity: isActive ? 0.9 : 1,
                  marginTop: 1
                }}>
                  R$ {(seg.value / 100).toLocaleString('pt-BR')}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
