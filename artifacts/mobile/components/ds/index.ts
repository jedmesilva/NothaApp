/**
 * notha design system — barrel export.
 *
 * Import from here: `import { DarkCard, StatusBadge, PoolBar } from '@/components/ds'`
 */

export { DarkCard, LightCard, ListCard } from './Card';
export { StatusBadge } from './Badge';
export type { LoanStatus } from './Badge';
export { PoolBar, PoolLegend, ThinBar } from './ProgressBar';
export type { PoolSegment } from './ProgressBar';
export { PrimaryButton, DarkButton, GhostButton, ActionButton, ActionRow } from './Button';
export { DetailGrid } from './DetailGrid';
export type { DetailItem } from './DetailGrid';
export { BackButton } from './BackButton';
export { ModalSheet } from './ModalSheet';
export { Chip } from './Chip';
export { SplitRow } from './SplitRow';
export type { SplitCol } from './SplitRow';
export {
  Eyebrow,
  BigValue,
  SectionTitle,
  PageTitle,
  ScreenTitle,
  BodyText,
} from './Typography';
export { ContaCard } from './ContaCard';
export type { ContaCardVariant, ContaCardProps } from './ContaCard';
export { InstallmentBadge } from './InstallmentBadge';
export type { InstallmentBadgeVariant } from './InstallmentBadge';
