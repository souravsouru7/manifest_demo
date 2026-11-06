/**
 * Builds the video hero's web assets from the rendered loop.
 *
 *   npm run hero:video                      reads the newest .mp4 in the repo root
 *   npm run hero:video -- <file.mp4>        reads another file
 *   npm run hero:video -- --crossfade=1.5   longer dissolve at the loop point
 *   npm run hero:video -- --trim-tail=3     drops the last 3 frames first
 *
 * Writes public/hero/: the mp4 the hero plays and the poster it shows first.
 *
 * The render is meant to end where it begins but does not: measured over the
 * source, the last frame scores SSIM 0.79 against the first, which reads as a
 * jump every time the video wraps. So the tail is dissolved into the head here
 * rather than in the browser: the first CROSSFADE seconds are alpha-faded in
 * over the last CROSSFADE seconds, and that overlap becomes the new ending.
 * The clip loses those seconds and gains a wrap that lands one frame's worth of
 * motion before its own first frame, which is exactly what a loop should do.
 *
 * Everything is -an. A muted video is the only kind browsers reliably autoplay,
 * and the source carries an audio track the hero never plays.
 *
 * No webm: VP9 at matched quality came out larger than x264 on this footage
 * (2.06 MB against 1.93 MB), so the second file would cost bytes, not save them.
 * yuv420p h264 in mp4 plays everywhere the site runs.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "hero");
const NAME = "nature-loop";
const DEFAULT_CROSSFADE_S = 1;

const args = process.argv.slice(2);
const flag = (name, fallback) => Number(args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback);
const crossfade = flag("crossfade", DEFAULT_CROSSFADE_S);
const trimTail = flag("trim-tail", 0);
const sourceArg = args.find((arg) => !arg.startsWith("--"));

/** Newest .mp4 in the repo root, so a freshly rendered loop is picked up without naming it. */
function findSource() {
  const candidates = fs
    .readdirSync(ROOT)
    .filter((name) => name.toLowerCase().endsWith(".mp4"))
    .map((name) => path.join(ROOT, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!candidates.length) throw new Error(`No .mp4 found in ${ROOT}. Pass one: npm run hero:video -- <file.mp4>`);
  return candidates[0];
}

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function probe(file, entries) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", entries, "-of", "default=noprint_wrappers=1:nokey=1", file],
    { encoding: "utf8" },
  );
  return out.trim().split("\n");
}

const mb = (file) => `${(fs.statSync(file).size / 1048576).toFixed(2)} MB`;

/**
 * Head dissolved over tail. `main` is the clip from `crossfade` onward, so the
 * output opens on what was second 1; `jt` is the discarded head, faded up from
 * transparent and parked over main's final seconds.
 *
 * The alpha ramp finishes two frames before the overlap does. Run it the full
 * length and the closing frames still carry a few percent of the tail, which
 * the wrap shows as a ghost; ending early makes them pure head, so the last
 * frame differs from the first by motion alone.
 */
function loopFilter(duration, fps) {
  const start = (duration - 2 * crossfade).toFixed(4);
  const ramp = Math.max(crossfade - 2 / fps, 1 / fps).toFixed(4);
  return [
    "[0:v]split[body][pre]",
    `[pre]trim=duration=${crossfade},format=yuva420p,fade=t=in:st=0:d=${ramp}:alpha=1,setpts=PTS+${start}/TB[jt]`,
    `[body]trim=start=${crossfade},setpts=PTS-STARTPTS[main]`,
    "[main][jt]overlay=eof_action=pass,format=yuv420p[v]",
  ].join(";");
}

function main() {
  const source = path.resolve(sourceArg ?? findSource());
  if (!fs.existsSync(source)) throw new Error(`Not found: ${source}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const [rate, frames] = probe(source, "stream=r_frame_rate,nb_frames");
  const fps = Number(rate.split("/")[0]) / Number(rate.split("/")[1] || 1);
  console.log(`source: ${path.basename(source)} (${mb(source)}, ${frames} frames @ ${fps}fps)`);

  // -frames:v, not -t: a seam is counted in frames, so the trim is too.
  const kept = Number(frames) - trimTail;
  const trim = trimTail > 0 ? ["-frames:v", String(kept)] : [];
  if (trimTail > 0) console.log(`trimming ${trimTail} frame(s) from the tail`);

  const loop = crossfade > 0 ? ["-filter_complex", loopFilter(kept / fps, fps), "-map", "[v]"] : [];
  if (crossfade > 0) console.log(`crossfading ${crossfade}s of head over tail`);

  const mp4 = path.join(OUT_DIR, `${NAME}.mp4`);
  ffmpeg([
    "-i", source,
    "-an",
    ...trim,
    ...loop,
    "-c:v", "libx264",
    "-crf", "26",
    "-preset", "slow",
    "-pix_fmt", "yuv420p", // Safari decodes nothing else in a <video> tag
    "-movflags", "+faststart", // moov atom first, so playback starts before the file lands
    mp4,
  ]);
  const [outDuration] = probe(mp4, "format=duration");
  console.log(`${path.relative(ROOT, mp4)}: ${mb(mp4)}, ${Number(outDuration).toFixed(2)}s`);

  // Taken from the output, never the source: the crossfade moves the first frame.
  const poster = path.join(OUT_DIR, `${NAME}-poster.webp`);
  ffmpeg(["-i", mp4, "-frames:v", "1", "-c:v", "libwebp", "-quality", "80", poster]);
  console.log(`${path.relative(ROOT, poster)}: ${mb(poster)}`);
}

try {
  main();
} catch (error) {
  console.error(error.message ?? error);
  process.exit(1);
}
