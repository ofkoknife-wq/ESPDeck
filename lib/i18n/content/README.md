# Locale content packs

User-facing copy is **never** special-cased by language at call sites.

## Rules

1. **English (`en`) is the fallback**, not Chinese.
2. **Every locale is a peer pack** under `content/{locale}/` (or `*-copy-{locale}.ts`).
3. Resolvers (`localize-lesson`, `localize-advanced`, `localize-info`, `callouts`, diagrams) pick `packs[locale]` then fall back to `en`.
4. Structural data (ids, icons, pin geometry, graph topology) stays language-neutral / English-canonical in `lib/lessons.ts`, `lib/advanced-lessons.ts`, etc.

## Add a language (e.g. `ja`)

1. Enable it in `lib/i18n/config.ts` (`LOCALE_META`).
2. Add message UI strings: `lib/i18n/messages/ja.ts` and register in `messages/index.ts`.
3. Add content packs as needed:
   - `content/ja/lessons.ts` + `content/ja/lesson-codes.ts`
   - `content/ja/callouts.ts`
   - `content/ja/diagrams.ts` (label overlays)
   - Advanced: extend `FILL_SPECS` / hand packs, or add `advanced-hand-ja.ts`
   - Info: `info-copy-ja.ts`
4. Register the pack in the matching `localize-*` / `content/*` resolver maps.

Missing keys fall back to English automatically via `resolveContentRecord`.
