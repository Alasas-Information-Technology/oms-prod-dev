# RASIKH OMS — Design System Color Scheme Rewrite

> Scope note: this replaces **Section 2.1, 2.2, and the color references in 6.3** of the original DIEZ OMS spec. Sections 1, 3, 4, 5, 7, 8, 9 (layout, money formatting, T1–T11 structural rules, security, component registry, accessibility) are unaffected by this rewrite — they reference tokens by name, not by hex, so they continue to work unchanged once these tokens are swapped in `app/globals.css`.

---

## 2.1 Color Palette (rewritten)

### Core Brand & Base Palette

| Token | Light Value | Dark Value | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#FAF8F3` | `#0E0D0B` | Root page background (warm sand, replaces cool slate) |
| `--background-secondary` | `#F1ECE1` | `#181510` | Secondary background, panel strips |
| `--background-tertiary` | `#EAE3D6` | `#211D16` | Embedded container backgrounds |
| `--foreground` | `#1A1712` | `#F7F5F0` | Primary high-contrast text |
| `--foreground-secondary` | `#544D3F` | `#C9C2B3` | Secondary body text, descriptions |
| `--foreground-tertiary` | `#7C7362` | `#948C7A` | Supporting labels, muted captions |
| `--card` | `#FFFFFF` | `#191712` | Card surfaces |
| `--card-foreground` | `#1A1712` | `#F7F5F0` | Card primary text |
| `--primary` | `#1B2A4A` (Bedrock Indigo) | `#7C8FC4` | Primary brand accent, primary CTA |
| `--primary-foreground` | `#FFFFFF` | `#0E0D0B` | Text on primary elements |
| `--secondary` | `#0E1830` (Bedrock Deep) | `#42A5F5`→`#5A7BB8` | Secondary brand actions, navigation active states |
| `--brand-teal` | `#0E5C52` | `#3FA394` | **Now the system's cyan role** — vendor-portal branding, verified checkmarks, info accents |
| `--border` | `#E6DFD0` | `#2A2620` | Subtle dividers, container borders |
| `--input` | `#F8F4EC` | `#1C1912` | Input field surface |
| `--ring` | `#1B2A4A` | `#7C8FC4` | Focus rings (3:1 contrast minimum) |
| `--root-bronze` | `#A65A2E` | `#D3894F` | Signature accent — milestone/attention moments on operational screens; primary interactive accent on dashboard-mode screens per the two-mode rule established separately |

**Why teal, not a literal cyan hex**: per the brand system, RASIKH doesn't use a raw saturated cyan (`#00BCD4`-family) — that reads as generic SaaS. `#0E5C52` carries the same "cyan role" (info, verified, vendor-portal identity) that the old `#34BCB2` DIEZ Teal held, but pulled into the grounded, slightly muted register the rest of the palette lives in, so it doesn't vibrate against the warm neutrals the way a bright cyan would.

### Semantic Matrix (15-Token System, rewritten)

| Semantic Meaning | Surface Token | Border Token | Text Token | Typical Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Accent** | `--accent-surface` (`#EEF1FB` / `#1E2540`) | `--accent-border` (`#3E4E8C` / `#7C8FC4`) | `--accent-text` (`#1B2A4A` / `#C7D2FE`) | Selections, active stages, focus states |
| **Success** | `--success-surface` (`#EBF5EE` / `#12271F`) | `--success-border` (`#3A8F6B` / `#5FC79A`) | `--success-text` (`#1E5C42` / `#A7E8C7`) | Confirmed interviews, approved budgets |
| **Warning** | `--warning-surface` (`#FBF2E3` / `#2E2416`) | `--warning-border` (`#B4791F` / `#E0A94A`) | `--warning-text` (`#7A4E0C` / `#F5D89A`) | Tight deadlines (<2 days), pending review |
| **Danger** | `--danger-surface` (`#FBEDEA` / `#2E1B18`) | `--danger-border` (`#B0432C` / `#E8795C`) | `--danger-text` (`#7A2818` / `#F5B8A5`) | Urgent deadline (<24h), over-budget, errors |
| **Info** | `--info-surface` (`#EEF5F4` / `#132320`) | `--info-border` (`#256C61` / `#4CA694`) | `--info-text` (`#123F38` / `#A9DAD0`) | System notices, automated recommendations — now built on the teal/cyan family instead of sky-blue, so Info and vendor-portal branding read as one consistent hue rather than two unrelated blues |

### Candidate Identity Palette (Interview Planning, rewritten)

| Name | Value |
|---|---|
| Violet | `#7C6BC4` |
| Teal | `#0E7A6E` *(kept distinct from `--brand-teal` so candidate tags don't get mistaken for vendor-portal chrome)* |
| Bronze | `#A65A2E` *(reused signature — only for a candidate specifically flagged long-tenure/rehire; not a default rotation color)* |
| Rose | `#C4586A` |
| Sky | `#2F6FA8` |
| Olive | `#7A8A3D` |

Rule unchanged: left borders (3px), avatar backgrounds, soft tints (8% light / 12% dark) only — never full solid fills behind body copy, always paired with the candidate reference code.

---

## 2.2 Surface Elevation & Dark Mode Physics (rewritten)

Same physics as the original spec — dark mode is a redesign at lower luminance, not an inversion — rebuilt on warm-black instead of blue-black:

```
Elevation 3: Popover / Modal     (--surface-popover)    [#2A2219]
Elevation 2: Floating Card       (--surface-elevated)   [#201A14]
Elevation 1: Base Card           (--surface-card)       [#171310]
Elevation 0: Canvas Background   (--surface-base)       [#0E0D0B]
```

- **Luminance steps**: unchanged — each step ~4% lighter than the last.
- **Shadow elimination on dark**: unchanged rule, borders now use warm 14% opacity (`rgba(230,223,208,0.14)`) instead of cool slate.
- **Hatch opacity**: unchanged (18% light / 24% dark), pattern fills use `currentColor` so they inherit whichever token they're drawn on automatically — no hatch-specific hex to update.
- **Vibration prevention**: unchanged rule. Applied here specifically to `--danger-border` and `--success-border`, both already desaturated ~20% / lightened ~10% from their light-mode values in the table above.

---

## 6.3 Expiry Tracking Engine (color mapping only)

| State | Old | New |
|---|---|---|
| Critical (expired / < 30 days) | Critical Red | `--danger-border` / `--danger-text` |
| Warning (< 90 days) | Warning Amber | `--warning-border` / `--warning-text` |
| Normal (> 90 days) | Normal Green | `--success-border` / `--success-text` |

No structural change to the expiry-tracking logic itself — only the token source.

---

## Implementation note

All of the above are drop-in replacements in `app/globals.css` by token name — nothing downstream (T1–T11 widgets, the `<Amount>` component, `AttachmentList`, security-boundary components) needs to change its own code, since they all reference these tokens rather than hardcoded hex. If an audit turns up a component with a hardcoded hex matching any old value above (`#5B5FE1`, `#34BCB2`, `#0284C7`, etc.), that's a bug to fix as part of this rewrite, not a case to leave alone — same rule as the primitive-consolidation audit from the earlier Claude Code prompts.
