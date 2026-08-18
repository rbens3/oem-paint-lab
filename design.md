# Design — OEM Paint Lab

A locked design system for the application. The selected paint is functional
content and the primary chromatic surface; surrounding UI remains neutral,
technical, and restrained.

## Genre

Modern-minimal with an automotive precision-instrument register.

## Macrostructure family

- App pages: Workbench — dominant functional surface, compact controls, measured readouts.
- Archive pages: Workbench catalogue — large paint fields, minimal containment, direct actions.
- Content pages: Workbench document — technical flow first, prose and caveats second.

## Theme

- `--color-paper`: `oklch(97.5% 0.006 250)`
- `--color-paper-2`: `oklch(94.5% 0.009 250)`
- `--color-paper-3`: `oklch(91% 0.012 250)`
- `--color-ink`: `oklch(17% 0.014 258)`
- `--color-ink-2`: `oklch(29% 0.016 258)`
- `--color-rule`: `oklch(84% 0.012 250)`
- `--color-accent`: selected paint at runtime; cobalt is the fallback signal.
- `--color-focus`: `oklch(54% 0.2 256)`

## Typography

- Display: Unbounded 800/900, roman — major page headings and prominent paint names only.
- Body/interface: Lexend 400/500/600 — navigation, prose, secondary headings, buttons, and supporting paint information.
- Technical: IBM Plex Mono 400/500/600 — HEX/RGB/HSB values, codes, compact labels, statuses.
- Display tracking: `-0.045em`; technical labels: `0.04em–0.08em`.
- Five-size scale from `--text-xs` through `--text-display`; hierarchy also uses weight and spacing.

## Spacing

The 4-point named scale in `tokens.css` is mandatory. Mobile is intentionally
dense; larger breakpoints restore broader workbench spacing.

## Motion

- One restrained load reveal and 1 px press/hover feedback.
- Copy confirmation changes the button label in place; no toast.
- Reduced motion removes spatial animation.

## Microinteractions stance

- Keyboard focus is immediate and visible.
- Hover never carries functionality by itself.
- Touch targets remain at least 44 px even when controls look visually compact.
- Search, filtering, selection, copy, and command-palette behavior remain direct and quiet.

## CTA voice

- Primary actions are neutral text or graphite controls, never promotional pills.
- Secondary actions use transparent surfaces and thin rules.
- Labels name the operation: “Copy HEX”, “Analyze paint”, “Open in Lab”.

## Per-page allowances

- Lab: one large selected-paint field and one graphite Finish Lab band.
- Library: paint surfaces dominate; metadata and actions stay subordinate.
- Paint detail: one record-led workbench with a dominant paint field, compact
  instrument readouts, explicit provenance, and related-record rows.
- Compare: two equal paint fields dominate; Delta E is the primary numerical figure.
- Methodology: calculation flow and sequential method rows; no corporate feature cards.
- No imagery enrichment. Function and color are the visual content.

## What pages MUST share

- Header, command search, mobile navigation, and inline footer.
- Off-white/graphite surfaces and runtime selected-paint signal.
- Display/body/technical type roles.
- Thin-rule language, compact radii, named spacing, focus treatment, and motion restraint.

## What pages MAY differ on

- Paint-field scale and aspect ratio.
- Whether the supporting section is light, paper-tinted, or graphite.
- Density of technical readouts appropriate to the task.
- Progressive filter disclosure and record-level provenance depth.

## Exports

`tokens.css` is the implementation source of truth. The following portable
translations mirror its core roles.

### tokens.css

```css
:root {
  --color-paper: oklch(97.5% 0.006 250);
  --color-paper-2: oklch(94.5% 0.009 250);
  --color-paper-3: oklch(91% 0.012 250);
  --color-ink: oklch(17% 0.014 258);
  --color-ink-2: oklch(29% 0.016 258);
  --color-rule: oklch(84% 0.012 250);
  --color-rule-strong: oklch(68% 0.018 250);
  --color-muted: oklch(38% 0.013 258);
  --color-neutral: oklch(44% 0.014 258);
  --color-accent: oklch(55% 0.2 256);
  --color-accent-ink: oklch(98% 0.005 250);
  --color-focus: oklch(54% 0.2 256);

  --font-display: "Unbounded", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Lexend", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", monospace;

  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 9rem;

  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(97.5% 0.006 250);
  --color-paper-2: oklch(94.5% 0.009 250);
  --color-paper-3: oklch(91% 0.012 250);
  --color-ink: oklch(17% 0.014 258);
  --color-ink-2: oklch(29% 0.016 258);
  --color-rule: oklch(84% 0.012 250);
  --color-accent: oklch(55% 0.2 256);
  --color-focus: oklch(54% 0.2 256);
  --font-display: "Unbounded", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Lexend", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(97.5% 0.006 250)", "$type": "color" },
    "ink": { "$value": "oklch(17% 0.014 258)", "$type": "color" },
    "accent": { "$value": "oklch(55% 0.2 256)", "$type": "color" },
    "focus": { "$value": "oklch(54% 0.2 256)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Unbounded, ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Lexend, ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" },
    "mono": { "$value": "IBM Plex Mono, monospace", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2.5rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 97.5% 0.006 250;
  --foreground: 17% 0.014 258;
  --card: 94.5% 0.009 250;
  --card-foreground: 17% 0.014 258;
  --primary: 55% 0.2 256;
  --primary-foreground: 98% 0.005 250;
  --secondary: 91% 0.012 250;
  --secondary-foreground: 29% 0.016 258;
  --muted: 84% 0.012 250;
  --muted-foreground: 38% 0.013 258;
  --border: 84% 0.012 250;
  --input: 84% 0.012 250;
  --ring: 54% 0.2 256;
  --radius: 0.375rem;
}
```
