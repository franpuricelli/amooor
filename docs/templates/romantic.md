# Template: `romantic`

**The base** — warm and soft, the Puri & Ivi look. It's the default: with no
`theme.template` (or `template: "romantic"`), the site renders like this.

- **id:** `romantic` · **vibe:** `romantic` · default (`DEFAULT_TEMPLATE_ID`)
- **CSS:** none of its own — it's the `:root` + base rules in `app/globals.css`
  (`[data-template="romantic"]` needs no block).
- **Canvas:** the palette the user picks (rosa/durazno/lavanda/menta/cielo, or a
  custom one). This is the only template that responds to the palette.
- **Typography:** Inter (sans) · Caveat (script) · Fraunces (serif display).
- **Feel:** glass panels with blur, pill buttons (999px radius), floating hearts
  + heart cursor, pink gradient background.

Since it's the base, the palette picker is its main axis of customization; the
other templates bring their own fixed color.
