import { copySync } from "https://deno.land/std@0.125.0/fs/copy.ts";

const SOURCE_DIR = "src";
const BUILD_DIR = "build";

export const build = async () => {
  const encoder = new TextEncoder();

  const result = await Deno.emit(`${SOURCE_DIR}/app.ts`, {
    "bundle": "module",
  });

  for (const [path, text] of Object.entries(result.files)) {
    const fileNameMatch = path.match(/^deno:\/\/\/(.*)$/);
    if (!fileNameMatch) {
      throw new Error(`Unexpected file produced by Deno.emit(): ${path}`);
    }
    const fileName = fileNameMatch[1];

    Deno.writeFileSync(`${BUILD_DIR}/${fileName}`, encoder.encode(text));
  }

  Deno.copyFileSync(`${SOURCE_DIR}/index.html`, `${BUILD_DIR}/index.html`);

  copySync(`${SOURCE_DIR}/shaders`, `${BUILD_DIR}/shaders`, { overwrite: true });

  copySync(`${SOURCE_DIR}/images`, `${BUILD_DIR}/images`, { overwrite: true });
};
