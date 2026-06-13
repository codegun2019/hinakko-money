/**
 * Generate optimized PWA PNG icons from public/icons/icon-source.png.
 * Each size is resized independently — never copy 512 to smaller sizes.
 *
 * Run: npm run generate:icons
 */
import { mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");
const assetsDir = join(root, "assets");

const SOURCE = join(assetsDir, "icon-source.png");
const LEGACY_SOURCE = join(iconsDir, "icon-512.png");

const OUTPUTS = [
  { name: "icon-16.png",  size: 16,  palette: true  },
  { name: "icon-32.png",  size: 32,  palette: true  },
  { name: "icon-192.png", size: 192, palette: false },
  { name: "icon-512.png", size: 512, palette: false },
];

function pngOptions(palette) {
  return palette
    ? { compressionLevel: 9, palette: true, effort: 10 }
    : { compressionLevel: 9, quality: 82, effort: 10 };
}

async function writeIcon(source, dest, size, palette) {
  await sharp(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png(pngOptions(palette))
    .toFile(dest);
}

async function main() {
  mkdirSync(iconsDir, { recursive: true });
  mkdirSync(assetsDir, { recursive: true });

  if (!existsSync(SOURCE)) {
    if (!existsSync(LEGACY_SOURCE)) {
      console.error("Missing assets/icon-source.png — add a 512×512+ master PNG");
      process.exit(1);
    }
    copyFileSync(LEGACY_SOURCE, SOURCE);
    console.log("ℹ Created assets/icon-source.png from legacy icon-512.png");
  }

  for (const { name, size, palette } of OUTPUTS) {
    const dest = join(iconsDir, name);
    await writeIcon(SOURCE, dest, size, palette);
    console.log(`✓ ${name} (${size}×${size})`);
  }

  const appleDest = join(publicDir, "apple-touch-icon.png");
  await writeIcon(SOURCE, appleDest, 180, false);
  console.log("✓ apple-touch-icon.png (180×180)");

  console.log("\nDone — run `npm run build` to refresh SW precache hashes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
