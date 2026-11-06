# Image credits and placeholder content

## Section artwork (`public/tm/sections/`)

Every image under `sections/` is derived from the supplied
`TM_Manifesto_NonHero_Assets_Package/02_ASSETS` (generated 4K PNGs). They are
regenerated with:

    npm run sections:assets

The script (`scripts/prepare-section-assets.mjs`) trims cutouts, crops the
baked-in vignettes off the scenic images, keys out a leftover green smear on
three foliage cutouts, and writes size-capped WebP. The 4K PNGs never reach
the browser; next/image serves responsive widths from these.

The house images in Featured Projects are **renders from the asset package, not
photographs of completed TM work**. Replace them with real project photography
before launch.

## Photography

- `sections/philosophy-interior.webp` — Unsplash photo
  [Pgd0ed7Dd0s](https://unsplash.com/photos/Pgd0ed7Dd0s) by Maverick Frame, under the
  [Unsplash License](https://unsplash.com/license) (free commercial use, no
  attribution required). Replaces the package's `warm_modern_interior`, which
  was upscaled and visibly soft. It is a stock photo, not a TM project.

## Placeholder copy — confirm before launch

Copied word for word from the supplied reference design and **not verified**:

- Featured project names and locations: Green Valley (Kozhikode), Echo Palm
  (Kochi), Serene Woods (Trivandrum) — `components/sections/FeaturedProjects.tsx`
- Testimonial and client name "Anitha & Rahul Menon, Kochi" —
  `components/sections/ClientsImpact.tsx`
- Impact figures 15+ Projects Delivered, 10K+ Happy Clients, 100% Quality
  Assurance — `components/sections/ClientsImpact.tsx`

## Original assets, kept

- `logo.png` — the brand mark, used by the hero nav, the loader and the footer.
- `07-testimonial-couple.png` (70x67) — the original testimonial avatar. It is
  undersized for its slot on a 2x screen; replace it together with the
  testimonial copy.
