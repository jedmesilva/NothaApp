import './_group.css';
import { useState, useRef, useEffect } from 'react';

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

const MIN_CENTS = 25000;
const MAX_CENTS = 100000;
const RATE_PCT  = 12.50;
const TERM_DAYS = 30;

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function InputDireto() {
  const [valueCents, setValueCents] = useState(MAX_CENTS);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const valorR$ = valueCents / 100;
  const retorno = Math.round(valorR$ * (RATE_PCT / 100));
  const totalR$ = valorR$ + retorno;
  const fillPct = ((valueCents - MIN_CENTS) / (MAX_CENTS - MIN_CENTS)) * 100;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleComplete = () => {
    let num = parseFloat(inputValue);
    if (isNaN(num)) num = valueCents / 100;
    let cents = num * 100;
    cents = Math.max(MIN_CENTS, Math.min(MAX_CENTS, cents));
    cents = Math.round(cents / 100) * 100; // snap to nearest 100 cents
    setValueCents(cents);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleComplete();
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-10"
         style={{ background: C.bg, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .hide-spinners::-webkit-inner-spin-button,
        .hide-spinners::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-spinners {
          -moz-appearance: textfield;
        }
      `}</style>
      <div style={{ width: 350, background: C.card, borderRadius: 22, padding: '0 20px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        {/* Divider */}
        <div style={{ height: 1, background: C.line, marginBottom: 18 }} />

        {/* 3-column metrics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          
          {/* Left: Investimento */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2px', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 }}>
              Investimento
            </div>
            
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 17, color: C.inkFaint, marginRight: 4 }}>
                  R$
                </span>
                <input
                  ref={inputRef}
                  type="number"
                  className="hide-spinners"
                  min={250} max={1000} step={1}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onBlur={handleComplete}
                  onKeyDown={handleKeyDown}
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: 34,
                    color: C.ink,
                    letterSpacing: '-0.3px',
                    border: 'none',
                    borderBottom: `2px solid ${C.inkSoft}`,
                    outline: 'none',
                    background: 'transparent',
                    width: 80,
                    padding: 0,
                    margin: 0,
                  }}
                />
              </div>
            ) : (
              <div 
                onClick={() => { setIsEditing(true); setInputValue((valueCents/100).toString()); }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', color: C.ink }}
              >
                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 17, color: C.inkFaint, marginRight: 4 }}>
                  R$
                </span>
                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 34, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  {formatBRL(valueCents).replace(',00', '')}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, color: C.inkFaint, flexShrink: 0 }}>
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </div>
            )}
          </div>

          {/* Center: Retorno */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2px', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 }}>
              Retorno
            </div>
            <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 17, color: C.ink, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              R$ {formatBRL(totalR$ * 100)}
            </div>
          </div>

          {/* Right: Prazo */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2px', color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 }}>
              Prazo
            </div>
            <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 17, color: C.ink, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              {TERM_DAYS} dias
            </div>
          </div>
        </div>

        {/* Ambient progress line */}
        <div style={{ margin: '0 -20px', height: 2, background: C.line, position: 'relative' }}>
           <div style={{ height: '100%', width: `${fillPct}%`, background: C.dark, transition: 'width 300ms ease-out' }} />
        </div>
      </div>
    </div>
  );
}
