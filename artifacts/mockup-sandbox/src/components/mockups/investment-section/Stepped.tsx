import './_group.css';
import { useState } from 'react';

// ── Theme tokens (from artifacts/mobile/constants/theme.ts) ─────────────────
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
const STEP_CENTS = 2500;   // step size as requested

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Stepped() {
  const [valueCents, setValueCents] = useState(MAX_CENTS);

  const valorR$   = valueCents / 100;
  const retorno   = Math.round(valorR$ * (RATE_PCT / 100));
  const totalR$   = valorR$ + retorno;
  const fillPct   = ((valueCents - MIN_CENTS) / (MAX_CENTS - MIN_CENTS)) * 100;

  const handleStep = (direction: 'up' | 'down') => {
    setValueCents(prev => {
      const next = direction === 'up' ? prev + STEP_CENTS : prev - STEP_CENTS;
      return Math.min(Math.max(next, MIN_CENTS), MAX_CENTS);
    });
  };

  const presets = [
    { label: 'Mín', value: 25000 },
    { label: 'R$ 500', value: 50000 },
    { label: 'R$ 750', value: 75000 },
    { label: 'Máx', value: 100000 },
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

        {/* Preset Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          {presets.map(preset => {
            const isActive = valueCents === preset.value;
            return (
              <button
                key={preset.label}
                onClick={() => setValueCents(preset.value)}
                style={{
                  background: isActive ? C.ink : C.line,
                  color: isActive ? '#FFFFFF' : C.inkFaint,
                  borderRadius: 999,
                  padding: '7px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Stepper Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button 
            onClick={() => handleStep('down')}
            disabled={valueCents <= MIN_CENTS}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: C.line, 
              border: 'none', cursor: valueCents <= MIN_CENTS ? 'not-allowed' : 'pointer',
              fontSize: 22, fontWeight: 'bold', color: C.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: valueCents <= MIN_CENTS ? 0.5 : 1,
              outline: 'none', padding: 0
            }}
          >
            &minus;
          </button>
          
          <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
            R$ 250,00 por passo
          </div>

          <button 
            onClick={() => handleStep('up')}
            disabled={valueCents >= MAX_CENTS}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: C.line, 
              border: 'none', cursor: valueCents >= MAX_CENTS ? 'not-allowed' : 'pointer',
              fontSize: 22, fontWeight: 'bold', color: C.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: valueCents >= MAX_CENTS ? 0.5 : 1,
              outline: 'none', padding: 0
            }}
          >
            +
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 3, background: C.line, borderRadius: 2, marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${fillPct}%`, background: C.ink, borderRadius: 2, transition: 'width 200ms ease-out' }} />
        </div>

        {/* Min / Max labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: C.inkFaint }}>R$ {formatBRL(MIN_CENTS)}</span>
          <span style={{ fontSize: 11, color: C.inkFaint }}>R$ {formatBRL(MAX_CENTS)}</span>
        </div>
      </div>
    </div>
  );
}
