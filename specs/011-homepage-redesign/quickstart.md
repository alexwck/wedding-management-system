# Quickstart: Homepage Redesign for Mobile Conversion

**Feature**: specs/011-homepage-redesign | **Date**: 2026-04-26

## Development Setup

No new dependencies to install. All changes use the existing stack.

```bash
# Ensure you're on the feature branch
git checkout 011-homepage-redesign

# Start dev server
npm run dev

# In another terminal, start Supabase
supabase start

# Reset DB with new migrations
supabase db reset
```

## Key Files

| Purpose | Path |
|---------|------|
| Design system CSS | `src/app/globals.css` |
| Glassmorphism primitives | `src/components/glassmorphism/` |
| Bento grid primitives | `src/components/bento/` |
| Layout presets | `src/components/layout-presets/` |
| Theme utilities | `src/lib/design-system/theme.ts` |
| Preset loader | `src/lib/design-system/preset-loader.ts` |
| Theme validation | `src/lib/validations/theme.ts` |
| Wedding landing page | `src/app/(public)/w/[slug]/page.tsx` |
| Admin wedding list | `src/app/(auth)/admin/weddings/page.tsx` |
| Couple dashboard | `src/app/(auth)/dashboard/page.tsx` |

## Testing Commands

```bash
# Unit + component tests
npm run test

# E2E tests (requires dev server + Supabase)
npm run test:e2e --workers=1

# Lint
npm run lint

# Build check
npm run build
```

## Common Tasks

### Add a New Layout Preset

1. Create `src/components/layout-presets/preset-h.tsx`
2. Add preset CSS to `src/styles/presets/preset-h.css`
3. Register in `src/lib/design-system/preset-loader.ts`
4. Add to admin preset gallery in `src/app/(auth)/admin/weddings/[id]/page.tsx`
5. Add E2E test in `tests/e2e/guest-rsvp-mobile.spec.ts`

### Update Global Theme Default

1. Edit `DEFAULT_THEME` in `src/lib/design-system/theme.ts`
2. Update `globals.css` CSS variables if needed
3. Run `npm run test` to verify no regressions

### Test a Specific Preset

1. Navigate to admin page: `http://localhost:3000/admin/weddings/[id]`
2. Select preset from gallery
3. Click "Preview" to see guest view
4. Resize browser to mobile width (375px) to test mobile adaptation

## Debugging

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Glassmorphism not visible | `backdrop-filter` not supported | Check browser; fallback solid background should show |
| Preset CSS not loading | Wrong preset name in `layout_preset` | Verify value matches preset-loader registry |
| Mobile layout broken | Missing `viewport` meta tag | Check `layout.tsx` has `<meta name="viewport" ...>` |
| RSVP edit not showing | Cookie expired or blocked | Check browser dev tools → Application → Cookies |
| Theme not applying | `theme_json` invalid | Check server logs for Zod validation errors |

## Deployment Checklist

- [ ] All migrations applied to production
- [ ] `npm run test` passes (unit + component)
- [ ] `npm run test:e2e --workers=1` passes (all projects)
- [ ] `npm run build` succeeds without errors
- [ ] Mobile Lighthouse score ≥ 80 on `/w/[slug]`
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Cookie `SameSite` and `Secure` flags set for production
