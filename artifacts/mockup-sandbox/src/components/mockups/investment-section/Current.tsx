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

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Current() {
  const [valueCents, setValueCents] = useState(MAX_CENTS);

  const valorR$   = valueCents / 100;
  const retorno   = Math.round(valorR$ * (RATE_PCT / 100));
  const totalR$   = valorR$ + retorno;
  const fillPct   = ((valueCents - MIN_CENTS) / (MAX_CENTS - MIN_CENTS)) * 100;
  const thumbPct  = fillPct;

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

        {/* Slider */}
        <div style={{ position: 'relative', height: 48, display: 'flex', alignItems: 'center' }}>
          {/* Track background */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: 6, background: C.line, borderRadius: 3 }}>
            {/* Fill */}
            <div style={{ height: '100%', width: `${fillPct}%`, background: C.dark, borderRadius: 3, transition: 'width 80ms' }} />
          </div>
          {/* Thumb */}
          <div style={{
            position: 'absolute',
            left: `calc(${thumbPct}% - 16px)`,
            width: 32, height: 32,
            borderRadius: '50%',
            background: C.dark,
            border: '4px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            transition: 'left 80ms',
            pointerEvents: 'none',
          }} />
          {/* Invisible range input for interaction */}
          <input
            type="range"
            className="notha-slider"
            min={MIN_CENTS} max={MAX_CENTS} step={100}
            value={valueCents}
            onChange={e => setValueCents(Number(e.target.value))}
          />
        </div>

        {/* Min / Max labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontSize: 11, color: C.inkFaint }}>R$ {formatBRL(MIN_CENTS)}</span>
          <span style={{ fontSize: 11, color: C.inkFaint }}>R$ {formatBRL(MAX_CENTS)}</span>
        </div>
      </div>
    </div>
  );
}
