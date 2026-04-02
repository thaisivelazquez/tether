/**
 * Design tokens (plan Section 5). Colours sampled from `assets/figma` PNGs — see comments.
 * Do not hardcode colours outside this file (plan Section 11).
 *
 * Gradients: use `expo-linear-gradient` with `backgroundGradients.*` at the root layout
 * so the gradient applies globally across tab screens (plan Section 5).
 * Default prototype gradient: `activeGradient` → sunset (plan Section 5).
 */

export const backgroundGradients = {
  /** palette-daytime.png — top-centre vs bottom-centre */
  daytime: ['#f7dab3', '#f3d4ae'],
  /** palette-sunset.png — top-centre vs bottom-centre */
  sunset: ['#d7cff6', '#eae3e7'],
  /** palette-night.png — top-centre vs bottom-centre */
  night: ['#101760', '#12185b'],
} as const;

export const tokens = {
  /** Primary text — homepage-default.png header “what’s everyone up to…” (#000000 @ ~12%,14%) */
  text: '#000000',
  /** Muted text — sidequest-card.png description line (#b2b2b2 @ centre) */
  textSecondary: '#b2b2b2',
  /** Card / sheet surface — homepage-default.png feed card area (#fafafa) */
  surface: '#fafafa',
  /** Lavender — FAB glow homepage scan (#dfd9f4 @ ~196,802); CTA sidequest-view (#ccc2ed mid-bottom). Single shared accent. */
  accent: '#d2c8e9',
  /** Card stroke — homepage-default.png card edge (#d9d9d9) */
  border: '#d9d9d9',
  /** View Sidequest modal only — sidequest-view.png sheet (#fcf6c9); do not use as general surface (plan Section 11). */
  modalBackground: '#fcf6c9',
  /** Text on destructive / high-contrast buttons */
  onDanger: '#ffffff',
  /** Destructive button background (Cancel Sidequest) */
  dangerBackground: '#c45c5c',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  heading: { fontSize: 22, fontWeight: '700' as const },
  subheading: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
} as const;

/** Default gradient for the prototype (plan Section 5). */
export const activeGradient = backgroundGradients.sunset;

/**
 * SidequestCard — sampled from sidequest-card.png (plan Section 8).
 * Use only these for feed cards; do not use `tokens.surface` for card fill.
 */
export const sidequestCard = {
  background: 'rgba(92, 92, 92, 0.78)',
  borderColor: '#d9d9d9',
  borderWidth: 1,
  borderRadius: 14,
  /** Title row — light text */
  titleColor: '#f7f7f7',
  /** Muted description line */
  mutedColor: '#b2b2b2',
} as const;
