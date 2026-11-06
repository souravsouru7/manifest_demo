/**
 * Builds the web derivatives for the below-hero sections.
 *
 * The package in TM_Manifesto_NonHero_Assets_Package/02_ASSETS ships 4K PNGs
 * (up to ~10 MB each). None of them should reach a browser as-is, so this writes
 * size-capped WebP copies to public/tm/sections/. next/image then serves
 * responsive widths from those.
 *
 * Cutouts keep their alpha and are trimmed to their visible bounds, so the
 * layout positions the object rather than an empty canvas around it.
 *
 *   npm run sections:assets
 */
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "TM_Manifesto_NonHero_Assets_Package", "02_ASSETS");
const OUT = path.join(root, "public", "tm", "sections");

/*
 * Some of the "scenic" sources carry a soft vignette blob baked into their
 * edges, so they are cropped to the clean interior (fractions of the source).
 * Three foliage cutouts still have a pale green smear left over from the
 * original board: the leaves themselves are almost fully saturated (S > 0.9)
 * while the smear is not (S 0.1-0.65), so a saturation key removes it.
 */
const CROP = {
  interior: { left: 0.07, top: 0.1, width: 0.86, height: 0.8 },
  courtyard: { left: 0.09, top: 0.1, width: 0.82, height: 0.8 },
  "kerala-hills": { left: 0.13, top: 0.13, width: 0.74, height: 0.74 },
  "green-hills": { left: 0.13, top: 0.13, width: 0.74, height: 0.74 },
  "mist-panorama": { left: 0.03, top: 0, width: 0.94, height: 1 },
  // The source ends in a hard-edged glow block; stop the line before it.
  "gold-journey": { left: 0, top: 0, width: 0.9, height: 1 },
};
// The gold graphics carry the same kind of low-saturation haze box around the line.
const KEY = new Set(["plant-left", "plant-right", "ferns", "gold-journey", "gold-orbit"]);

/** [source relative to 02_ASSETS, output name, max width, trim transparent edges] */
const JOBS = [
  ["EDITORIAL_IMAGES/warm_modern_interior.png", "interior", 2000, false],
  ["EDITORIAL_IMAGES/courtyard_aerial_architecture.png", "courtyard", 1600, false],
  ["EDITORIAL_IMAGES/kerala_hills_editorial.png", "kerala-hills", 1200, false],
  ["LANDSCAPE_LAYERS/kerala_mountain_mist_panorama.png", "mist-panorama", 2400, false],
  ["LANDSCAPE_LAYERS/green_hill_layer.png", "green-hills", 2400, false],
  ["GOLDEN_GRAPHICS/golden_journey_path.png", "gold-journey", 2400, true],
  ["GOLDEN_GRAPHICS/golden_orbit_path.png", "gold-orbit", 2000, true],
  ["PLANTS_FOLIAGE/left_tropical_plant.png", "plant-left", 1000, true],
  ["PLANTS_FOLIAGE/right_tropical_plant.png", "plant-right", 900, true],
  ["PLANTS_FOLIAGE/riverbank_shrubs.png", "shrubs", 2000, true],
  ["PLANTS_FOLIAGE/waterfall_edge_ferns.png", "ferns", 1400, true],
  ["WATER_FEATURES/rocky_stream_waterfall.png", "stream", 2400, true],
  ["PROCESS_ROCKS/01_discover_moss_rock.png", "rock-01", 1000, true],
  ["PROCESS_ROCKS/02_design_moss_rock.png", "rock-02", 1000, true],
  ["PROCESS_ROCKS/03_build_moss_rock.png", "rock-03", 1000, true],
  ["PROCESS_ROCKS/04_deliver_moss_rock.png", "rock-04", 1000, true],
  ["PROJECT_ARCHITECTURE/green_valley_project_house.png", "house-green-valley", 1600, true],
  ["PROJECT_ARCHITECTURE/echo_palm_project_house.png", "house-echo-palm", 1200, true],
  ["PROJECT_ARCHITECTURE/serene_woods_project_house.png", "house-serene-woods", 1200, true],
  ["SERVICE_ICONS/residential_home_icon.png", "icon-home", 192, true],
  ["SERVICE_ICONS/community_buildings_icon.png", "icon-community", 192, true],
  ["SERVICE_ICONS/interior_chair_icon.png", "icon-interior", 192, true],
  ["SERVICE_ICONS/sustainable_sprout_icon.png", "icon-sustainable", 192, true],
];

await mkdir(OUT, { recursive: true });

for (const [source, name, maxWidth, trim] of JOBS) {
  const input = path.join(SRC, source);
  const output = path.join(OUT, `${name}.webp`);

  let pipeline = sharp(input);
  const crop = CROP[name];
  if (crop) {
    const meta = await sharp(input).metadata();
    pipeline = pipeline.extract({
      left: Math.round(crop.left * meta.width),
      top: Math.round(crop.top * meta.height),
      width: Math.round(crop.width * meta.width),
      height: Math.round(crop.height * meta.height),
    });
    // sharp runs trim before extract inside one pipeline, so commit the crop first.
    pipeline = sharp(await pipeline.png().toBuffer());
  }
  if (KEY.has(name)) pipeline = sharp(await saturationKey(pipeline));
  if (trim) pipeline = pipeline.trim({ threshold: 1 });

  // Trim first, then size: the cap applies to what is actually visible.
  const buffer = await pipeline.png().toBuffer();
  const info = await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 90, effort: 5 })
    .toFile(output);

  const { size } = await stat(output);
  console.log(`${name.padEnd(22)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(5)} ${(size / 1024).toFixed(0)} KB`);
}

/** Fades out pixels by saturation: fully gone below S 0.7, fully kept above S 0.88. */
async function saturationKey(pipeline) {
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const s = max ? (max - min) / max : 0;
    const t = Math.min(1, Math.max(0, (s - 0.7) / 0.18));
    data[i + 3] = Math.round(data[i + 3] * t * t * (3 - 2 * t));
  }
  return sharp(data, { raw: info }).png().toBuffer();
}
