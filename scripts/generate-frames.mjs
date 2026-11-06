/**
 * Builds the web frame sets from the 4K originals.
 *
 *   npm run frames                 reads ../frames_4k_webp
 *   npm run frames -- <source dir> reads another folder
 *
 * frames-1080: desktop and tablet. frames-810: phones and save-data.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "..", "..", "frames_4k_webp"));
const PUBLIC = path.join(import.meta.dirname, "..", "public");
const SETS = [
  { dir: "frames-1080", width: 1920, height: 1080, quality: 82 },
  { dir: "frames-810", width: 1440, height: 810, quality: 80 },
];
const CONCURRENCY = 8;

async function main() {
  const names = fs.readdirSync(SOURCE).filter((name) => name.endsWith(".webp")).sort();
  if (!names.length) throw new Error(`No .webp frames found in ${SOURCE}`);

  for (const set of SETS) {
    const out = path.join(PUBLIC, set.dir);
    fs.mkdirSync(out, { recursive: true });
    let bytes = 0;
    for (let i = 0; i < names.length; i += CONCURRENCY) {
      await Promise.all(
        names.slice(i, i + CONCURRENCY).map(async (name) => {
          const info = await sharp(path.join(SOURCE, name))
            .resize(set.width, set.height, { kernel: "lanczos3" })
            .webp({ quality: set.quality, effort: 4 })
            .toFile(path.join(out, name));
          bytes += info.size;
        }),
      );
    }
    console.log(`${set.dir}: ${names.length} frames, ${(bytes / 1048576).toFixed(1)} MB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
