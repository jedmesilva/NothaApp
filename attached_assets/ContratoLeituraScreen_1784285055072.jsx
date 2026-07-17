import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';

// Mesma paleta monocromática das outras telas — preto, cinza e branco, sem cor de destaque
const colors = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  darkSoft: '#26262F',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipBg: '#F4F5F7',
};

const styles = {
  // Mesmo padrão de container das outras telas — rolagem é da própria página,
  // não de um container interno, para o CTA fixo se comportar igual em todo o app
  screen: {
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
    backgroundColor: colors.bg,
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: colors.ink,
    paddingBottom: 110,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '22px 20px 4px',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: -0.2,
  },
  subtitle: {
    padding: '6px 20px 14px',
    fontSize: 13,
    color: colors.inkSoft,
  },

  // Barra de progresso de leitura — fixa logo abaixo do header, acompanha o
  // scroll da página inteira
  progressTrack: {
    position: 'sticky',
    top: 0,
    height: 3,
    backgroundColor: colors.line,
    zIndex: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.dark,
    transition: 'width 0.1s linear',
  },

  content: {
    padding: '4px 20px 24px',
  },
  clauseBlock: {
    marginBottom: 22,
  },
  clauseTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13.5,
    fontWeight: 700,
    color: colors.ink,
    marginBottom: 6,
  },
  clauseBody: {
    fontSize: 13.5,
    lineHeight: 1.65,
    color: colors.inkSoft,
  },
  endMarker: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.inkFaint,
    padding: '8px 0 4px',
  },

  // CTA fixo — mesmo padrão de todas as outras telas do app. Sem checkbox: o
  // próprio botão fica bloqueado até o fim da leitura, e um toque nele já
  // aceita e confirma o empréstimo
  ctaBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 420,
    padding: '14px 16px calc(18px + env(safe-area-inset-bottom))',
    backgroundColor: colors.bg,
    borderTop: `1px solid ${colors.line}`,
  },
  ctaButton: {
    width: '100%',
    padding: '17px 0',
    borderRadius: 16,
    backgroundColor: colors.dark,
    color: '#fff',
    fontSize: 15.5,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 0.1,
  },
  ctaButtonDisabled: {
    backgroundColor: colors.line,
    color: colors.inkFaint,
    cursor: 'not-allowed',
  },
  ctaHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 9,
  },
};

// Contrato completo, estruturado em cláusulas — mesmo conteúdo de exemplo da
// prévia na tela de confirmação, agora por extenso e com títulos de seção
const CLAUSULAS = [
  {
    titulo: '1. Objeto',
    texto:
      'Este instrumento formaliza o empréstimo entre o tomador identificado nesta plataforma e o(s) credor(es) que fizerem o aporte do valor solicitado, nas condições descritas no resumo apresentado na tela de confirmação, que é parte integrante deste contrato.',
  },
  {
    titulo: '2. Desembolso e pagamento',
    texto:
      'O valor líquido será depositado na conta cadastrada em até 1 dia útil após a confirmação. As parcelas serão descontadas automaticamente na frequência escolhida, na data de vencimento de cada uma, da conta indicada pelo tomador no momento da contratação.',
  },
  {
    titulo: '3. Atraso e inadimplência',
    texto:
      'Em caso de atraso, incidem multa de 2% sobre a parcela em aberto e juros de mora de 1% ao mês, calculados a partir do 1º dia após o vencimento. A permanência do atraso por período superior a 30 dias poderá resultar em inclusão do nome do tomador em cadastros de proteção ao crédito, conforme legislação vigente.',
  },
  {
    titulo: '4. Quitação antecipada',
    texto:
      'A quitação antecipada, total ou parcial, é permitida a qualquer momento, com desconto proporcional dos juros sobre o período não utilizado, sem incidência de multa ou tarifa adicional para essa finalidade.',
  },
  {
    titulo: '5. Papel da plataforma',
    texto:
      'O tomador declara estar ciente de que a plataforma atua apenas como intermediária entre tomadores e credores, não sendo parte na relação de crédito em si, e que o contrato aqui aceito tem validade jurídica plena entre as partes envolvidas.',
  },
  {
    titulo: '6. Validade da assinatura eletrônica',
    texto:
      'O tomador reconhece a validade e eficácia do aceite eletrônico realizado nesta tela como forma de manifestação de vontade, dispensando a assinatura física, nos termos da legislação aplicável a documentos eletrônicos.',
  },
  {
    titulo: '7. Foro',
    texto:
      'Fica eleito o foro da comarca de domicílio do tomador para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
  },
];

// Distância (em px) até o fim do scroll a partir da qual já consideramos que o
// usuário "chegou ao final" — evita exigir precisão de pixel no gesto de rolagem
const THRESHOLD_FIM_PX = 24;

export default function ContratoLeituraScreen() {
  const [progresso, setProgresso] = useState(0);
  const [chegouAoFim, setChegouAoFim] = useState(false);

  // Mede o scroll da página inteira (não de um container interno), igual ao
  // resto do app — o CTA fixo funciona do mesmo jeito em todas as telas
  const handleScroll = useCallback(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable <= 0 ? 100 : Math.min(100, (window.scrollY / scrollable) * 100);
    setProgresso(pct);
    if (scrollable <= 0 || window.scrollY >= scrollable - THRESHOLD_FIM_PX) {
      setChegouAoFim(true);
    }
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div style={styles.screen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
        </button>
        <div style={styles.title}>Contrato de empréstimo</div>
      </div>
      <div style={styles.subtitle}>
        {chegouAoFim ? 'Você chegou ao final do contrato.' : 'Role até o final para liberar o aceite.'}
      </div>

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progresso}%` }} />
      </div>

      <div style={styles.content}>
        {CLAUSULAS.map((clausula) => (
          <div key={clausula.titulo} style={styles.clauseBlock}>
            <div style={styles.clauseTitle}>{clausula.titulo}</div>
            <div style={styles.clauseBody}>{clausula.texto}</div>
          </div>
        ))}
        <div style={styles.endMarker}>— fim do contrato —</div>
      </div>

      <div style={styles.ctaBar}>
        <button
          style={{
            ...styles.ctaButton,
            ...(chegouAoFim ? {} : styles.ctaButtonDisabled),
          }}
          disabled={!chegouAoFim}
        >
          Aceitar e confirmar empréstimo
        </button>
        {!chegouAoFim && (
          <div style={styles.ctaHint}>Role até o final do contrato para continuar</div>
        )}
      </div>
    </div>
  );
}
